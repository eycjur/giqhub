<script lang="ts">
	import { GeminiLLM } from '$lib/llm/gemini';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import { LunrRetriever } from '$lib/retriever/lunr';
	import ChatHistoryComponent from '$lib/components/ChatHistoryComponent.svelte';
	import RepositorySummary from '$lib/components/RepositorySummary.svelte';
	import RepositoryTitle from '$lib/components/RepositoryTitle.svelte';
	import SampleQueries from '$lib/components/SampleQueries.svelte';
	import * as m from '$lib/paraglide/messages';
	import LinkButtonComponent from '$lib/components/LinkButtonComponent.svelte';
	import { showTemporaryModal } from '$lib/components/showModal';
	import GeminiModal from '$lib/components/GeminiModal.svelte';
	import SettingPanel from '$lib/components/SettingPanel.svelte';
	import { githubApiKey, llmType, chatGPTApiKey } from '$lib/stores';
	import { isChrome } from '$lib/util';
	import { dataSourceFactory } from '$lib/util';
	import { RAG } from '$lib/rag/rag';
	import Footer from '$lib/components/Footer.svelte';
	import { ChatHistory } from '$lib/chat/chat.svelte';
	import Icon from '@iconify/svelte';
	import { LLMType } from '$lib/const';
	import { ChatGPTLLM } from '$lib/llm/chatGPT';
	import ChatGPTModal from '$lib/components/ChatGPTModal.svelte';

	const systemPromptQuestionAnswer =
		'You are clever guide for this repository. Respond briefly to user input. You can use Markdown to format your response.';
	// Since it is a full text search, convert it to english so that the program can search it.
	const systemPromptGenerateQuery = `Translate the user input into English and generate a search query that is optimized for searchability. Provide only the rewritten query without explanations.`;

	let { data }: PageProps = $props();
	let owner = data.owner;
	let repo = data.repo;

	let query = $state('');
	let repositoryDescription = $state(m.repository_initial_description());
	let isLLMAvailable = $state(false);
	let dataSource = dataSourceFactory(owner, repo, $githubApiKey);

	let geminiLLM = new GeminiLLM(systemPromptQuestionAnswer);
	let geminiLLMNoContext = new GeminiLLM(systemPromptGenerateQuery, false);
	let chatgptLLM = new ChatGPTLLM(systemPromptQuestionAnswer, $chatGPTApiKey);
	let chatgptLLMNoContext = new ChatGPTLLM(systemPromptGenerateQuery, $chatGPTApiKey, false);
	let llm = $llmType === LLMType.gemini ? geminiLLM : chatgptLLM;
	let llmNoContext = $llmType === LLMType.gemini ? geminiLLMNoContext : chatgptLLMNoContext;

	let chatHistory = new ChatHistory();
	let lunrRetriever = new LunrRetriever();
	let rag = new RAG(owner, repo, llm, llmNoContext, chatHistory, lunrRetriever);

	async function prepare() {
		await dataSource.fetchData();
		dataSource.dataContainer.split();
		await lunrRetriever.setup(dataSource.dataContainer);
		console.log('LunrRetriever setup done');

		// Note: If it is too long, it will take time, so limit it to 3000 characters.
		// HACK: Update the system prompt to include the description.
		const systemPrompt = `${systemPromptQuestionAnswer}\n\nHere is the description of the repository\n<description>${dataSource.description.slice(0, 3000)}</description>`;
		llm.updateSystemPrompt(systemPrompt);
		const summaryGenerator = await rag.generateRepositorySummary();
		for await (const chunk of summaryGenerator) {
			repositoryDescription = chunk;
		}
	}

	githubApiKey.subscribe((value) => {
		dataSource = dataSourceFactory(owner, repo, value);
		prepare();
	});
	// Note: For gemini, After changing the settings, the browser will be restarted, so no polling is necessary.
	chatGPTApiKey.subscribe((value) => {
		if ($llmType !== LLMType.chatgpt) {
			return;
		}
		chatgptLLM = new ChatGPTLLM(systemPromptQuestionAnswer, value);
		chatgptLLMNoContext = new ChatGPTLLM(systemPromptGenerateQuery, value, false);
		llm = chatgptLLM;
		llmNoContext = chatgptLLMNoContext;
		chatgptLLM.available().then((value) => {
			isLLMAvailable = value;
		});
		rag.updateLLM(llm, llmNoContext);
		prepare();
	});
	llmType.subscribe((value) => {
		if (value === LLMType.gemini) {
			llm = geminiLLM;
			llmNoContext = geminiLLMNoContext;
		} else if (value === LLMType.chatgpt) {
			llm = chatgptLLM;
			llmNoContext = chatgptLLMNoContext;
		} else {
			throw new Error(`Unknown LLM type: ${value}`);
		}
		llm.available().then((value) => {
			isLLMAvailable = value;
		});
		clearChatHistory();
		rag.updateLLM(llm, llmNoContext);
		prepare();
	});

	async function handleSubmit(queryInput: string, event: SubmitEvent | MouseEvent | null = null) {
		if (event) {
			event.preventDefault();
		}
		if (!rag.isLLMProcessing) {
			query = '';
		}
		rag.query(queryInput, dataSource.description);
	}

	function clearChatHistory() {
		chatHistory.clear();
		llm.initSession();
	}

	onMount(async () => {
		if (!isChrome() && $llmType === LLMType.gemini) {
			// HACK: Hiding other modals using z-index
			showTemporaryModal(m.repository_not_supported_browser(), 'red', 2000, 5000);
			llmType.set(LLMType.chatgpt);
		}

		isLLMAvailable = await llm.available();
	});
</script>

<svelte:head>
	<title>giqhub - {owner}/{repo}</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<div class="flex flex-1">
		<div class="w-full p-4">
			<div class="container mx-auto space-y-4 p-4">
				<RepositoryTitle {owner} {repo} />
				<RepositorySummary {repositoryDescription} />

				<ChatHistoryComponent {chatHistory} />
				{#if chatHistory.history.length != 0}
					<button
						class="mx-auto mt-4 block rounded bg-gray-400 p-2 text-white"
						onclick={() => {
							clearChatHistory();
						}}
					>
						<Icon icon="mdi:reload" class="mr-2 inline-block" />
						{m.chat_history_new_conversation()}
					</button>
				{/if}

				<form onsubmit={(event) => handleSubmit(query, event)} class="mt-4 flex space-x-2">
					<input
						type="text"
						bind:value={query}
						placeholder="Enter your query"
						class="flex-1 rounded border p-2"
					/>
					<button
						type="submit"
						class="rounded bg-blue-500 p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
						disabled={!query}
					>
						Submit
					</button>
				</form>

				<SampleQueries {handleSubmit} />
			</div>
		</div>
		<SettingPanel />
	</div>
	<Footer />
</div>

<LinkButtonComponent />

{#if !isLLMAvailable && $llmType === LLMType.gemini}
	<GeminiModal />
{/if}
{#if !isLLMAvailable && $llmType === LLMType.chatgpt}
	<ChatGPTModal />
{/if}
