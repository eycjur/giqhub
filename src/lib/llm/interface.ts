export interface LLM {
	available(): Promise<boolean>;
	updateSystemPrompt(systemPrompt: string): void;
	ainvoke: (userPrompt: string) => Promise<string>;
	astream: (userPrompt: string) => AsyncGenerator<string, void, unknown>;
	initSession: () => void;
}
