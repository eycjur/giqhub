// ref: https://developer.chrome.com/docs/extensions/ai/prompt-api?hl=ja

import type { LLM } from './interface';

export class GeminiLLM implements LLM {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _session: any;
	private _isMemory: boolean;
	private _temperature: number;
	private _topK: number;
	private _systemPrompt: string;
	private _controller = new AbortController();

	constructor(
		systemPrompt: string,
		isMemory: boolean = true,
		_temperature: number = 0,
		topK: number = 3
	) {
		this._temperature = _temperature;
		this._isMemory = isMemory;
		this._topK = topK;
		this._systemPrompt = systemPrompt;
	}

	initSession() {
		this.initSessionAsync()
			.then(() => {
				console.log('initSession done');
			})
			.catch((error) => {
				console.error(error);
			});
	}

	private async initSessionAsync() {
		const isAvailable = await this.available();
		if (!isAvailable) {
			throw new Error('Gemini is not available');
		}

		// @ts-expect-error: window.ai is not common API
		this._session = await window.ai.languageModel.create({
			systemPrompt: this._systemPrompt,
			temperature: this._temperature,
			topK: this._topK,
			signal: this._controller.signal
		});
	}

	async available(): Promise<boolean> {
		if (!('ai' in window)) {
			return false;
		}
		// @ts-expect-error: window.ai is not common API
		const { available } = await window.ai.languageModel.capabilities();
		return available != 'no';
	}

	updateSystemPrompt(systemPrompt: string) {
		this._systemPrompt = systemPrompt;
		this.initSession();
	}

	async ainvoke(userPrompt: string): Promise<string> {
		if (!this._isMemory || !this._session) {
			console.log('initSession');
			await this.initSessionAsync();
			console.log('initSession done');
		}
		console.log(`session: ${this._session}`);
		return this._session.prompt(userPrompt);
	}

	async *astream(userPrompt: string): AsyncGenerator<string, void, unknown> {
		if (!this._isMemory || !this._session) {
			console.log('initSession');
			await this.initSessionAsync();
			console.log('initSession done');
		}
		console.log(`session: ${this._session}`);
		let chunk_stack = '';
		for await (const chunk of this._session.promptStreaming(userPrompt)) {
			chunk_stack += chunk;
			yield chunk_stack;
		}
	}
}
