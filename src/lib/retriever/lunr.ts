// @ts-expect-error: lunr has no types
import lunr from 'lunr';
import type { Retriever } from './interface';
import { DataContainer } from '../datasource/interface';
import type { Data } from '../datasource/interface';

export class LunrRetriever implements Retriever {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _index: any = null;
	private _data: Array<Data> = [];

	async setup(dataContainer: DataContainer) {
		this._index = lunr(function () {
			// @ts-expect-error: lunr has no types
			this.field('name');
			// @ts-expect-error: lunr has no types
			this.field('content');
			// @ts-expect-error: lunr has no types
			this.field('url');

			dataContainer.data.forEach((data, i) => {
				// @ts-expect-error: lunr has no types
				this.add({
					id: i,
					name: data.name,
					content: data.content,
					url: data.url
				});
			});
		});
		this._data = dataContainer.data;
	}

	async getDocuments(query: string, k: number = 5): Promise<Array<Data>> {
		if (!this._index) {
			throw new Error('Lunr is not initialized');
		}
		const result = this._index.search(query);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result_index = result.map((r: any) => r.ref);
		return result_index.map((index: number) => this._data[index]).slice(0, k);
	}
}
