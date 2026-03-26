"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  getLedgers, addLedger as dbAddLedger, deleteLedger as dbDeleteLedger,
  getTransactions, addTransaction as dbAddTransaction, deleteTransaction as dbDeleteTransaction,
  getDebts, addDebt as dbAddDebt, deleteDebt as dbDeleteDebt, updateDebtStatus as dbUpdateDebtStatus,
  getAssets, addAsset as dbAddAsset, deleteAsset as dbDeleteAsset, updateAssetPrice as dbUpdateAssetPrice,
  updateAssetPosition as dbUpdateAssetPosition,
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
  debtId?: number | null;
  assetId?: number | null;
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
  type: "gold" | "stock" | "crypto";
  name: string;
  ticker?: string | null; // Ticker symbol for stocks/crypto
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  realizedPnL: number;
  purity?: number;
  date: string;
  transactions?: Transaction[];
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
  adjustAssetPosition: (id: number, quantityChange: number, price: number) => Promise<void>;
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

  const fetchData = async () => {
    if (!currentLedgerId) return;
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
      debtId: t.debtId || null,
      assetId: t.assetId || null
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
      type: a.type as "gold" | "stock" | "crypto",
      ticker: a.ticker || undefined,
      quantity: parseFloat(a.quantity.toString()),
      purchasePrice: parseFloat(a.purchasePrice?.toString() || "0"),
      currentPrice: parseFloat(a.currentPrice?.toString() || "0"),
      realizedPnL: parseFloat(a.realizedPnL?.toString() || "0"),
      purity: a.purity ? parseFloat(a.purity.toString()) : undefined,
      date: a.date?.toISOString(),
      transactions: (a.transactions || []).map((t: any) => ({
        ...t,
        amount: parseFloat(t.amount.toString()),
        type: t.type as TransactionType,
        date: t.date.toISOString(),
      }))
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

  // Fetch data for current ledger
  useEffect(() => {
    fetchData();
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
  };

  const addTransaction = async (transaction: Omit<Transaction, "id" | "ledgerId">) => {
    if (!currentLedgerId) return;
    await dbAddTransaction({
      ...transaction,
      ledgerId: currentLedgerId,
      amount: transaction.amount.toString()
    });
    await fetchData();
  };

  const removeTransaction = async (id: number) => {
    await dbDeleteTransaction(id);
    await fetchData();
  };

  const addDebt = async (debt: Omit<Debt, "id" | "ledgerId">) => {
    if (!currentLedgerId) return;
    await dbAddDebt({
      ...debt,
      ledgerId: currentLedgerId,
      amount: debt.amount.toString()
    });
    await fetchData();
  };

  const removeDebt = async (id: number) => {
    await dbDeleteDebt(id);
    await fetchData();
  };

  const updateDebtStatus = async (id: number, status: Debt["status"]) => {
    await dbUpdateDebtStatus(id, status);
    await fetchData();
  };


  const addAsset = async (asset: Omit<Asset, "id" | "ledgerId">) => {
    if (!currentLedgerId) return;
    await dbAddAsset({
      ...asset,
      ledgerId: currentLedgerId
    });
    await fetchData();
  };

  const removeAsset = async (id: number) => {
    await dbDeleteAsset(id);
    await fetchData();
  };

  const updateAssetPrice = async (id: number, price: number) => {
    await dbUpdateAssetPrice(id, price);
    await fetchData();
  };

  const adjustAssetPosition = async (id: number, quantityChange: number, price: number) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    let newQuantity = asset.quantity + quantityChange;
    if (newQuantity < 0) newQuantity = 0;

    let newAvgCost = asset.purchasePrice;
    let profitFromSale = 0;

    if (quantityChange > 0) {
      // Re-buying: Recalculate average cost
      newAvgCost = ((asset.quantity * asset.purchasePrice) + (quantityChange * price)) / (asset.quantity + quantityChange);
    } else if (quantityChange < 0) {
      // Selling part of position: Calculate profit from sale
      const qtySold = Math.abs(quantityChange);
      profitFromSale = (price - asset.purchasePrice) * qtySold;
    }

    const newRealizedPnL = (asset.realizedPnL || 0) + profitFromSale;

    await dbUpdateAssetPosition(id, newQuantity, newAvgCost, newRealizedPnL);

    // Record the financial transaction
    const totalCashFlow = Math.abs(quantityChange * price);
    await dbAddTransaction({
      ledgerId: currentLedgerId!,
      type: quantityChange > 0 ? "expense" : "income",
      amount: totalCashFlow,
      category: "Asset Adjustment",
      description: `${quantityChange > 0 ? "Purchase" : "Sale"} of ${asset.ticker || asset.name}`,
      date: new Date().toISOString(),
      assetId: id
    });

    await fetchData(); 
  };

  const addAllocation = async (allocation: Omit<Allocation, "id" | "ledgerId" | "createdAt">) => {
    if (!currentLedgerId) return;
    await dbAddAllocation({
      ...allocation,
      ledgerId: currentLedgerId
    });
    await fetchData();
  };

  const removeAllocation = async (id: number) => {
    await dbDeleteAllocation(id);
    await fetchData();
  };

  return (
    <FinanceContext.Provider
      value={{
        ledgers,
        currentLedgerId,
        transactions,
        debts,
        assets,
        allocations,
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
        adjustAssetPosition,
        updateGoldPrice: async (price24k: number) => {
          if (!currentLedgerId) return;
          await dbUpdateGoldPrice(currentLedgerId, price24k);
          await fetchData();
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
