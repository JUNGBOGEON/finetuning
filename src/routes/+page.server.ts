import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { conversations } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect to login if not authenticated
	if (!locals.user) {
		redirect(302, '/login');
	}

	// Fetch user's conversations
	const userConversations = await db
		.select()
		.from(conversations)
		.where(eq(conversations.userId, locals.user.id))
		.orderBy(desc(conversations.updatedAt));

	return {
		user: locals.user,
		conversations: userConversations
	};
};
