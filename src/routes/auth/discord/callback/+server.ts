import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exchangeCodeForToken } from '$lib/server/discord';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('discord_oauth_state');

	// Clear the state cookie
	cookies.delete('discord_oauth_state', { path: '/' });

	// Verify state to prevent CSRF
	if (!state || state !== storedState) {
		error(400, 'Invalid state parameter');
	}

	if (!code) {
		error(400, 'No authorization code provided');
	}

	try {
		const tokenData = await exchangeCodeForToken(code);

		// Store the access token in a cookie
		cookies.set('discord_access_token', tokenData.access_token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false, // Set to true in production with HTTPS
			maxAge: tokenData.expires_in
		});

		// Store refresh token for later use
		cookies.set('discord_refresh_token', tokenData.refresh_token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false, // Set to true in production with HTTPS
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});
	} catch (err) {
		console.error('OAuth error:', err);
		error(500, 'Failed to authenticate with Discord');
	}

	// Redirect to the main page after successful login
	redirect(302, '/');
};
