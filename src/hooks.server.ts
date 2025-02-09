import type { Handle } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';
const handleParaglide: Handle = i18n.handle();
export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/giqhub')) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: `https://giqhub.com${event.url.pathname.replace('/giqhub', '')}`
			}
		});
	}

	return handleParaglide({ event, resolve });
};
