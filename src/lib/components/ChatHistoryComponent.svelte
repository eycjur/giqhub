<script lang="ts">
	import Icon from '@iconify/svelte';
	import { UserMessage, AIMessage, ChatHistory } from '$lib/chat/chat.svelte';
	import { md2html } from '$lib/util';
	import * as m from '$lib/paraglide/messages';

	export let chatHistory: ChatHistory;
</script>

<div class="mb-4">
	<h2 class="mb-4 text-2xl font-bold">{m.chat_history_title()}</h2>
	<div class="space-y-2">
		{#each chatHistory.history as chat}
			<div class="markdown-body prose !max-w-none rounded bg-gray-100 p-2">
				{#if chat instanceof UserMessage}
					<Icon icon="mdi:user" class="mr-2 inline-block" />
				{:else if chat instanceof AIMessage}
					<Icon icon="mdi:brain" class="mr-2 inline-block" />
				{/if}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html md2html(chat.content)}
				{#each chat.getUniqueNameReferences() as item}
					<button class="m-1 rounded bg-gray-200 p-1">
						<a href={item.url} target="_blank" rel="noopener noreferrer" class="flex items-center">
							<Icon icon="mdi:file" />
							{item.name}
						</a>
					</button>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.markdown-body {
		overflow-x: auto;
	}
</style>
