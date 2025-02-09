import { DataContainer } from '../datasource/interface';
import type { Data } from '../datasource/interface';

export interface Retriever {
	setup: (dataContainer: DataContainer) => Promise<void>;
	getDocuments: (query: string, k: number) => Promise<Array<Data>>;
}
