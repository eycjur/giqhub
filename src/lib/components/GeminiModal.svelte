<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { showTemporaryModal } from '$lib/components/showModal';

	const flags = [
		{
			flag: 'Enables optimization guide on device',
			value: 'Enabled BypassPerfRequirement',
			href: 'chrome://flags/#optimization-guide-on-device-model'
		},
		{
			flag: 'Text Safety Classifier',
			value: 'Enabled Executes safety classifier but no retraction of output',
			href: 'chrome://flags/#text-safety-classifier'
		},
		{
			flag: 'Prompt API for Gemini Nano',
			value: 'Enabled',
			href: 'chrome://flags/#prompt-api-for-gemini-nano'
		}
	];

	function onclick(url: string) {
		navigator.clipboard.writeText(url);
		showTemporaryModal(m.gemini_copied_to_clipboard(), 'green', 3000);
	}
</script>

<div
	class="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-500 bg-opacity-75"
>
	<div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
		<h2 class="mb-4 text-lg font-semibold text-gray-900">{m.gemini_modal_title()}</h2>
		<p class="mb-4 text-sm text-gray-700">
			{m.gemini_modal_description()}
		</p>
		<ol class="list-decimal pl-5 text-sm text-gray-700">
			<li class="mb-2">
				{m.gemini_open_flags()}
				<a
					href="chrome://flags"
					class="text-blue-500 hover:underline"
					target="_blank"
					rel="noopener noreferrer"
					onclick={() => onclick('chrome://flags')}>chrome://flags</a
				>
			</li>
			<li class="mb-2">
				{m.gemini_flags_description()}
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>Flag</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>Value</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each flags as { flag, value, href }}
							<tr>
								<td class="px-6 py-4 text-sm font-medium text-gray-900">
									<a
										{href}
										class="text-blue-500 hover:underline"
										target="_blank"
										rel="noopener noreferrer"
										onclick={() => onclick(href)}>{flag}</a
									>
								</td>
								<td class="px-6 py-4 text-sm text-gray-500">{value}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</li>
			<li>
				{m.gemini_restart()}
			</li>
		</ol>
	</div>
</div>
