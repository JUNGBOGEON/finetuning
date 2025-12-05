import type { Handle } from '@sveltejs/kit';
import { getDiscordUser } from '$lib/server/discord';

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get('discord_access_token');

	if (accessToken) {
		try {
			const user = await getDiscordUser(accessToken);
			event.locals.user = user;
		} catch {
			// Token expired or invalid, clear it
			event.cookies.delete('discord_access_token', { path: '/' });
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
