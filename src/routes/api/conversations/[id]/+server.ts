import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { conversations, messages } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';

// GET: 특정 대화의 메시지 목록 조회
export const GET: RequestHandler = async ({ params, locals }) => {
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

		// 메시지 목록 조회
		const conversationMessages = await db
			.select()
			.from(messages)
			.where(eq(messages.conversationId, conversationId))
			.orderBy(asc(messages.createdAt));

		return json({
			conversation,
			messages: conversationMessages
		});
	} catch (error) {
		console.error('Failed to fetch conversation:', error);
		return json({ error: 'Failed to fetch conversation' }, { status: 500 });
	}
};

// PATCH: 즐겨찾기 토글
export const PATCH: RequestHandler = async ({ params, locals, request }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const conversationId = parseInt(params.id);
	if (isNaN(conversationId)) {
		return json({ error: 'Invalid conversation ID' }, { status: 400 });
	}

	try {
		const body = await request.json();
		const { isFavorite } = body;

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

		// 즐겨찾기 상태 업데이트
		const [updated] = await db
			.update(conversations)
			.set({ isFavorite })
			.where(eq(conversations.id, conversationId))
			.returning();

		return json(updated);
	} catch (error) {
		console.error('Failed to update conversation:', error);
		return json({ error: 'Failed to update conversation' }, { status: 500 });
	}
};

// DELETE: 대화 삭제
export const DELETE: RequestHandler = async ({ params, locals }) => {
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

		// 메시지 먼저 삭제
		await db.delete(messages).where(eq(messages.conversationId, conversationId));
		// 대화 삭제
		await db.delete(conversations).where(eq(conversations.id, conversationId));

		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete conversation:', error);
		return json({ error: 'Failed to delete conversation' }, { status: 500 });
	}
};
