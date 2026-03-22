"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  getLedgers, addLedger as dbAddLedger, deleteLedger as dbDeleteLedger,
  getTransactions, addTransaction as dbAddTransaction, deleteTransaction as dbDeleteTransaction,
  getDebts, addDebt as dbAddDebt, deleteDebt as dbDeleteDebt, updateDebtStatus as dbUpdateDebtStatus,
  getAssets, addAsset as dbAddAsset, deleteAsset as dbDeleteAsset, updateAssetPrice as dbUpdateAssetPrice,
  getAllocations, addAllocation as dbAddAllocation, deleteAllocation as dbDeleteAllocation,
  updateLedgerGoldPrice as dbUpdateGoldPrice
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
  debtId?: number;
}

export interface Debt {
  id: number;
  ledgerId: number;
  person: string;
  amount: number;
  type: "owe_to" | "owed_by";
  status: "pending" | "partially_paid" | "paid";
  interestRate: number;
  period: number;
  processingFee: number;
  startDate: string;
  weight?: number;
  purity?: string;
  isGoldLoan?: boolean;
  remainingPrincipal: number;
}

export interface Ledger {
  id: number;
  name: string;
  description: string;
  color: string;
  goldPrice24k?: number;
}


export interface Asset {
  id: number;
  ledgerId: number;
  type: "gold" | "stock";
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purity?: number;
  date: string;
}

export interface Allocation {
  id: number;
  ledgerId: number;
  name: string;
  amount: number;
  category: string;
  type: "fixed" | "commodity";
  quantity: number;
  unit: string;
  targetDay?: number;
  createdAt: string;
}

interface FinanceContextType {
  ledgers: Ledger[];
  currentLedgerId: number | null;
  transactions: Transaction[];
  debts: Debt[];
  assets: Asset[];
  allocations: Allocation[];
  setCurrentLedgerId: (id: number) => void;
  addLedger: (ledger: Omit<Ledger, "id">) => Promise<void>;
  removeLedger: (id: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, "id" | "ledgerId">) => Promise<void>;
  removeTransaction: (id: number) => Promise<void>;
  addDebt: (debt: Omit<Debt, "id" | "ledgerId">) => Promise<void>;
  removeDebt: (id: number) => Promise<void>;
  updateDebtStatus: (id: number, status: Debt["status"]) => Promise<void>;
  addAsset: (asset: Omit<Asset, "id" | "ledgerId">) => Promise<void>;
  removeAsset: (id: number) => Promise<void>;
  addAllocation: (allocation: Omit<Allocation, "id" | "ledgerId" | "createdAt">) => Promise<void>;
  removeAllocation: (id: number) => Promise<void>;
  updateAssetPrice: (id: number, price: number) => Promise<void>;
  updateGoldPrice: (price24k: number) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [currentLedgerId, setCurrentLedgerId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      const dbLedgers = await getLedgers();
      const castLedgers: Ledger[] = dbLedgers.map((l: any) => ({ 
        id: l.id,
        name: l.name,
        description: l.description || "", 
        color: l.color || "#3b82f6",
        goldPrice24k: l.goldPrice24k ? parseFloat(l.goldPrice24k.toString()) : 0
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
        const [dbTransactions, dbDebts, dbAssets, dbAllocations] = await Promise.all([
          getTransactions(currentLedgerId),
          getDebts(currentLedgerId),
          getAssets(currentLedgerId),
          getAllocations(currentLedgerId)
        ]);
        
        setTransactions(dbTransactions.map((t: any) => ({
          ...t,
          amount: parseFloat(t.amount.toString()),
          type: t.type as TransactionType,
          date: t.date.toISOString(),
          debtId: t.debtId || undefined
        })));
        
        setDebts(dbDebts.map((d: any) => ({
          ...d,
          amount: parseFloat(d.amount.toString()),
          interestRate: parseFloat(d.interestRate?.toString() || "0"),
          period: d.period || 0,
          processingFee: parseFloat(d.processingFee?.toString() || "0"),
          type: d.type as any,
          status: d.status as any,
          startDate: d.startDate?.toISOString(),
          weight: parseFloat(d.weight?.toString() || "0"),
          purity: d.purity || undefined,
          isGoldLoan: d.isGoldLoan || false,
          remainingPrincipal: parseFloat(d.remainingPrincipal?.toString() || "0"),
        })));


        setAssets(dbAssets.map((a: any) => ({
          ...a,
          type: a.type as "gold" | "stock",
          quantity: parseFloat(a.quantity.toString()),
          purchasePrice: parseFloat(a.purchasePrice?.toString() || "0"),
          currentPrice: parseFloat(a.currentPrice?.toString() || "0"),
          purity: a.purity ? parseFloat(a.purity.toString()) : undefined,
          date: a.date?.toISOString()
        })));

        setAllocations(dbAllocations.map((al: any) => ({
          ...al,
          amount: parseFloat(al.amount.toString()),
          quantity: parseFloat(al.quantity?.toString() || "1"),
          unit: al.unit || "unit",
          targetDay: al.targetDay || undefined,
          createdAt: al.createdAt?.toISOString()
        })));
      };
      fetchData();
    }
  }, [currentLedgerId]);

