import { pgTable, serial, integer, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	discordId: varchar('discord_id', { length: 255 }).notNull().unique(),
	username: varchar('username', { length: 255 }).notNull(),
	globalName: varchar('global_name', { length: 255 }),
	email: varchar('email', { length: 255 }),
	avatarUrl: text('avatar_url'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const conversations = pgTable('conversations', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id).notNull(),
	title: varchar('title', { length: 255 }).default('새 대화'),
	model: varchar('model', { length: 100 }).default('gemma3:4b'),
	isFavorite: boolean('is_favorite').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const messages = pgTable('messages', {
	id: serial('id').primaryKey(),
	conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
	role: varchar('role', { length: 50 }).notNull(), // 'user' | 'assistant' | 'system'
	content: text('content').notNull(),
	model: varchar('model', { length: 100 }),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
