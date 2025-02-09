<script lang="ts">
	import Icon from '@iconify/svelte';
	import { githubApiKey, chatGPTApiKey, language, llmType, showSettings } from '$lib/stores';
	import * as m from '$lib/paraglide/messages';
	import { isChrome } from '$lib/util';
	import { IS_DEV } from '$lib/const';
	import localforage from 'localforage';
</script>

<button
	class="absolute right-4 top-4 z-50 rounded px-4 py-2 font-bold text-gray-800 hover:bg-gray-200"
	onclick={() => showSettings.set(!$showSettings)}
>
	<Icon icon="mdi:cog" class="inline-block text-xl" />
</button>

{#if $showSettings}
	<aside
		class="absolute right-0 top-0 z-20 w-80 border-l border-gray-300 bg-gray-100 p-4 sm:relative"
	>
		<h2 class="mb-4 text-lg font-semibold">{m.setting_title()}</h2>

		<div class="mb-4">
			<label for="githubApiKey" class="mb-1 block font-medium">{m.setting_github_api_key()}</label>
			<p class="mb-2 text-sm text-gray-600">
				{m.setting_github_api_key_description()}
				<br />
				<a
					href={m.setting_github_api_key_link_url()}
					target="_blank"
					rel="noopener noreferrer"
					class="prose text-sm text-blue-500 underline hover:text-blue-700"
					>{m.setting_github_api_key_link_text()}</a
				>
			</p>
			<input
				id="githubApiKey"
				type="text"
				placeholder={m.setting_github_api_key_placeholder()}
				class="w-full rounded border p-2"
				bind:value={$githubApiKey}
			/>
		</div>

		<div class="mb-4">
			<label for="llmType" class="mb-1 block font-medium">{m.setting_llm_type()}</label>
			<p class="mb-2 text-sm text-gray-600">{m.setting_llm_type_description()}</p>
			<select id="llmType" class="w-full rounded border p-2" bind:value={$llmType}>
				<option value="gemini" disabled={!isChrome()}>gemini(Chrome only)</option>
				<option value="chatgpt">chatgpt</option>
			</select>
		</div>

		{#if $llmType === 'chatgpt'}
			<div class="mb-4">
				<label for="chatGPTApiKey" class="mb-1 block font-medium"
					>{m.setting_chat_gpt_api_key()}</label
				>
				<p class="mb-2 text-sm text-gray-600">
					{m.setting_chat_gpt_api_key_description()}
					<br />
					<a
						href={m.setting_chat_gpt_api_key_link_url()}
						target="_blank"
						rel="noopener noreferrer"
						class="prose text-sm text-blue-500 underline hover:text-blue-700"
						>{m.setting_chat_gpt_api_key_link_text()}</a
					>
				</p>
				<input
					id="chatGPTApiKey"
					type="text"
					placeholder={m.setting_chat_gpt_api_key_placeholder()}
					class="w-full rounded border p-2"
					bind:value={$chatGPTApiKey}
				/>
			</div>
		{/if}

		<div class="mb-4">
			<label for="language" class="mb-1 block font-medium">{m.setting_language()}</label>
			<p class="mb-2 text-sm text-gray-600">{m.setting_language_description()}</p>
			<select id="language" class="w-full rounded border p-2" bind:value={$language}>
				<option value="en">English</option>
				<option value="ja">Japanese</option>
			</select>
		</div>

		{#if IS_DEV}
			<h2 class="mb-4 text-lg font-semibold">developer options</h2>
			<div class="mb-4">
				<label for="clearLocalStorage" class="mb-1 block font-medium">clear localStorage</label>
				<button
					id="clearLocalStorage"
					class="w-full rounded border p-2"
					onclick={() => localStorage.clear()}
				>
					clear localStorage
				</button>
			</div>

			<div class="mb-4">
				<label for="clearIndexedDB" class="mb-1 block font-medium">clear indexedDB</label>
				<button
					id="clearIndexedDB"
					class="w-full rounded border p-2"
					onclick={async () => {
						localforage.setDriver(localforage.INDEXEDDB);
						await localforage.clear();
					}}
				>
					clear indexedDB
				</button>
			</div>
		{/if}
	</aside>
{/if}