  const addLedger = async (ledger: Omit<Ledger, "id">) => {
    const newDbLedger = await dbAddLedger(ledger);
    const newLedger: Ledger = { 
      ...newDbLedger, 
      description: newDbLedger.description || "", 
      color: newDbLedger.color || "#3b82f6",
      goldPrice24k: newDbLedger.goldPrice24k ? parseFloat(newDbLedger.goldPrice24k.toString()) : 0
    };
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
      date: newDbTransaction.date.toISOString(),
      debtId: newDbTransaction.debtId || undefined
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
      interestRate: parseFloat(newDbDebt.interestRate?.toString() || "0"),
      period: newDbDebt.period || 0,
      processingFee: parseFloat(newDbDebt.processingFee?.toString() || "0"),
      type: newDbDebt.type as any,
      status: newDbDebt.status as any,
      startDate: newDbDebt.startDate?.toISOString() || new Date().toISOString(),
      weight: parseFloat(newDbDebt.weight?.toString() || "0"),
      purity: newDbDebt.purity || undefined,
      isGoldLoan: newDbDebt.isGoldLoan || false,
      remainingPrincipal: parseFloat(newDbDebt.amount?.toString() || "0"), // New debt starts with full amount
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


  const addAsset = async (asset: Omit<Asset, "id" | "ledgerId">) => {
    if (!currentLedgerId) return;
    const newDbAsset = await dbAddAsset({
      ...asset,
      ledgerId: currentLedgerId
    });
    
    setAssets([{
      ...newDbAsset,
      type: newDbAsset.type as "gold" | "stock",
      quantity: parseFloat(newDbAsset.quantity.toString()),
      purchasePrice: parseFloat(newDbAsset.purchasePrice?.toString() || "0"),
      currentPrice: parseFloat(newDbAsset.currentPrice?.toString() || "0"),
      purity: newDbAsset.purity ? parseFloat(newDbAsset.purity.toString()) : undefined,
      date: newDbAsset.date?.toISOString() || new Date().toISOString()
    }, ...assets]);
  };

  const removeAsset = async (id: number) => {
    await dbDeleteAsset(id);
    setAssets(assets.filter((a) => a.id !== id));
  };

  const updateAssetPrice = async (id: number, price: number) => {
    await dbUpdateAssetPrice(id, price);
    setAssets(assets.map((a) => (a.id === id ? { ...a, currentPrice: price } : a)));
  };

  const addAllocation = async (allocation: Omit<Allocation, "id" | "ledgerId" | "createdAt">) => {
    if (!currentLedgerId) return;
    const result = await dbAddAllocation({
      ...allocation,
      ledgerId: currentLedgerId
    });
    
    if (result && "error" in result) {
      console.error("Context allocation error:", result.error);
      return;
    }

    setAllocations([{
      ...result,
      type: result.type as "fixed" | "commodity",
      amount: parseFloat(result.amount.toString()),
      quantity: parseFloat(result.quantity?.toString() || "1"),
      unit: result.unit || "unit",
      targetDay: result.targetDay || undefined,
      createdAt: result.createdAt?.toISOString() || new Date().toISOString()
    }, ...allocations]);
  };

  const removeAllocation = async (id: number) => {
    await dbDeleteAllocation(id);
    setAllocations(allocations.filter((a) => a.id !== id));
  };

  return (
    <FinanceContext.Provider
      value={{
        ledgers,
        currentLedgerId,
        transactions: transactions.filter((t) => t.ledgerId === currentLedgerId),
        debts: debts.filter((d) => d.ledgerId === currentLedgerId),
        assets: assets.filter((a) => a.ledgerId === currentLedgerId),
        allocations: allocations.filter((al) => al.ledgerId === currentLedgerId),
        setCurrentLedgerId,
        addLedger,
        removeLedger,
        addTransaction,
        removeTransaction,
        addDebt,
        removeDebt,
        updateDebtStatus,
        addAsset,
        removeAsset,
        addAllocation,
        removeAllocation,
        updateAssetPrice,
        updateGoldPrice: async (price24k: number) => {
          if (!currentLedgerId) return;
          await dbUpdateGoldPrice(currentLedgerId, price24k);
          setLedgers(prev => prev.map(l => 
            l.id === currentLedgerId ? { ...l, goldPrice24k: price24k } : l
          ));
        }
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
