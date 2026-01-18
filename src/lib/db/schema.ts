import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const documents = sqliteTable('documents', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => users.id).notNull(),
	filePath: text('file_path').notNull(),
	provider: text('provider').notNull(),
	docType: text('doc_type').notNull(),
	metadata: text('metadata', { mode: 'json' }).notNull().default('{}'),
	fullText: text('full_text'),
	status: text('status').notNull().default('validated'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
