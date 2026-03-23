import { pgTable, serial, text, numeric, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const ledgers = pgTable("ledgers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3b82f6"),
  goldPrice24k: numeric("gold_price_24k", { precision: 12, scale: 2 }),
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

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  ledgerId: integer("ledger_id").references(() => ledgers.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // "gold" | "stock"
  name: text("name").notNull(),
  ticker: text("ticker"), // Ticker symbol for stocks
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(), // grams or shares
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }),
  currentPrice: numeric("current_price", { precision: 12, scale: 2 }),
  purity: numeric("purity", { precision: 4, scale: 1 }), // Karats (e.g. 24.0, 22.0)
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const allocations = pgTable("allocations", {
  id: serial("id").primaryKey(),
  ledgerId: integer("ledger_id").references(() => ledgers.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // estimated cost
  category: text("category").notNull(),
  type: text("type").notNull(), // "fixed" | "commodity"
  quantity: numeric("quantity", { precision: 12, scale: 2 }).default("1"),
  unit: text("unit").default("unit"), // kg, pack, etc.
  targetDay: integer("target_day"), // day of month for the obligation
  createdAt: timestamp("created_at").defaultNow(),
});
