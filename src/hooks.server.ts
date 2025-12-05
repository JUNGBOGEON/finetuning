import type { Handle } from '@sveltejs/kit';
import { getDiscordUser, getAvatarUrl } from '$lib/server/discord';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get('discord_access_token');

	if (accessToken) {
		try {
			const discordUser = await getDiscordUser(accessToken);
			const avatarUrl = getAvatarUrl(discordUser);

			// 데이터베이스에서 사용자 조회 또는 생성
			let [dbUser] = await db
				.select()
				.from(users)
				.where(eq(users.discordId, discordUser.id));

			if (!dbUser) {
				// 새 사용자 생성
				[dbUser] = await db
					.insert(users)
					.values({
						discordId: discordUser.id,
						username: discordUser.username,
						globalName: discordUser.global_name,
						avatarUrl: avatarUrl
					})
					.returning();
			} else {
				// 기존 사용자 정보 업데이트
				[dbUser] = await db
					.update(users)
					.set({
						username: discordUser.username,
						globalName: discordUser.global_name,
						avatarUrl: avatarUrl,
						updatedAt: new Date()
					})
					.where(eq(users.discordId, discordUser.id))
					.returning();
			}

			// locals에 DB 사용자 정보 저장 (id 포함)
			event.locals.user = {
				id: dbUser.id,
				discordId: dbUser.discordId,
				username: dbUser.username,
				global_name: dbUser.globalName,
				email: dbUser.email,
				avatarUrl: dbUser.avatarUrl
			};
		} catch (error) {
			console.error('Auth error:', error);
			// Token expired or invalid, clear it
			event.cookies.delete('discord_access_token', { path: '/' });
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
