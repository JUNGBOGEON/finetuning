import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { conversations, messages } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// POST: 대화에 메시지 추가
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const conversationId = parseInt(params.id);
	if (isNaN(conversationId)) {
		return json({ error: 'Invalid conversation ID' }, { status: 400 });
	}

	try {
		// 대화가 현재 사용자의 것인지 확인
		const [conversation] = await db
			.select()
			.from(conversations)
			.where(and(
				eq(conversations.id, conversationId),
				eq(conversations.userId, user.id)
			));

		if (!conversation) {
			return json({ error: 'Conversation not found' }, { status: 404 });
		}

		const { role, content, model } = await request.json();

		// 메시지 추가
		const [newMessage] = await db
			.insert(messages)
			.values({
				conversationId,
				role,
				content,
				model
			})
			.returning();

		// 대화의 updatedAt 업데이트 및 첫 메시지면 제목 업데이트
		const updateData: { updatedAt: Date; title?: string } = {
			updatedAt: new Date()
		};

		// 첫 사용자 메시지면 제목으로 설정 (최대 50자)
		if (role === 'user' && conversation.title === '새 대화') {
			updateData.title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
		}

		await db
			.update(conversations)
			.set(updateData)
			.where(eq(conversations.id, conversationId));

		return json(newMessage);
	} catch (error) {
		console.error('Failed to add message:', error);
		return json({ error: 'Failed to add message' }, { status: 500 });
	}
};
