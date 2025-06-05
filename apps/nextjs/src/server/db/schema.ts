import { pgTable, varchar, timestamp, text, boolean } from "drizzle-orm/pg-core";

// Example schema for users
export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(),
  email: varchar("email", { length: 256 }).unique().notNull(),
  name: varchar("name", { length: 256 }),
  photoUrl: varchar("photo_url", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Example schema for notes
export const notes = pgTable("notes", {
  id: varchar("id", { length: 256 }).primaryKey(), // PowerSync often uses client-generated UUIDs
  userId: varchar("user_id", { length: 256 }).notNull().references(() => users.id),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  category: varchar("category", { length: 256 }),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Soft delete for PowerSync
});

// Example schema for categories
export const categories = pgTable("categories", {
  id: varchar("id", { length: 256 }).primaryKey(), // PowerSync often uses client-generated UUIDs
  userId: varchar("user_id", { length: 256 }).notNull().references(() => users.id),
  name: varchar("name", { length: 256 }).notNull(),
  color: varchar("color", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Soft delete for PowerSync
}); 