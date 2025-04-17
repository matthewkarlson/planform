import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  isPremium: boolean('is_premium').default(false),
  remainingRuns: integer('remaining_runs').default(1),
  isVerified: boolean('is_verified').default(false),
});

// Arena page schema
export const ideas = pgTable('ideas', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: integer('owner_id').references(() => users.id).notNull(),
  title: text('title'),
  rawIdea: text('raw_idea'),
  idealCustomer: text('ideal_customer'),
  problem: text('problem'),
  currentSolutions: text('current_solutions'),
  valueProp: text('value_prop'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const stages = pgTable('stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  ideaId: uuid('idea_id').references(() => ideas.id).notNull(),
  stageName: text('stage_name'), // customer|designer|marketer|vc
  summary: jsonb('summary'),
  score: integer('score'),
  completedAt: timestamp('completed_at'),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  stageId: uuid('stage_id').references(() => stages.id).notNull(),
  role: text('role'), // 'user' | 'ai'
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const verificationTokens = pgTable('verification_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ideas: many(ideas),
  activityLogs: many(activityLogs),
}));

export const ideasRelations = relations(ideas, ({ one, many }) => ({
  owner: one(users, {
    fields: [ideas.ownerId],
    references: [users.id],
  }),
  stages: many(stages),
}));

export const stagesRelations = relations(stages, ({ one, many }) => ({
  idea: one(ideas, {
    fields: [stages.ideaId],
    references: [ideas.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  stage: one(stages, {
    fields: [messages.stageId],
    references: [stages.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
}
