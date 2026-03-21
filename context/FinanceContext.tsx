"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  ledgerId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Debt {
  id: string;
  ledgerId: string;
  person: string;
  amount: number;
  type: "owe_to" | "owed_by";
  status: "pending" | "partially_paid" | "paid";
  dueDate?: string;
}

export interface Ledger {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface FinanceContextType {
  ledgers: Ledger[];
  currentLedgerId: string;
  transactions: Transaction[];
  debts: Debt[];
  setCurrentLedgerId: (id: string) => void;
  addLedger: (ledger: Omit<Ledger, "id">) => void;
  removeLedger: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id" | "ledgerId">) => void;
  removeTransaction: (id: string) => void;
  addDebt: (debt: Omit<Debt, "id" | "ledgerId">) => void;
  removeDebt: (id: string) => void;
  updateDebtStatus: (id: string, status: Debt["status"]) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [currentLedgerId, setCurrentLedgerId] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Load from local storage
  useEffect(() => {
    const savedLedgers = localStorage.getItem("finance_ledgers");
    const savedTransactions = localStorage.getItem("finance_transactions");
    const savedDebts = localStorage.getItem("finance_debts");

    if (savedLedgers) {
      const parsed = JSON.parse(savedLedgers);
      setLedgers(parsed);
      if (parsed.length > 0) setCurrentLedgerId(parsed[0].id);
    } else {
      // Default ledger
      const defaultLedger = { id: "1", name: "Personal", description: "Default Ledger", color: "#3b82f6" };
      setLedgers([defaultLedger]);
      setCurrentLedgerId("1");
    }

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedDebts) setDebts(JSON.parse(savedDebts));
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("finance_ledgers", JSON.stringify(ledgers));
  }, [ledgers]);

  useEffect(() => {
    localStorage.setItem("finance_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("finance_debts", JSON.stringify(debts));
  }, [debts]);

  const addLedger = (ledger: Omit<Ledger, "id">) => {
    const newLedger = { ...ledger, id: Math.random().toString(36).substr(2, 9) };
    setLedgers([...ledgers, newLedger]);
  };

  const removeLedger = (id: string) => {
    setLedgers(ledgers.filter((l) => l.id !== id));
    setTransactions(transactions.filter((t) => t.ledgerId !== id));
    setDebts(debts.filter((d) => d.ledgerId !== id));
    if (currentLedgerId === id && ledgers.length > 1) {
      setCurrentLedgerId(ledgers.filter((l) => l.id !== id)[0].id);
    }
  };

  const addTransaction = (transaction: Omit<Transaction, "id" | "ledgerId">) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      ledgerId: currentLedgerId,
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const addDebt = (debt: Omit<Debt, "id" | "ledgerId">) => {
    const newDebt = {
      ...debt,
      id: Math.random().toString(36).substr(2, 9),
      ledgerId: currentLedgerId,
    };
    setDebts([newDebt, ...debts]);
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  const updateDebtStatus = (id: string, status: Debt["status"]) => {
    setDebts(debts.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  return (
    <FinanceContext.Provider
      value={{
        ledgers,
        currentLedgerId,
        transactions: transactions.filter((t) => t.ledgerId === currentLedgerId),
        debts: debts.filter((d) => d.ledgerId === currentLedgerId),
        setCurrentLedgerId,
        addLedger,
        removeLedger,
        addTransaction,
        removeTransaction,
        addDebt,
        removeDebt,
        updateDebtStatus,
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
