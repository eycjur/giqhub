import type { Data } from '$lib/datasource/interface';

export class BaseMessage {
	public role: string;
	public content: string = $state('');
	public references: Array<Data>;

	constructor(role: string, content: string, references: Array<Data> = []) {
		this.role = role;
		this.content = content;
		this.references = references;
	}

	getUniqueNameReferences(): Array<Data> {
		return this.references.filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i);
	}
}

export class UserMessage extends BaseMessage {
	constructor(content: string) {
		super('user', content);
	}
}

export class AIMessage extends BaseMessage {
	constructor(content: string, references: Array<Data> = []) {
		super('ai', content, references);
	}
}

export class ChatHistory {
	_history: Array<BaseMessage> = $state([]);

	constructor(history: Array<BaseMessage> = []) {
		this._history = history;
	}

	addMessage(message: BaseMessage) {
		this._history.push(message);
	}

	updateLastContent(content: string) {
		if (this._history.length > 0) {
			this._history[this._history.length - 1].content = content;
		}
	}

	get history(): Array<BaseMessage> {
		return this._history;
	}

	clear() {
		this._history = [];
	}
}
