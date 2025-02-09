<script lang="ts">
	import { md2html } from '$lib/util';
	import * as m from '$lib/paraglide/messages';

	export let repositoryDescription: string;
</script>

<div class="mb-4">
	<h2 class="mb-2 text-2xl font-bold">{m.repository_summary_title()}</h2>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<p>{@html md2html(repositoryDescription)}</p>
</div>
