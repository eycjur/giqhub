<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	export let handleSubmit: (query: string, event: SubmitEvent | MouseEvent | null) => void;

	const sampleQueries = [m.sample_query_1(), m.sample_query_2(), m.sample_query_3()];
</script>

<div>
	<h2 class="mb-2 text-2xl font-bold">{m.sample_query_title()}</h2>
	{#each sampleQueries as sampleQuery}
		<button
			onclick={(event) => {
				handleSubmit(sampleQuery, event);
			}}
			class="mx-1 mt-4 rounded bg-gray-200 p-2 text-gray-800">{sampleQuery}</button
		>
	{/each}
</div>
