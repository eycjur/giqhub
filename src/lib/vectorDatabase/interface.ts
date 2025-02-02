import { DataContainer } from '../datasource/interface';

export interface VectorDatabase {
	setup: (dataContainer: DataContainer) => Promise<void>;
	getDocuments: () => Promise<string[]>;
}
