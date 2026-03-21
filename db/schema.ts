import { pgTable, serial, text, numeric, timestamp, integer, boolean } from "drizzle-orm/pg-core";

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
  debtId: integer("debt_id").references(() => debts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  ledgerId: integer("ledger_id").references(() => ledgers.id, { onDelete: "cascade" }).notNull(),
  person: text("person").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // "owe_to" | "owed_by"
  status: text("status").notNull().default("pending"), // "pending" | "partially_paid" | "paid"
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).default("0"),
  period: integer("period").default(0), // months
  processingFee: numeric("processing_fee", { precision: 12, scale: 2 }).default("0"),
  startDate: timestamp("start_date").defaultNow(),
  weight: numeric("weight", { precision: 10, scale: 3 }), // grams
  purity: text("purity"), // e.g., 22k, 24k
  isGoldLoan: boolean("is_gold_loan").default(false),
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
