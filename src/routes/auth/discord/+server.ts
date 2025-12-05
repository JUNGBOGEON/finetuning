import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDiscordAuthUrl } from '$lib/server/discord';

export const GET: RequestHandler = async ({ cookies }) => {
	// Generate a random state for CSRF protection
	const state = crypto.randomUUID();

	// Store state in a cookie for verification
	cookies.set('discord_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false, // Set to true in production with HTTPS
		maxAge: 60 * 10 // 10 minutes
	});

	const authUrl = getDiscordAuthUrl(state);
	redirect(302, authUrl);
};
