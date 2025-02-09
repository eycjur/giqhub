<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { language } from '$lib/stores';
</script>

<header class="bg-blue-600 py-12 text-white">
	<div class="container mx-auto px-4 text-center" style="position: relative;">
		<div class="absolute right-4">
			<button
				class="rounded bg-gray-200 px-4 py-2 font-bold text-gray-800 hover:opacity-75"
				on:click={() => language.update((prev) => (prev === 'en' ? 'ja' : 'en'))}
			>
				{$language === 'en' ? '日本語' : 'English'}
			</button>
		</div>
		<h1 class="text-4xl font-bold">
			gi<span class="font-bold text-red-500">q</span>hub
		</h1>
		<p class="mt-4 text-xl">{m.top_header_description()}</p>
	</div>
</header>
