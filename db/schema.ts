import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";

export const ledgers = pgTable("ledgers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3b82f6"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  ledgerId: integer("ledger_id").references(() => ledgers.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // "income" | "expense"
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  ledgerId: integer("ledger_id").references(() => ledgers.id, { onDelete: "cascade" }).notNull(),
  person: text("person").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // "owe_to" | "owed_by"
  status: text("status").notNull(), // "pending" | "partially_paid" | "paid"
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  ledgerId: integer("ledger_id").references(() => ledgers.id, { onDelete: "cascade" }).notNull(),
  category: text("category").notNull(),
  limit: numeric("limit", { precision: 12, scale: 2 }).notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
