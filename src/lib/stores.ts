import { writable } from 'svelte/store';
import { SecureLocalStorageCache } from '$lib/cache/secureLocalStorageCache';
import { LocalStorageCache } from './cache/localStorageCache';
import { switchDisplayLanguage } from './util';
import { LLMType, filterValidLLM } from './const';
import { isAvailableLanguageTag } from '$lib/paraglide/runtime';
import { get } from 'svelte/store';

const secureCache = new SecureLocalStorageCache();
const cache = new LocalStorageCache();

export const githubApiKey = writable(secureCache.get('githubApiKey') || '');
githubApiKey.subscribe((value) => {
	console.log('githubApiKey changed');
	secureCache.set('githubApiKey', value);
});

export const chatGPTApiKey = writable(secureCache.get('chatGPTApiKey') || '');
chatGPTApiKey.subscribe((value) => {
	console.log('chatGPTApiKey changed');
	secureCache.set('chatGPTApiKey', value);
});

export const language = writable(cache.get('language') || '');
language.subscribe((value) => {
	console.log(`language changed: ${value}`);
	cache.set('language', value);
	switchDisplayLanguage(value);
});
if (get(language) === '') {
	let defaultLanguage = navigator.language;
	console.log(`navigator.language: ${defaultLanguage}`);
	if (!isAvailableLanguageTag(defaultLanguage)) {
		if (defaultLanguage === 'ja-JP') {
			defaultLanguage = 'ja';
		} else {
			defaultLanguage = 'en';
		}
	}
	language.set(defaultLanguage);
}

export const llmType = writable(filterValidLLM(cache.get('llmType')) || LLMType.gemini);
llmType.subscribe((value) => {
	console.log(`llmType changed: ${value}`);
	if (!filterValidLLM(value)) {
		console.error(`Invalid LLM type: ${value}`);
		return;
	}
	cache.set('llmType', value);
});

export const showSettings = writable(false);
