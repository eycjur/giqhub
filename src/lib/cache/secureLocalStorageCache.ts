import { LocalStorageCache } from './localStorageCache';
import CryptoJS from 'crypto-js';
import type { Cache } from './interface';

export class SecureLocalStorageCache implements Cache {
	private _key: string;
	private _cache: LocalStorageCache = new LocalStorageCache();

	constructor() {
		this._key = this.generateKey('giqhub');
	}

	private generateKey(prefix: string): string {
		const userAgent = navigator.userAgent;
		const language = navigator.language;
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		const uniqueData = `${prefix}|${userAgent}|${language}|${timezone}`;

		return CryptoJS.SHA256(uniqueData).toString();
	}

	get(key: string): string | null {
		const encryptedValue = this._cache.get(key);
		if (!encryptedValue) {
			return null;
		}
		try {
			const bytes = CryptoJS.AES.decrypt(encryptedValue, this._key);
			return bytes.toString(CryptoJS.enc.Utf8);
		} catch (e) {
			console.error(`Failed to decrypt. key: ${key}, error: ${e}`);
			this.delete(key);
			return null;
		}
	}

	set(key: string, value: string): void {
		const encryptedValue = CryptoJS.AES.encrypt(value, this._key).toString();
		this._cache.set(key, encryptedValue);
	}

	delete(key: string): void {
		this._cache.delete(key);
	}
}
