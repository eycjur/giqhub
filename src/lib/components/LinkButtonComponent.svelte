<script lang="ts">
	import Icon from '@iconify/svelte';
	import * as m from '$lib/paraglide/messages';
	import { onMount } from 'svelte';

	type LinkItem = {
		href: string;
		icon: string;
		label: string;
		style: string;
	};
	let items: LinkItem[] = [];

	onMount(() => {
		const url = 'https://giqhub.com';

		items = [
			{
				href: '/home',
				icon: 'fa-solid:home',
				label: m.link_home_label(),
				style: '008000'
			},
			{
				href: m.link_feedback_url(),
				icon: 'fa-solid:comment',
				label: m.link_feedback_label(),
				style: 'FFA500'
			},
			{
				href: `http://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${m.link_twitter_text()}\n#giqhub\n`)}`,
				icon: 'fa-brands:twitter',
				label: m.link_twitter_label(),
				style: '1DA1F2'
			},
			{
				href: `http://www.facebook.com/share.php?u=${encodeURIComponent(url)}`,
				icon: 'fa-brands:facebook',
				label: m.link_facebook_label(),
				style: '1877F2'
			},
			{
				href: 'https://github.com/eycjur/giqhub',
				icon: 'fa-brands:github',
				label: m.link_repository_label(),
				style: '171515'
			},
			{
				href: 'https://github.com/sponsors/eycjur',
				icon: 'fa-solid:coffee',
				label: m.link_coffee_label(),
				style: '7b5544'
			}
		];
	});
</script>

<div class="fixed bottom-4 right-4 z-10 flex space-x-2">
	{#each items as item}
		<a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
			<button
				class="group rounded px-4 py-2 font-bold text-white hover:opacity-80"
				aria-label={item.label}
				style="background-color: #{item.style};"
			>
				<Icon icon={item.icon} />
				<!-- tooltip -->
				<span
					class="invisible absolute top-[-30px] -translate-x-1/2 whitespace-nowrap rounded bg-slate-600 p-1 text-[12px] font-bold text-white opacity-0 group-hover:visible group-hover:opacity-100"
				>
					{item.label}
				</span>
			</button>
		</a>
	{/each}
</div>
