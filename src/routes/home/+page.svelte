<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import LinkButtonComponent from '$lib/components/LinkButtonComponent.svelte';
	import HeaderComponent from '$lib/components/HeaderComponent.svelte';
	import { md2html } from '$lib/util';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>{m.top_title()}</title>
</svelte:head>

<div class="bg-gray-100 text-gray-800">
	<HeaderComponent />

	<main class="container mx-auto mt-8 rounded bg-white px-4 py-8 shadow-md">
		<section id="about" class="mb-12">
			<h2 class="mb-4 text-2xl font-semibold">{m.top_about_title()}</h2>
			<p class="mb-4">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html md2html(m.top_about_description())}
			</p>
		</section>
		<section id="how-to-use" class="mb-12">
			<h2 class="mb-4 text-2xl font-semibold">{m.top_how_to_use_title()}</h2>
			<p class="mb-4">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html m.top_how_to_use_description({
					t: '<code class="bg-gray-200 p-1 rounded">t</code>',
					q: '<code class="bg-gray-200 p-1 rounded">q</code>'
				})}
			</p>
			<p>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html m.top_how_to_use_example({
					github:
						'<code class="bg-gray-200 p-1 rounded">https://gi<span class="text-red-600 font-bold">t</span>hub.com/owner/repo</code>',
					giqhub:
						'<code class="bg-gray-200 p-1 rounded">https://gi<span class="text-red-600 font-bold">q</span>hub.com/owner/repo</code>'
				})}
			</p>
		</section>

		<section id="features" class="mb-12">
			<h2 class="mb-4 text-2xl font-semibold">{m.top_features_title()}</h2>
			<div class="grid gap-6 md:grid-cols-3">
				<div class="rounded-lg border border-gray-200 bg-gray-50 p-6">
					<h3 class="mb-2 text-xl font-bold">{m.top_features_free_title()}</h3>
					<p>{m.top_features_free_description()}</p>
				</div>
				<div class="rounded-lg border border-gray-200 bg-gray-50 p-6">
					<h3 class="mb-2 text-xl font-bold">{m.top_features_easy_title()}</h3>
					<p>{m.top_features_easy_description()}</p>
				</div>
				<div class="rounded-lg border border-gray-200 bg-gray-50 p-6">
					<h3 class="mb-2 text-xl font-bold">{m.top_features_flexible_title()}</h3>
					<p>{m.top_features_flexible_description()}</p>
				</div>
			</div>
		</section>

		<section class="mb-12 space-x-2 text-center">
			<h2 class="mb-4 text-2xl font-semibold">{m.top_try_title()}</h2>
			<p class="mb-6">{m.top_try_description()}</p>
			<div class="flex flex-col md:flex-row md:justify-center md:space-x-4">
				<div class="my-4">
					<a
						href="/eycjur/giqhub"
						target="_blank"
						rel="noopener noreferrer"
						class="whitespace-nowrap rounded bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
					>
						eycjur/giqhub
					</a>
				</div>
				<div class="my-4">
					<a
						href="/f/awesome-chatgpt-prompts"
						target="_blank"
						rel="noopener noreferrer"
						class="whitespace-nowrap rounded bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
					>
						f/awesome-chatgpt-prompts
					</a>
				</div>
				<div class="my-4">
					<a
						href="/microsoft/markitdown"
						target="_blank"
						rel="noopener noreferrer"
						class="whitespace-nowrap rounded bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
					>
						microsoft/markitdown
					</a>
				</div>
			</div>
		</section>

		<section id="contribute" class="mb-12">
			<h2 class="mb-4 text-2xl font-semibold">{m.top_contribute_title()}</h2>
			<p class="mb-4">
				{m.top_contribute_description()}
			</p>
			<p>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html m.top_contribute_details({
					link_opening_tag: `<a
					href="https://github.com/eycjur/giqhub"
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-600 hover:underline">`,
					link_closing_tag: `</a
				>`
				})}
			</p>
		</section>
	</main>

	<LinkButtonComponent />

	<Footer />
</div>
