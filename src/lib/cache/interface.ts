export interface Cache {
	get(key: string): string | null;
	set(key: string, value: string): void;
	delete(key: string): void;
}

export interface AsyncCache {
	get(key: string): Promise<string | null>;
	set(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;
}
