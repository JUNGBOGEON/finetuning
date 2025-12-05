import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { conversations, messages } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET: 사용자의 모든 대화 목록 조회
export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userConversations = await db
			.select()
			.from(conversations)
			.where(eq(conversations.userId, user.id))
			.orderBy(desc(conversations.updatedAt));

		return json(userConversations);
	} catch (error) {
		console.error('Failed to fetch conversations:', error);
		return json({ error: 'Failed to fetch conversations' }, { status: 500 });
	}
};

// POST: 새 대화 생성
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { title, model } = await request.json();

		const [newConversation] = await db
			.insert(conversations)
			.values({
				userId: user.id,
				title: title || '새 대화',
				model: model || 'gemma3:4b'
			})
			.returning();

		return json(newConversation);
	} catch (error) {
		console.error('Failed to create conversation:', error);
		return json({ error: 'Failed to create conversation' }, { status: 500 });
	}
};
