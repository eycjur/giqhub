<script lang="ts">
	import Icon from '@iconify/svelte';
	export let owner: string;
	export let repo: string;
</script>

<h1 class="mb-4 space-x-2 text-4xl font-bold">
	<a href="/home" target="_blank" rel="noopener noreferrer"> giqhub </a>
	<span>-</span>
	<a href="https://github.com/{owner}/{repo}" target="_blank" rel="noopener noreferrer">
		{owner}/{repo}
		<Icon icon="octicon:mark-github-16" class="mx-1 inline" />
	</a>
</h1>
