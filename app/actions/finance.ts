"use server";

import { db } from "@/db";
import { ledgers, transactions, debts, budgets } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Ledgers ---

export async function getLedgers() {
  return await db.select().from(ledgers).orderBy(desc(ledgers.createdAt));
}

export async function addLedger(data: { name: string; description?: string; color?: string }) {
  const result = await db.insert(ledgers).values(data).returning();
  revalidatePath("/");
  return result[0];
}

export async function deleteLedger(id: number) {
  await db.delete(ledgers).where(eq(ledgers.id, id));
  revalidatePath("/");
}

// --- Transactions ---

export async function getTransactions(ledgerId: number) {
  return await db.select()
    .from(transactions)
    .where(eq(transactions.ledgerId, ledgerId))
    .orderBy(desc(transactions.date));
}

export async function addTransaction(data: {
  ledgerId: number;
  type: string;
  amount: any; // numeric in DB, handles number or string from client
  category: string;
  description: string;
  date: string;
  debtId?: number;
}) {
  const result = await db.insert(transactions).values({
    ...data,
    amount: data.amount.toString(),
    date: new Date(data.date),
  }).returning();
  revalidatePath("/");
  return result[0];
}

export async function deleteTransaction(id: number) {
  await db.delete(transactions).where(eq(transactions.id, id));
  revalidatePath("/");
}

// --- Debts ---

export async function getDebts(ledgerId: number) {
  const allDebts = await db.select()
    .from(debts)
    .where(eq(debts.ledgerId, ledgerId))
    .orderBy(desc(debts.createdAt));

  // Fetch all transactions linked to these debts to calculate remaining balance
  const debtIds = allDebts.map(d => d.id);
  if (debtIds.length === 0) return [];

  const linkedTransactions = await db.select()
    .from(transactions)
    .where(inArray(transactions.debtId, debtIds));

  return allDebts.map(debt => {
    const repayments = linkedTransactions.filter(t => t.debtId === debt.id);
    const totalRepaid = repayments.reduce((acc, t) => acc + parseFloat(t.amount), 0);
    return {
      ...debt,
      remainingPrincipal: parseFloat(debt.amount) - totalRepaid,
      repayments
    };
  });
}

export async function addDebt(data: {
  ledgerId: number;
  person: string;
  amount: any;
  type: string;
  status: string;
  interestRate?: any;
  period?: number;
  processingFee?: any;
  startDate?: string;
  weight?: any;
  purity?: string;
  isGoldLoan?: boolean;
}) {
  const result = await db.insert(debts).values({
    ...data,
    amount: data.amount.toString(),
    interestRate: data.interestRate?.toString() || "0",
    processingFee: data.processingFee?.toString() || "0",
    startDate: data.startDate ? new Date(data.startDate) : new Date(),
    weight: data.weight ? data.weight.toString() : null,
    isGoldLoan: data.isGoldLoan || false,
  }).returning();
  revalidatePath("/");
  return result[0];
}

export async function updateDebtStatus(id: number, status: string) {
  await db.update(debts).set({ status }).where(eq(debts.id, id));
  revalidatePath("/");
}

export async function deleteDebt(id: number) {
  await db.delete(debts).where(eq(debts.id, id));
  revalidatePath("/");
}

// --- Budgets ---

export async function getBudgets(ledgerId: number) {
  return await db.select()
    .from(budgets)
    .where(eq(budgets.ledgerId, ledgerId))
    .orderBy(desc(budgets.createdAt));
}

export async function addBudget(data: {
  ledgerId: number;
  category: string;
  limit: any;
  icon: string;
  color: string;
}) {
  const result = await db.insert(budgets).values(data).returning();
  revalidatePath("/");
  return result[0];
}

export async function deleteBudget(id: number) {
  await db.delete(budgets).where(eq(budgets.id, id));
  revalidatePath("/");
}
