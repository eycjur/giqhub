import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';
import { i18n } from '$lib/i18n';
import { goto } from '$app/navigation';
import { isAvailableLanguageTag } from '$lib/paraglide/runtime';
import { language } from './stores';
import { get } from 'svelte/store';
import { languageTag } from '$lib/paraglide/runtime';
import { GitHubDataSource, generateCachedOctokit } from '$lib/datasource/github';
import { GITHUB_PRIMARY_RATE_LIMIT_NO_AUTH, GITHUB_SECONDARY_RATE_LIMIT, IS_DEV } from '$lib/const';
import type { Token } from 'marked';

marked.setOptions({ breaks: true });
const renderer = new marked.Renderer();
renderer.link = function (link: Extract<Token, { type: 'link' }>) {
	const html = marked.Renderer.prototype.link.call(this, link);
	return html.replace('<a', "<a target='_blank' rel='noopener noreferrer'");
};
marked.use({ renderer });

export function md2html(md: string) {
	// @ts-expect-error: marked only return string
	return sanitizeHtml(marked(md));
}

export function switchDisplayLanguage(newLanguage: string) {
	if (!isAvailableLanguageTag(newLanguage)) {
		console.error(`Invalid language tag: ${newLanguage}`);
		return;
	}

	if (get(language) === languageTag()) {
		// If the language is already set, no need to switch
		return;
	}

	// HACK: When onmount, page.url.pathname becomes /, so use window.location.pathname in that case.
	const canonicalPath = i18n.route(window.location.pathname);
	const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
	goto(localisedPath);
}

export function dataSourceFactory(owner: string, repo: string, githubApiKey: string) {
	const octokit = generateCachedOctokit(githubApiKey);
	const rateLimit =
		githubApiKey != '' ? GITHUB_SECONDARY_RATE_LIMIT : GITHUB_PRIMARY_RATE_LIMIT_NO_AUTH;
	const rateLimitWithBuffer = IS_DEV ? Math.round(rateLimit / 5) : rateLimit - 10;
	return new GitHubDataSource(owner, repo, octokit, rateLimitWithBuffer);
}

export function isChrome() {
	const userAgent = window.navigator.userAgent.toLowerCase();
	console.log(`User agent: ${userAgent}`);
	if ('brave' in navigator) {
		// Brave browser
		return false;
	}
	if (userAgent.indexOf('msie') != -1) {
		// IE
		return false;
	}
	if (userAgent.indexOf('edge') != -1) {
		// Edge
		return false;
	}
	return userAgent.indexOf('chrome') != -1;
}
