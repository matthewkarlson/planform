import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  json,
  unique,
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
  agencyId: integer('agency_id').references(() => agencies.id),
});

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  agencyId: integer('agency_id').references(() => agencies.id),
  websiteUrl: text('website_url'),
});

export const waitlistEntries = pgTable('waitlist_entries', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isVerified: boolean('is_verified').default(false),
  verificationToken: text('verification_token'),
  verificationTokenExpiresAt: timestamp('verification_token_expires_at'),
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

export const agencies = pgTable('agencies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  contactNumber: text('contact_number'),
  email: text('email'),
  bookingLink: text('booking_link'),
  description: text('description'),
  primaryColor: varchar('primary_color', { length: 20 }),
  secondaryColor: varchar('secondary_color', { length: 20 }),
  backgroundColor: varchar('background_color', { length: 20 }),
  textColor: varchar('text_color', { length: 20 }),
  apiKey: text('api_key').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isActive: boolean('is_active').default(true),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  agencyId: integer('agency_id').notNull().references(() => agencies.id),
  serviceId: varchar('service_id', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  outcomes: json('outcomes').$type<string[]>().notNull(),
  priceLower: integer('price_lower'),
  priceUpper: integer('price_upper'),
  whenToRecommend: json('when_to_recommend').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isActive: boolean('is_active').default(true),
}, (table) => [
  unique().on(table.serviceId, table.agencyId),
]);

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id),
  planData: json('plan_data').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  agencyId: integer('agency_id').references(() => agencies.id),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  activityLogs: many(activityLogs),
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
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

export const agenciesRelations = relations(agencies, ({ many }) => ({
  clients: many(clients),
  services: many(services),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [clients.agencyId],
    references: [agencies.id],
  }),
  plans: many(plans),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  agency: one(agencies, {
    fields: [services.agencyId],
    references: [agencies.id],
  }),
}));

export const plansRelations = relations(plans, ({ one }) => ({
  client: one(clients, {
    fields: [plans.clientId],
    references: [clients.id],
  }),
  agency: one(agencies, {
    fields: [plans.agencyId],
    references: [agencies.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;
export type NewWaitlistEntry = typeof waitlistEntries.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Agency = typeof agencies.$inferSelect;
export type NewAgency = typeof agencies.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
}
