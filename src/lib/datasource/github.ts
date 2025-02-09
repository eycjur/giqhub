import type { Data, DataSource } from './interface';
import { DataContainer } from './interface';
import { Octokit } from '@octokit/rest';
import { Buffer } from 'buffer';
import { showTemporaryModal } from '$lib/components/showModal';
import * as m from '$lib/paraglide/messages';
import { IndexedDBCache } from '$lib/cache/indexedDBCache';

export function generateCachedOctokit(githubApiKey: string) {
	const octokit = new Octokit({ auth: githubApiKey });
	const cache = new IndexedDBCache();

	const originalGetTree = octokit.rest.git.getTree;
	// @ts-expect-error: cache function receives any type
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	octokit.rest.git.getTree = async function (params: any) {
		const key = JSON.stringify(params);
		const data = await cache.get(key);
		if (data !== null) {
			console.log(`load from cache: octokit.rest.git.getTree`);
			return JSON.parse(data);
		}
		const result = await originalGetTree(params);
		cache.set(key, JSON.stringify(result));
		return result;
	};

	const originalGetContent = octokit.rest.repos.getContent;
	// @ts-expect-error: cache function receives any type
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	octokit.rest.repos.getContent = async function (params: any) {
		const key = JSON.stringify(params);
		const data = await cache.get(key);
		if (data !== null) {
			console.log(`load from cache: octokit.rest.repos.getContent`);
			return JSON.parse(data);
		}
		const result = await originalGetContent(params);
		cache.set(key, JSON.stringify(result));
		console.log(`result: ${JSON.stringify(result)}`);
		return result;
	};
	return octokit;
}

type tree = {
	path?: string;
	mode?: string;
	type?: string;
	sha?: string;
	size?: number;
	url?: string;
};

function sortTreeByExt(tree: tree[]) {
	const exts = tree.map((item: tree) => item.path?.split('.').pop());
	const ext_map_count = new Map();
	exts.forEach((ext?: string) => {
		ext_map_count.set(ext, (ext_map_count.get(ext) || 0) + 1);
	});
	const exts_sorted = Array.from(ext_map_count).sort((a, b) => b[1] - a[1]);

	let newTree: tree[] = [];
	for (let i = 0; i < exts_sorted.length; i++) {
		const ext = exts_sorted[i][0];
		const items = tree.filter((item: tree) => item.path?.split('.').pop() === ext);
		newTree = newTree.concat(items);
	}
	return newTree;
}

export class GitHubDataSource implements DataSource {
	private _octokit: Octokit;
	private _dataContainer: DataContainer;
	private _owner: string;
	private _repo: string;
	private _rateLimitWithBuffer: number;
	private _description: string = 'No description';

	constructor(owner: string, repo: string, octokit: Octokit, rateLimitWithBuffer: number = 50) {
		this._owner = owner;
		this._repo = repo;
		this._octokit = octokit;
		this._rateLimitWithBuffer = rateLimitWithBuffer;

		this._dataContainer = new DataContainer();
	}

	get description() {
		return this._description;
	}

	get dataContainer() {
		return this._dataContainer;
	}

	async fetchData() {
		try {
			const { data } = await this._octokit.rest.git.getTree({
				owner: this._owner,
				repo: this._repo,
				tree_sha: 'main',
				recursive: 'true'
			});
			if (!data) {
				console.error('Failed to get data from GitHub');
				return;
			}
			let tree = data.tree.filter((item: tree) => item.type === 'blob');

			if (tree.length > this._rateLimitWithBuffer) {
				tree = sortTreeByExt(tree);
				// Bring the md file first
				tree = [
					...tree.filter((item) => item.path?.split('.').pop() === 'md'),
					...tree.filter((item) => item.path?.split('.').pop() !== 'md')
				];
				tree = tree.slice(0, this._rateLimitWithBuffer);
			}

			// Get content asynchronously
			// @ts-expect-error: promise array
			const results: Array<Error | null | Data> = await Promise.all(
				tree.map(async (item) => {
					if (!item.path) {
						return null;
					}
					try {
						const content = await this._octokit.rest.repos.getContent({
							owner: this._owner,
							repo: this._repo,
							path: item.path
						});
						if (!('content' in content.data)) {
							return null;
						}
						return {
							name: item.path,
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							content: new (Buffer as any).from(
								content.data.content,
								content.data.encoding
							).toString(),
							url: `https://github.com/${this._owner}/${this._repo}/blob/main/${item.path}`
						};
					} catch (error) {
						return error;
					}
				})
			);
			for (const result of results) {
				if (!(result instanceof Error) && result !== null) {
					this._dataContainer.addData(result);
				}
			}
			const results_error = results.filter((data) => data instanceof Error);
			if (results_error.length > 0) {
				throw results_error[0];
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error(error);
			if (error.toString().includes('API rate limit exceeded')) {
				showTemporaryModal(m.github_ratelimit_exceeded(), 'red', 3000);
			} else if (error.toString().includes('Bad credentials')) {
				showTemporaryModal(m.github_bad_credentials(), 'red', 3000);
			} else {
				showTemporaryModal(`GitHub API Error: ${error.response.data.message}`, 'red', 3000);
			}
		}

		const readme =
			this._dataContainer.getDataFromName('README.md') ||
			this._dataContainer.getDataFromName('readme.md') ||
			this._dataContainer.getDataFromName('Readme.md');
		if (readme) {
			this._description = readme.content;
		}
	}
}
