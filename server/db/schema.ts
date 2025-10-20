import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'developer', 'analyst', 'user']);
export const artifactTypeEnum = pgEnum('artifact_type', ['text', 'image', 'audio', 'video', 'code', 'document']);
export const workflowStatusEnum = pgEnum('workflow_status', ['draft', 'active', 'completed', 'failed']);
export const executionStatusEnum = pgEnum('execution_status', ['running', 'completed', 'failed']);
export const aiCategoryEnum = pgEnum('ai_category', ['NLP', 'CV', 'generation', 'analytics', 'audio', 'other']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI Services table
export const aiServices = pgTable('ai_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: aiCategoryEnum('category').notNull(),
  operationType: varchar('operation_type', { length: 100 }).notNull(),
  inputFormats: jsonb('input_formats').notNull().$type<string[]>(),
  outputFormats: jsonb('output_formats').notNull().$type<string[]>(),
  parameters: jsonb('parameters').$type<Record<string, any>>(),
  apiEndpoint: varchar('api_endpoint', { length: 500 }),
  apiKeyRequired: boolean('api_key_required').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Artifacts table
export const artifacts = pgTable('artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: artifactTypeEnum('type').notNull(),
  format: varchar('format', { length: 100 }).notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  sourceUrl: varchar('source_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workflows table
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  nodes: jsonb('nodes').notNull().$type<any[]>(),
  edges: jsonb('edges').notNull().$type<any[]>(),
  status: workflowStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workflow Executions table
export const workflowExecutions = pgTable('workflow_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').references(() => workflows.id).notNull(),
  status: executionStatusEnum('status').notNull().default('running'),
  logs: jsonb('logs').$type<any[]>(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

