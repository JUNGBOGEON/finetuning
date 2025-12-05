import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI } from '$env/static/private';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_OAUTH_URL = 'https://discord.com/api/oauth2';

export interface DiscordTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	global_name: string | null;
}

export function getDiscordAuthUrl(state: string): string {
	const params = new URLSearchParams({
		client_id: DISCORD_CLIENT_ID,
		redirect_uri: DISCORD_REDIRECT_URI,
		response_type: 'code',
		scope: 'identify',
		state
	});

	return `${DISCORD_OAUTH_URL}/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<DiscordTokenResponse> {
	const params = new URLSearchParams({
		client_id: DISCORD_CLIENT_ID,
		client_secret: DISCORD_CLIENT_SECRET,
		grant_type: 'authorization_code',
		code,
		redirect_uri: DISCORD_REDIRECT_URI
	});

	const response = await fetch(`${DISCORD_OAUTH_URL}/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: params.toString()
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to exchange code for token: ${error}`);
	}

	return response.json();
}

export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
	const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new Error('Failed to fetch Discord user');
	}

	return response.json();
}

export function getAvatarUrl(user: DiscordUser): string {
	if (user.avatar) {
		return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
	}
	// Default avatar based on discriminator or user id
	const defaultIndex = user.discriminator === '0'
		? (BigInt(user.id) >> 22n) % 6n
		: parseInt(user.discriminator) % 5;
	return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}
