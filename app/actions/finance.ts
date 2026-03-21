"use server";

import { db } from "@/db";
import { ledgers, transactions, debts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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
}) {
  const result = await db.insert(transactions).values({
    ...data,
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
  return await db.select()
    .from(debts)
    .where(eq(debts.ledgerId, ledgerId))
    .orderBy(desc(debts.createdAt));
}

export async function addDebt(data: {
  ledgerId: number;
  person: string;
  amount: string;
  type: string;
  status: string;
  dueDate?: string;
}) {
  const result = await db.insert(debts).values({
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
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
