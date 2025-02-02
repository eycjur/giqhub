<script lang="ts">
	import { GitHubDataSource, generateCachedOctokit } from '$lib/datasource/github';
	import { GeminiLLM } from '$lib/llm/gemini';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import { LunrVectorDatabase } from '$lib/vectorDatabase/lunr';
	import Icon from "@iconify/svelte";
	import { UserMessage, AIMessage, ChatHistory } from '$lib/chat/chat.svelte';
	import { marked } from 'marked';
	import sanitizeHtml from 'sanitize-html';

	let { data }: PageProps = $props();
	let owner = data.owner;
	let repo = data.repo;

	let dataSource = new GitHubDataSource(owner, repo, generateCachedOctokit());
	let query = $state('');
	let chatHistory = new ChatHistory();
	let repositoryDescription = $state('Getting repository description...');

	let lunrVectorDatabase = new LunrVectorDatabase();
	let gemini = new GeminiLLM("Respond briefly to user input.");

	let sampleQueries = [
		"What is the purpose of this repository?",
		"How do I use this repository?",
		"What are the features of this repository?"
	];

	async function handleSubmit(event: SubmitEvent | null = null) {
		if (event) {
			event.preventDefault();
		}
		console.log("Query submitted:", query);
		let searched_data = await lunrVectorDatabase.getDocuments(query);
		let searched_data_str = "";
		for (let i = 0; i < searched_data.length; i++) {
			searched_data_str += `<item><path>${searched_data[i].path}</path><content>${searched_data[i].content}</content></item>\n`;
		}
		
		let stream;
		try {
			stream = await gemini.invoke(`Please respond to the following query: \n<query>${query}</query>. Here is some context: \n<context>${searched_data_str}</context>`);
			chatHistory.addMessage(new UserMessage(query));
			chatHistory.addMessage(new AIMessage("Processing...", searched_data));
			query = '';
			for await (const chunk of stream) {
				chatHistory.updateLastContent(chunk);
			}
		} catch (e) {
			console.error(e);
			window.alert('Failed to communicate with Gemini');
			return;
		}
	}

	onMount(async () => {
		if (!(await gemini.available())) {
			console.error('Gemini is not available');
			window.alert('Gemini is not available');
			goto('/');
		}

		await dataSource.fetchData();
		dataSource.dataContainer.split();
		await lunrVectorDatabase.setup(dataSource.dataContainer);
		console.log("LunrVectorDatabase setup done");

		// HACK: 長すぎると時間がかかるので1000文字までに制限
		const stream = await gemini.invoke(`Please summarize the description of the repository ${owner}/${repo}.\n<description>${dataSource.description.slice(0, 1000)}</description>`);
		for await (const chunk of stream) {
			repositoryDescription = chunk;
		}
	});
</script>

<style>
	.markdown-body {
		overflow-x: auto;
	}
</style>

<div class="container mx-auto p-4">
	<h1 class="text-4xl font-bold mb-4" style="white-space: nowrap;">
		<a href="https://github.com/{owner}/{repo}" target="_blank" rel="noopener noreferrer" class="flex items-center">
			{owner}/{repo}
			<Icon icon="octicon:mark-github-16" class="mx-1"/>
		</a>
	</h1>
	<div class="mb-4">
		<h2 class="text-2xl font-bold mb-2">Repository Summary</h2>
		<p>{repositoryDescription}</p>
	</div>

	<div class="mb-4">
		<h2 class="text-2xl font-bold mb-4">Chat History</h2>
		<div class="space-y-2">
			{#each chatHistory.history as chat}
				<div class="bg-gray-100 p-2 rounded markdown-body">
					{#if chat instanceof UserMessage}
						<Icon icon="mdi:user" class="inline-block mr-2"/>
					{:else if chat instanceof AIMessage}
						<Icon icon="mdi:brain" class="inline-block mr-2"/>
					{/if}
					{@html sanitizeHtml(marked(chat.content))}
					{#each chat.getUniqueNameReferences() as item}
						<button class="bg-gray-200 p-1 rounded m-1">
							<a href="{item.url}" target="_blank" rel="noopener noreferrer" class="flex items-center">
								<Icon icon="mdi:file" />
								{item.name}
							</a>
						</button>
					{/each}
				</div>
			{/each}
		</div>
		<form onsubmit={handleSubmit} class="mt-4 flex space-x-2">
			<input type="text" bind:value={query} placeholder="Enter your query" class="border p-2 rounded flex-1" />
			<button type="submit" class="bg-blue-500 text-white p-2 rounded">Submit</button>
		</form>
	</div>

	<div>
		<h2 class="text-2xl font-bold mb-2">Sample query</h2>
		{#each sampleQueries as sampleQuery}
			<button onclick={
				() => {
					query = sampleQuery;
					handleSubmit();
				}
			} class="bg-gray-200 text-gray-800 p-2 rounded mt-4 mx-1">{sampleQuery}</button>
		{/each}
	</div>
</div>
