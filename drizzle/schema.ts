import {
  pgTable, serial, text, integer, varchar, timestamp, numeric, jsonb, pgEnum, primaryKey, boolean,
} from 'drizzle-orm/pg-core';

// Enums
export const userRole = pgEnum('user_role', ['customer', 'pro', 'admin']);
export const userStatus = pgEnum('user_status', ['active', 'inactive']);
export const approvalStatus = pgEnum('approval_status', ['pending', 'approved', 'suspended']);
export const requestStatus = pgEnum('request_status', ['open', 'awarded', 'cancelled', 'expired']);
export const quoteStatus = pgEnum('quote_status', ['pending', 'withdrawn', 'rejected', 'accepted']);
export const jobStatus = pgEnum('job_status', ['pending', 'in_progress', 'done', 'disputed', 'cancelled']);
export const docType = pgEnum('doc_type', ['cedula_front', 'cedula_back', 'antecedentes_penales']);
export const docStatus = pgEnum('doc_status', ['pending', 'verified', 'rejected']);
export const reqTargetStatus = pgEnum('req_target_status', ['notified', 'viewed', 'declined']);
export const warrantyStatus = pgEnum('warranty_status', ['open', 'in_review', 'resolved', 'rejected']);

// Tablas
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  role: userRole('role').notNull().default('customer'),
  status: userStatus('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name'),
  photoUrl: text('photo_url'),
});

export const pros = pgTable('pros', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  experienceYears: integer('experience_years').notNull().default(0),
  coverageKm: integer('coverage_km').notNull().default(10),
  approvalStatus: approvalStatus('approval_status').notNull().default('pending'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  trialEndAt: timestamp('trial_end_at', { withTimezone: true }),
  isOnline: boolean('is_online').notNull().default(false), // 👈 AGREGAR ESTA LÍNEA
});

export const proDocuments = pgTable('pro_documents', {
  id: serial('id').primaryKey(),
  proId: integer('pro_id').notNull().references(() => pros.id, { onDelete: 'cascade' }),
  type: docType('type').notNull(),
  url: text('url').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  status: docStatus('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  icon: varchar('icon', { length: 60 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  label: varchar('label', { length: 120 }),
  street: text('street'),
  city: varchar('city', { length: 120 }),
  country: varchar('country', { length: 2 }).default('EC'),
  lat: numeric('lat', { precision: 10, scale: 7 }).notNull(),
  lng: numeric('lng', { precision: 10, scale: 7 }).notNull(),
  h3res8: varchar('h3_res8', { length: 20 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const serviceRequests = pgTable('service_requests', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => serviceCategories.id),
  addressId: integer('address_id').notNull().references(() => addresses.id),
  description: text('description').notNull(),
  photos: text('photos').array(),
  status: requestStatus('status').notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const requestTargets = pgTable('request_targets', {
  requestId: integer('request_id').notNull().references(() => serviceRequests.id, { onDelete: 'cascade' }),
  proId: integer('pro_id').notNull().references(() => pros.id, { onDelete: 'cascade' }),
  status: reqTargetStatus('status').notNull().default('notified'),
  rankingScore: numeric('ranking_score', { precision: 5, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.requestId, t.proId] }),
}));

export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id').notNull().references(() => serviceRequests.id, { onDelete: 'cascade' }),
  proId: integer('pro_id').notNull().references(() => pros.id, { onDelete: 'cascade' }),
  amountCents: integer('amount_cents').notNull(),
  estimatedHours: integer('estimated_hours'),
  message: text('message'),
  status: quoteStatus('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  quoteId: integer('quote_id').notNull().references(() => quotes.id),
  proId: integer('pro_id').notNull().references(() => pros.id),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  status: jobStatus('status').notNull().default('pending'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const jobMessages = pgTable('job_messages', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  text: text('text'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobs.id, { onDelete: 'set null' }),
  authorId: integer('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetProId: integer('target_pro_id').notNull().references(() => pros.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const warrantyClaims = pgTable('warranty_claims', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  status: warrantyStatus('status').notNull().default('open'),
  resolution: text('resolution'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 60 }).notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const proCategories = pgTable('pro_categories', {
  proId: integer('pro_id').notNull().references(() => pros.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => serviceCategories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.proId, t.categoryId] }),
}));