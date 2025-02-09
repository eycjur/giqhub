import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return {
		owner: params.owner,
		repo: params.repo
	};
};
