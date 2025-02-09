import { ChatHistory, UserMessage, AIMessage } from '$lib/chat/chat.svelte';
import * as m from '$lib/paraglide/messages';
import { showTemporaryModal } from '$lib/components/showModal';
import type { Retriever } from '$lib/retriever/interface';
import type { LLM } from '$lib/llm/interface';
import type { Data } from '$lib/datasource/interface';
import { LocalStorageCache } from '$lib/cache/localStorageCache';

export class RAG {
	private _owner: string;
	private _repo: string;
	private _llm: LLM;
	private _llmGenerateQuery: LLM;
	private _chatHistory: ChatHistory;
	private _retriever: Retriever;
	private _isCallingLLM = false;
	private _summaryCache = new LocalStorageCache();

	constructor(
		owner: string,
		repo: string,
		llm: LLM,
		llmGenerateQuery: LLM,
		chatHistory: ChatHistory,
		retriever: Retriever
	) {
		this._owner = owner;
		this._repo = repo;
		this._llm = llm;
		this._llmGenerateQuery = llmGenerateQuery;
		this._chatHistory = chatHistory;
		this._retriever = retriever;
	}

	async *generateRepositorySummary() {
		const key = `repositorySummary_${this._owner}/${this._repo}_${m.language()}`;
		const cached = this._summaryCache.get(key);
		if (cached) {
			yield cached;
			return;
		}

		const prompt = `Summarize the repository description for ${this._owner}/${this._repo} in ${m.language()} within approximately 200 characters.`;

		try {
			this._isCallingLLM = true;
			const stream = await this._llm.astream(prompt);
			let chunk = '';
			for await (chunk of stream) {
				// HACK: Remove code block(But i don't know why code block is included in the response)
				if (chunk.startsWith('```')) {
					chunk = chunk.slice(3);
					if (chunk.endsWith('```')) {
						chunk = chunk.slice(0, -3);
					}
				}
				yield chunk;
			}
			this._summaryCache.set(key, chunk);
		} catch (e) {
			console.error(e);
			showTemporaryModal(m.repository_error_communicate_llm(), 'red');
		} finally {
			this._isCallingLLM = false;
		}
	}

	async query(query: string, failoverContext: string = '') {
		if (this._isCallingLLM) {
			console.error(m.repository_error_llm_already_processing());
			showTemporaryModal(m.repository_error_llm_already_processing(), 'red');
			return;
		}

		this._isCallingLLM = true;
		this._chatHistory.addMessage(new UserMessage(query));

		console.log('Query submitted:', query);
		let query_processed;
		try {
			query_processed = await this._llmGenerateQuery.ainvoke(query);
		} catch (e) {
			console.error(`Failed to process query: ${e}`);
			query_processed = query;
		}
		console.log('Query processed:', query_processed);

		let searched_data: Array<Data> = [];
		let searched_data_str = '';
		try {
			searched_data = await this._retriever.getDocuments(query_processed, 5);
			console.log('Search result:', searched_data);
			if (searched_data.length != 0) {
				for (let i = 0; i < searched_data.length; i++) {
					searched_data_str += `<item><path>${searched_data[i].url}</path><content>${searched_data[i].content}</item>\n`;
				}
			} else {
				searched_data_str = failoverContext.slice(0, 3000);
			}
		} catch (e) {
			console.error(`Failed to retrieve data: ${e}`);
			searched_data_str = failoverContext.slice(0, 3000);
		}

		try {
			const stream = await this._llm.astream(
				`Generate a response in ${m.language()} to the following query: \n<query>${query}</query>. Consider the following context when formulating your response: \n<context>${searched_data_str}</context>`
			);
			this._chatHistory.addMessage(new AIMessage(m.repository_processing_message(), searched_data));
			for await (const chunk of stream) {
				this._chatHistory.updateLastContent(chunk);
			}
		} catch (e) {
			console.error(e);
			showTemporaryModal(m.repository_error_communicate_llm(), 'red');
		} finally {
			this._isCallingLLM = false;
		}
	}

	get isLLMProcessing() {
		return this._isCallingLLM;
	}

	updateLLM(llm: LLM, llmGenerateQuery: LLM) {
		this._llm = llm;
		this._llmGenerateQuery = llmGenerateQuery;
	}
}
