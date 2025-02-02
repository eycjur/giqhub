export interface LLM {
	available(): Promise<boolean>;
	invoke: (systemPrompt: string, userPrompt: string) => Promise<string>;
}
