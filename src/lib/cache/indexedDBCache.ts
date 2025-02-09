import type { AsyncCache } from './interface';
import localforage from 'localforage';

// Note: Multiple instances is currently not supported
export class IndexedDBCache implements AsyncCache {
	constructor() {
		localforage.setDriver(localforage.INDEXEDDB);
	}

	async get(key: string): Promise<string | null> {
		return await localforage.getItem(key);
	}

	async set(key: string, value: string): Promise<void> {
		await localforage.setItem(key, value);
	}

	async delete(key: string): Promise<void> {
		await localforage.removeItem(key);
	}
}
