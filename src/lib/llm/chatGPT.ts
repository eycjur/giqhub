import type { LLM } from './interface';
import { OpenAI } from 'openai';
import { showTemporaryModal } from '$lib/components/showModal';
import * as m from '$lib/paraglide/messages';

export class ChatGPTLLM implements LLM {
	private _session: Array<OpenAI.ChatCompletionMessageParam>;
	private _isMemory: boolean;
	private _temperature: number;
	private _systemPrompt: string;
	private _apiKey: string;
	private _client: OpenAI;

	constructor(
		systemPrompt: string,
		apiKey: string,
		isMemory: boolean = true,
		temperature: number = 0
	) {
		this._temperature = temperature;
		this._apiKey = apiKey;
		this._isMemory = isMemory;
		this._systemPrompt = systemPrompt;
		this._client = new OpenAI({ apiKey: this._apiKey, dangerouslyAllowBrowser: true });
		this._session = [{ role: 'developer', content: this._systemPrompt }];
	}

	initSession() {
		this._session = [{ role: 'developer', content: this._systemPrompt }];
	}

	async available(): Promise<boolean> {
		return this._apiKey !== '';
	}

	updateSystemPrompt(systemPrompt: string) {
		this._systemPrompt = systemPrompt;
		this.initSession();
	}

	async ainvoke(userPrompt: string): Promise<string> {
		if (!this._isMemory) {
			this.initSession();
		}

		let response: string;
		this._session = this._session.concat([{ role: 'user', content: userPrompt }]);
		try {
			const completion = await this._client.chat.completions.create({
				messages: this._session,
				model: 'gpt-4o',
				temperature: this._temperature
			});
			response = completion.choices[0].message.content || '';
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.error.message.includes('Incorrect API key provided')) {
				showTemporaryModal(m.chatgpt_api_key_incorrect(), 'red', 3000);
				response = '';
			} else {
				throw error;
			}
		}
		this._session = this._session.concat([{ role: 'assistant', content: response }]);
		return Promise.resolve(response);
	}

	async *astream(userPrompt: string): AsyncGenerator<string, void, unknown> {
		if (!this._isMemory) {
			this.initSession();
		}

		let chunk_content = '';
		this._session = this._session.concat([{ role: 'user', content: userPrompt }]);
		try {
			const stream = await this._client.chat.completions.create({
				messages: this._session,
				model: 'gpt-4o',
				temperature: this._temperature,
				stream: true
			});
			for await (const chunk of stream) {
				chunk_content += chunk.choices[0]?.delta?.content || '';
				yield chunk_content;
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.toString().includes('Incorrect API key provided')) {
				console.error(error);
				showTemporaryModal(m.chatgpt_api_key_incorrect(), 'red', 3000);
				return;
			} else {
				throw error;
			}
		}
		this._session.push({ role: 'assistant', content: chunk_content });
	}
}
