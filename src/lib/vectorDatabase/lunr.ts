// @ts-ignore
import lunr from 'lunr';
import type { VectorDatabase } from "./interface";
import { DataContainer } from '../datasource/interface';
import type { Data } from '../datasource/interface';

export class LunrVectorDatabase implements VectorDatabase {
	private _index: any = null;
	private _data: Array<Data> = [];

	async setup(dataContainer: DataContainer) {
		this._index = lunr(function () {
			// @ts-ignore
			this.field('name');
			// @ts-ignore
			this.field('content');
			// @ts-ignore
			this.field('url');

			dataContainer.data.forEach((data, i) => {
				// @ts-ignore
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

	// @ts-ignore
	async getDocuments(query: string, k: number = 5): Promise<Array[Data]> {
		if (!this._index) {
			throw new Error('Lunr is not initialized');
		}
		let result = this._index.search(query);
		let result_index = result.map((r: any) => r.ref);
		return result_index.map((index: number) => this._data[index]).slice(0, k);
	}
}
