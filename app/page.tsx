"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { DebtTracker } from "@/components/debt/DebtTracker";
import { GoldLoanTracker } from "@/components/debt/GoldLoanTracker";
import { GoldAssets } from "@/components/assets/GoldAssets";
import { StockAssets } from "@/components/assets/StockAssets";
import { CryptoAssets } from "@/components/assets/CryptoAssets";
import { Reports } from "@/components/reports/Reports";

import { TransactionsView } from "@/components/dashboard/TransactionsView";
import { MonthlyView } from "@/components/dashboard/MonthlyView";
import { AllocationsView } from "@/components/planning/AllocationsView";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <main className="flex min-h-screen bg-[#2c2c34] text-white font-[family-name:var(--font-geist-sans)] selection:bg-violet-500/30 selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "debts" && <DebtTracker />}
        {activeTab === "gold_loans" && <GoldLoanTracker />}
        {activeTab === "gold_assets" && <GoldAssets />}
        {activeTab === "stock_assets" && <StockAssets />}
        {activeTab === "crypto_assets" && <CryptoAssets />}
        {activeTab === "reports" && <Reports />}
        {activeTab === "transactions" && <TransactionsView />}
        {activeTab === "monthly" && <MonthlyView />}
        {activeTab === "allocations" && <AllocationsView />}
      </div>
    </main>
  );
}
