import { dev } from '$app/environment';

// https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#primary-rate-limit-for-unauthenticated-users
export const GITHUB_PRIMARY_RATE_LIMIT_NO_AUTH = 60;
// https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
export const GITHUB_SECONDARY_RATE_LIMIT = 100;

export const IS_DEV = dev;
if (IS_DEV) {
	console.log('dev mode');
}

// enum
export const LLMType = {
	gemini: 'gemini',
	chatgpt: 'chatgpt'
};
export function filterValidLLM(llm: string | null) {
	if (llm === LLMType.gemini || llm === LLMType.chatgpt) {
		return llm;
	}
	return null;
}
