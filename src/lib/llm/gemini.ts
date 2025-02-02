// ref: https://developer.chrome.com/docs/extensions/ai/prompt-api?hl=ja

import type { LLM } from './interface';

export class GeminiLLM implements LLM {
	private _session: any = null;
	private _temperature: number;
	private _topK: number;
	private _systemPrompt: string;
	private _controller = new AbortController();

	constructor(systemPrompt: string, _temperature: number = 0, topK: number = 3) {
		this._temperature = _temperature;
		this._topK = topK;
		this._systemPrompt = systemPrompt;
	}

	async available(): Promise<boolean> {
		if (!( "ai" in window )) {
			return false;
		}
		// @ts-ignore
		const {available, defaultTemperature, defaultTopK, maxTopK } = await window.ai.languageModel.capabilities();
		return available != "no";
	}

	async invoke(userPrompt: string): Promise<string> {
		if (!this.available()) {
			throw new Error('Gemini is not available');
		}
		// @ts-ignore
		if (this._session === null) {
			// @ts-ignore
			this._session = await window.ai.languageModel.create({
				systemPrompt: this._systemPrompt,
				temperature: this._temperature,
				topK: this._topK,
				signal: this._controller.signal,
			});
		} else {
			this._controller.abort();
		}
		return this._session.promptStreaming(userPrompt);
	}
}
