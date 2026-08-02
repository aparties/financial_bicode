import { pgTable, uuid, varchar, numeric, timestamp, integer } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  type: varchar("type", { length: 50 }).notNull().default("checking"), // 'checking', 'savings', 'credit', etc.
  currency: varchar("currency", { length: 10 }).notNull().default("PEN"), // 'PEN' | 'USD'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // 'income', 'expense', 'rent'
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("PEN"), // 'PEN' | 'USD'
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const liabilities = pgTable("liabilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  interestRate: numeric("interest_rate", { precision: 4, scale: 2 }).notNull().default("0.00"),
  type: varchar("type", { length: 50 }).notNull().default("financial"), // 'financial' (bancos) | 'personal' (personas) | 'tax' (SUNAT)
  dueDate: timestamp("due_date"),
  installmentAmount: numeric("installment_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  pendingInstallments: integer("pending_installments").notNull().default(0),
  currency: varchar("currency", { length: 10 }).notNull().default("PEN"), // 'PEN' | 'USD'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'paid', 'pending', 'overdue', 'unbilled'
  paymentTerms: varchar("payment_terms", { length: 50 }).notNull().default("immediate"), // 'immediate', '30_days', '60_days', 'custom'
  dueDate: timestamp("due_date"),
  currency: varchar("currency", { length: 10 }).notNull().default("PEN"), // 'PEN' | 'USD'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const propertiesAssets = pgTable("properties_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull().default("0.00"),
  type: varchar("type", { length: 50 }).notNull().default("property"), // 'property', 'servers', 'hardware', 'software_licenses'
  currency: varchar("currency", { length: 10 }).notNull().default("PEN"), // 'PEN' | 'USD'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projections = pgTable("projections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  estimatedRevenue: numeric("estimated_revenue", { precision: 12, scale: 2 }).notNull().default("0.00"),
  estimatedCost: numeric("estimated_cost", { precision: 12, scale: 2 }).notNull().default("0.00"),
  status: varchar("status", { length: 50 }).notNull().default("planned"), // 'planned', 'active', 'completed'
  currency: varchar("currency", { length: 10 }).notNull().default("PEN"), // 'PEN' | 'USD'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
