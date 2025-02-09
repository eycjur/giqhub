<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { chatGPTApiKey, llmType } from '$lib/stores';
	import { isChrome } from '$lib/util';
	import { LLMType } from '$lib/const';
	import { showSettings } from '$lib/stores';
</script>

<div
	class="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-500 bg-opacity-75"
>
	<div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
		<h2 class="mb-4 text-lg font-semibold text-gray-900">{m.chatgpt_modal_title()}</h2>
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
			onchange={() => showSettings.set(true)}
		/>
		<p class="my-4 text-yellow-700">
			<b>{m.chatgpt_modal_footnote()}</b>
			{#if isChrome()}
				<button class="text-blue-500 underline" onclick={() => llmType.set(LLMType.gemini)}>
					{m.chatgpt_modal_switch_to_gemini()}
				</button>
			{/if}
		</p>
	</div>
</div>
