import { pgTable, serial, varchar, text, integer, timestamp, boolean, numeric, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'pro', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected', 'suspended']);
export const jobStatusEnum = pgEnum('job_status', ['pending', 'in_progress', 'done', 'disputed', 'cancelled']);
export const warrantyStatusEnum = pgEnum('warranty_status', ['open', 'reviewing', 'approved', 'rejected', 'resolved']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  role: userRoleEnum('role').notNull().default('customer'),
  status: userStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customers table
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pros table
export const pros = pgTable('pros', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  photoUrl: text('photo_url'),
  experienceYears: integer('experience_years').notNull(),
  bio: text('bio'),
  approvalStatus: approvalStatusEnum('approval_status').notNull().default('pending'),
  isOnline: boolean('is_online').notNull().default(false),
  lat: numeric('lat', { precision: 10, scale: 7 }),  // ← NUEVO
  lng: numeric('lng', { precision: 10, scale: 7 }),  // ← NUEVO
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Service Categories table
export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  iconName: varchar('icon_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pro Categories (many-to-many)
export const proCategories = pgTable('pro_categories', {
  id: serial('id').primaryKey(),
  proId: integer('pro_id').references(() => pros.id).notNull(),
  categoryId: integer('category_id').references(() => serviceCategories.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pro Documents table
export const proDocuments = pgTable('pro_documents', {
  id: serial('id').primaryKey(),
  proId: integer('pro_id').references(() => pros.id).notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  documentUrl: text('document_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Addresses table
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  label: varchar('label', { length: 100 }),
  street: text('street').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  lat: numeric('lat', { precision: 10, scale: 7 }).notNull(),
  lng: numeric('lng', { precision: 10, scale: 7 }).notNull(),
  h3Res8: varchar('h3_res8', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  h3Index: index('addresses_h3_res8_idx').on(table.h3Res8),
}));

// Service Requests table
export const serviceRequests = pgTable('service_requests', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  categoryId: integer('category_id').references(() => serviceCategories.id).notNull(),
  addressId: integer('address_id').references(() => addresses.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  photosUrls: text('photos_urls').array(),
  urgentMode: boolean('urgent_mode').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Request Targets (which pros were notified)
export const requestTargets = pgTable('request_targets', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id').references(() => serviceRequests.id).notNull(),
  proId: integer('pro_id').references(() => pros.id).notNull(),
  distance: numeric('distance', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Quotes table
export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id').references(() => serviceRequests.id).notNull(),
  proId: integer('pro_id').references(() => pros.id).notNull(),
  amountCents: integer('amount_cents').notNull(),
  estimatedHours: integer('estimated_hours'),
  message: text('message'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Jobs table
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id').references(() => serviceRequests.id).notNull(),
  quoteId: integer('quote_id').references(() => quotes.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  proId: integer('pro_id').references(() => pros.id).notNull(),
  status: jobStatusEnum('status').notNull().default('pending'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Job Messages table
export const jobMessages = pgTable('job_messages', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobs.id).notNull(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobs.id).notNull(),
  authorId: integer('author_id').references(() => customers.id).notNull(),
  targetProId: integer('target_pro_id').references(() => pros.id).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  payload: text('payload'),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIndex: index('notifications_user_id_idx').on(table.userId),
}));

// Warranty Claims table
export const warrantyClaims = pgTable('warranty_claims', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobs.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  proId: integer('pro_id').references(() => pros.id).notNull(),
  description: text('description').notNull(),
  photosUrls: text('photos_urls').array(),
  status: warrantyStatusEnum('status').notNull().default('open'),
  adminNotes: text('admin_notes'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  customer: one(customers, {
    fields: [users.id],
    references: [customers.userId],
  }),
  pro: one(pros, {
    fields: [users.id],
    references: [pros.userId],
  }),
  addresses: many(addresses),
  notifications: many(notifications),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  serviceRequests: many(serviceRequests),
  reviews: many(reviews),
}));

export const prosRelations = relations(pros, ({ one, many }) => ({
  user: one(users, {
    fields: [pros.userId],
    references: [users.id],
  }),
  categories: many(proCategories),
  documents: many(proDocuments),
  quotes: many(quotes),
  jobs: many(jobs),
  reviews: many(reviews),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  proCategories: many(proCategories),
  serviceRequests: many(serviceRequests),
}));

export const proCategoriesRelations = relations(proCategories, ({ one }) => ({
  pro: one(pros, {
    fields: [proCategories.proId],
    references: [pros.id],
  }),
  category: one(serviceCategories, {
    fields: [proCategories.categoryId],
    references: [serviceCategories.id],
  }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
  customer: one(customers, {
    fields: [serviceRequests.customerId],
    references: [customers.id],
  }),
  category: one(serviceCategories, {
    fields: [serviceRequests.categoryId],
    references: [serviceCategories.id],
  }),
  address: one(addresses, {
    fields: [serviceRequests.addressId],
    references: [addresses.id],
  }),
  quotes: many(quotes),
  targets: many(requestTargets),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  request: one(serviceRequests, {
    fields: [quotes.requestId],
    references: [serviceRequests.id],
  }),
  pro: one(pros, {
    fields: [quotes.proId],
    references: [pros.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  request: one(serviceRequests, {
    fields: [jobs.requestId],
    references: [serviceRequests.id],
  }),
  quote: one(quotes, {
    fields: [jobs.quoteId],
    references: [quotes.id],
  }),
  customer: one(customers, {
    fields: [jobs.customerId],
    references: [customers.id],
  }),
  pro: one(pros, {
    fields: [jobs.proId],
    references: [pros.id],
  }),
  messages: many(jobMessages),
  review: one(reviews),
  warrantyClaim: one(warrantyClaims),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  job: one(jobs, {
    fields: [reviews.jobId],
    references: [jobs.id],
  }),
  author: one(customers, {
    fields: [reviews.authorId],
    references: [customers.id],
  }),
  targetPro: one(pros, {
    fields: [reviews.targetProId],
    references: [pros.id],
  }),
}));

export const warrantyClaimsRelations = relations(warrantyClaims, ({ one }) => ({
  job: one(jobs, {
    fields: [warrantyClaims.jobId],
    references: [jobs.id],
  }),
  customer: one(customers, {
    fields: [warrantyClaims.customerId],
    references: [customers.id],
  }),
  pro: one(pros, {
    fields: [warrantyClaims.proId],
    references: [pros.id],
  }),
}));