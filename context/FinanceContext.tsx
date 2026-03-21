"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  getLedgers, addLedger as dbAddLedger, deleteLedger as dbDeleteLedger,
  getTransactions, addTransaction as dbAddTransaction, deleteTransaction as dbDeleteTransaction,
  getDebts, addDebt as dbAddDebt, deleteDebt as dbDeleteDebt, updateDebtStatus as dbUpdateDebtStatus,
  getBudgets, addBudget as dbAddBudget, deleteBudget as dbDeleteBudget
} from "@/app/actions/finance";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  ledgerId: number;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Debt {
  id: number;
  ledgerId: number;
  person: string;
  amount: number;
  type: "owe_to" | "owed_by";
  status: "pending" | "partially_paid" | "paid";
  dueDate?: string;
}

export interface Ledger {
  id: number;
  name: string;
  description: string;
  color: string;
}

export interface Budget {
  id: number;
  ledgerId: number;
  category: string;
  limit: number;
  icon: string;
  color: string;
}

interface FinanceContextType {
  ledgers: Ledger[];
  currentLedgerId: number | null;
  transactions: Transaction[];
  debts: Debt[];
  budgets: Budget[];
  setCurrentLedgerId: (id: number) => void;
  addLedger: (ledger: Omit<Ledger, "id">) => Promise<void>;
  removeLedger: (id: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, "id" | "ledgerId">) => Promise<void>;
  removeTransaction: (id: number) => Promise<void>;
  addDebt: (debt: Omit<Debt, "id" | "ledgerId">) => Promise<void>;
  removeDebt: (id: number) => Promise<void>;
  updateDebtStatus: (id: number, status: Debt["status"]) => Promise<void>;
  addBudget: (budget: Omit<Budget, "id" | "ledgerId">) => Promise<void>;
  removeBudget: (id: number) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [currentLedgerId, setCurrentLedgerId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      const dbLedgers = await getLedgers();
      const castLedgers: Ledger[] = dbLedgers.map((l: any) => ({ 
        id: l.id,
        name: l.name,
        description: l.description || "", 
        color: l.color || "#3b82f6" 
      }));
      setLedgers(castLedgers);
      
      if (castLedgers.length > 0) {
        setCurrentLedgerId(castLedgers[0].id);
      }
    };
    init();
  }, []);

  // Fetch data for current ledger
  useEffect(() => {
    if (currentLedgerId) {
      const fetchData = async () => {
        const [dbTransactions, dbDebts, dbBudgets] = await Promise.all([
          getTransactions(currentLedgerId),
          getDebts(currentLedgerId),
          getBudgets(currentLedgerId)
        ]);
        
        setTransactions(dbTransactions.map((t: any) => ({
          ...t,
          amount: parseFloat(t.amount.toString()),
          type: t.type as TransactionType,
          date: t.date.toISOString()
        })));
        
        setDebts(dbDebts.map((d: any) => ({
          ...d,
          amount: parseFloat(d.amount.toString()),
          type: d.type as any,
          status: d.status as any,
          dueDate: d.dueDate?.toISOString()
        })));

        setBudgets(dbBudgets.map((b: any) => ({
          ...b,
          limit: parseFloat(b.limit.toString())
        })));
      };
      fetchData();
    }
  }, [currentLedgerId]);

  const addLedger = async (ledger: Omit<Ledger, "id">) => {
    const newDbLedger = await dbAddLedger(ledger);
    const newLedger = { ...newDbLedger, description: newDbLedger.description || "", color: newDbLedger.color || "#3b82f6" };
    setLedgers([newLedger, ...ledgers]);
    setCurrentLedgerId(newLedger.id);
  };

  const removeLedger = async (id: number) => {
    await dbDeleteLedger(id);
    setLedgers(ledgers.filter((l) => l.id !== id));
    if (currentLedgerId === id && ledgers.length > 1) {
      setCurrentLedgerId(ledgers.filter((l) => l.id !== id)[0].id);
    } else if (currentLedgerId === id) {
      setCurrentLedgerId(null);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, "id" | "ledgerId">) => {
    if (!currentLedgerId) return;
    const newDbTransaction = await dbAddTransaction({
      ...transaction,
      ledgerId: currentLedgerId,
      amount: transaction.amount.toString()
    });
    
    const formattedTransaction: Transaction = {
      ...newDbTransaction,
      id: Number(newDbTransaction.id),
      ledgerId: Number(newDbTransaction.ledgerId),
      amount: parseFloat(newDbTransaction.amount.toString()),
      type: newDbTransaction.type as TransactionType,
      date: newDbTransaction.date.toISOString()
    };
    
    setTransactions([formattedTransaction, ...transactions]);
  };

  const removeTransaction = async (id: number) => {
    await dbDeleteTransaction(id);
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const addDebt = async (debt: Omit<Debt, "id" | "ledgerId">) => {
    if (!currentLedgerId) return;
    const newDbDebt = await dbAddDebt({
      ...debt,
      ledgerId: currentLedgerId,
      amount: debt.amount.toString()
    });
    
    const formattedDebt: Debt = {
      ...newDbDebt,
      id: Number(newDbDebt.id),
      ledgerId: Number(newDbDebt.ledgerId),
      amount: parseFloat(newDbDebt.amount.toString()),
      type: newDbDebt.type as any,
      status: newDbDebt.status as any,
      dueDate: newDbDebt.dueDate?.toISOString()
    };
    
    setDebts([formattedDebt, ...debts]);
  };

  const removeDebt = async (id: number) => {
    await dbDeleteDebt(id);
    setDebts(debts.filter((d) => d.id !== id));
  };

  const updateDebtStatus = async (id: number, status: Debt["status"]) => {
    await dbUpdateDebtStatus(id, status);
    setDebts(debts.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  const addBudget = async (budget: Omit<Budget, "id" | "ledgerId">) => {
    if (!currentLedgerId) return;
    const newDbBudget = await dbAddBudget({
      ...budget,
      ledgerId: currentLedgerId,
      limit: budget.limit.toString()
    });
    
    setBudgets([{ ...newDbBudget, limit: parseFloat(newDbBudget.limit.toString()) }, ...budgets]);
  };

  const removeBudget = async (id: number) => {
    await dbDeleteBudget(id);
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  return (
    <FinanceContext.Provider
      value={{
        ledgers,
        currentLedgerId,
        transactions: transactions.filter((t) => t.ledgerId === currentLedgerId),
        debts: debts.filter((d) => d.ledgerId === currentLedgerId),
        budgets: budgets.filter((b) => b.ledgerId === currentLedgerId),
        setCurrentLedgerId,
        addLedger,
        removeLedger,
        addTransaction,
        removeTransaction,
        addDebt,
        removeDebt,
        updateDebtStatus,
        addBudget,
        removeBudget,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
