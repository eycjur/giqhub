export interface DataSource {
	description: string;
	fetchData: (owner: string, repo: string) => Promise<void>;
}

export interface Data {
	name: string;
	content: string;
	url: string;
}

export class DataContainer {
	protected _dataArray: Data[] = [];

	addData(data: Data) {
		this._dataArray = [...this._dataArray, data];
	}

	getDataFromName(name: string): Data | undefined {
		return this._dataArray.find((data) => data.name === name);
	}

	split(chunksize: number = 500, separator: string = '\n\n') {
		const newDataArray: Data[] = [];
		for (const data of this._dataArray) {
			const chunks = data.content.split(separator);
			let remaining = '';
			for (let i = 0; i < chunks.length; i++) {
				if (remaining.length > 0 && remaining.length + chunks[i].length > chunksize) {
					newDataArray.push({
						name: data.name,
						content: remaining,
						url: data.url
					});
					remaining = chunks[i];
				} else {
					remaining += separator + chunks[i];
				}
			}
			if (remaining.length > 0) {
				newDataArray.push({
					name: data.name,
					content: remaining,
					url: data.url
				});
			}
		}
		this._dataArray = newDataArray;
	}

	get data() {
		return this._dataArray;
	}
}
