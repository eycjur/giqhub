export class SessionStorageCache {
	get(key: string): string | null {
		return sessionStorage.getItem(key);
	}

	set(key: string, value: string): void {
		sessionStorage.setItem(key, value);
	}
}
