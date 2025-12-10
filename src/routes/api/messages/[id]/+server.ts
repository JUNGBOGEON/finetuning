import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { messages, conversations } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// PUT: 메시지 수정
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const messageId = parseInt(params.id);
	if (isNaN(messageId)) {
		return json({ error: 'Invalid message ID' }, { status: 400 });
	}

	try {
		// 메시지 조회
		const [message] = await db
			.select()
			.from(messages)
			.where(eq(messages.id, messageId));

		if (!message) {
			return json({ error: 'Message not found' }, { status: 404 });
		}

		// 대화가 현재 사용자의 것인지 확인
		const [conversation] = await db
			.select()
			.from(conversations)
			.where(and(
				eq(conversations.id, message.conversationId),
				eq(conversations.userId, user.id)
			));

		if (!conversation) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { content } = await request.json();

		// 메시지 수정
		const [updatedMessage] = await db
			.update(messages)
			.set({ content })
			.where(eq(messages.id, messageId))
			.returning();

		return json(updatedMessage);
	} catch (error) {
		console.error('Failed to update message:', error);
		return json({ error: 'Failed to update message' }, { status: 500 });
	}
};

// DELETE: 메시지 삭제
export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const messageId = parseInt(params.id);
	if (isNaN(messageId)) {
		return json({ error: 'Invalid message ID' }, { status: 400 });
	}

	try {
		// 메시지 조회
		const [message] = await db
			.select()
			.from(messages)
			.where(eq(messages.id, messageId));

		if (!message) {
			return json({ error: 'Message not found' }, { status: 404 });
		}

		// 대화가 현재 사용자의 것인지 확인
		const [conversation] = await db
			.select()
			.from(conversations)
			.where(and(
				eq(conversations.id, message.conversationId),
				eq(conversations.userId, user.id)
			));

		if (!conversation) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		// 메시지 삭제
		await db
			.delete(messages)
			.where(eq(messages.id, messageId));

		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete message:', error);
		return json({ error: 'Failed to delete message' }, { status: 500 });
	}
};
