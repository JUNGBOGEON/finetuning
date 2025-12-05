import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	// Clear all auth cookies
	cookies.delete('discord_access_token', { path: '/' });
	cookies.delete('discord_refresh_token', { path: '/' });

	redirect(302, '/login');
};
