import type { DataSource } from "./interface";
import { DataContainer } from "./interface";
import { Octokit } from "@octokit/rest";
import { SessionStorageCache } from "$lib/cache/sessionStorageCache";
import { Buffer } from 'buffer'


export function generateCachedOctokit() {
	let octokit = new Octokit();
	let cache = new SessionStorageCache();

	let originalGetTree = octokit.rest.git.getTree;
	// @ts-ignore
	octokit.rest.git.getTree = async function (params: any) {
		let key = JSON.stringify(params);
		let data = cache.get(key);
		if (data !== null) {
			console.log(`[octokit.rest.git.getTree] load from cache: ${key}`);
			return JSON.parse(data);
		}
		let result = await originalGetTree(params);
		cache.set(key, JSON.stringify(result));
		return result;
	};

	let originalGetContent = octokit.rest.repos.getContent;
	// @ts-ignore
	octokit.rest.repos.getContent = async function (params: any) {
		let key = JSON.stringify(params);
		let data = cache.get(key);
		if (data !== null) {
			console.log(`[octokit.rest.repos.getContent] load from cache: ${key}`);
			return JSON.parse(data);
		}
		let result = await originalGetContent(params);
		cache.set(key, JSON.stringify(result));
		return result;
	};
	return octokit;
}


export class GitHubDataSource implements DataSource {
	private _octokit: Octokit;
	private _dataContainer: DataContainer;
	private _owner: string;
	private _repo: string;
	private _rateLimitWithBuffer: number;
	private _description: string = "No description";

	constructor(owner: string, repo: string, octokit: Octokit | null = null, rateLimitWithBuffer: number = 50) {
		this._owner = owner;
		this._repo = repo;
		if (octokit) {
			this._octokit = octokit;
		} else {
			this._octokit = new Octokit();
		}
		this._rateLimitWithBuffer = rateLimitWithBuffer;

		this._dataContainer  = new DataContainer();
	}

	get description() {
		return this._description;
	}

	get dataContainer() {
		return this._dataContainer;
	}

	async fetchData() {
		try {
			let data;
			let recursive_choice = [-1, 5, 3, 2, 1];
			for (let recursive of recursive_choice) {
				let result = await this._octokit.rest.git.getTree({
					owner: this._owner,
					repo: this._repo,
					tree_sha: "main",
					recursive: `${recursive}`,
				});
				data = result.data;
				if (data.tree.length < this._rateLimitWithBuffer) {
					break;
				}
			}
			if (!data) {
				console.error("Failed to get data from GitHub");
				return;
			}
			for (const item of data.tree) {
				if (item.type !== "blob" || !item.path) {
					continue;
				}
				const content = await this._octokit.rest.repos.getContent({
					owner: this._owner,
					repo: this._repo,
					path: item.path,
				});
				if (!("content" in content.data)) {
					continue;
				}
				this._dataContainer.addData({
					name: item.path,
					content: new (Buffer as any).from(content.data.content, content.data.encoding).toString(),
					url: `https://github.com/${this._owner}/${this._repo}/blob/main/${item.path}`,
				});
				if (this._dataContainer.data.length >= this._rateLimitWithBuffer) {
					break;
				}
			}

		} catch (error) {
			console.error(error);
		}

		const readme = this._dataContainer.getDataFromName("README.md") || this._dataContainer.getDataFromName("readme.md") || this._dataContainer.getDataFromName("Readme.md");
		if (readme) {
			this._description = readme.content;
		}
	}
}
