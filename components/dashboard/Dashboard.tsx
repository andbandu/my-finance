"use client";

import React, { useState } from "react";
import { useFinance, Transaction, Ledger } from "@/context/FinanceContext";
import { Card, Button } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Search, 
  Filter,
  Trash2,
  TrendingUp,
  CreditCard,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddTransactionModal } from "./AddTransactionModal";
import { motion } from "framer-motion";
import { UpcomingInstallments } from "./UpcomingInstallments";

export const Dashboard = () => {
  const { transactions, ledgers, currentLedgerId, removeTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalIncome = transactions
    .filter((t: Transaction) => t.type === "income")
    .reduce((acc: number, t: Transaction) => acc + t.amount, 0);
  
  const totalExpense = transactions
    .filter((t: Transaction) => t.type === "expense")
    .reduce((acc: number, t: Transaction) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Calculate category breakdown
  const expenseByCategory = React.useMemo(() => {
    const breakdown = transactions
      .filter((t: Transaction) => t.type === "expense")
      .reduce((acc: Record<string, number>, t: Transaction) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(breakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
      }));
  }, [transactions, totalExpense]);

  if (currentLedgerId === null) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="text-center">
          <Layers size={48} className="mx-auto text-white/10 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">No Ledger Selected</h2>
          <p className="text-white/40 text-sm">Please select or create a ledger from the sidebar.</p>
        </div>
      </div>
    );
  }

  const currentLedger = ledgers.find((l: Ledger) => l.id === currentLedgerId);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-transparent p-10">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Overview</p>
          <h2 className="text-5xl font-bold tracking-tight text-white leading-none">
            {currentLedger?.name || "Dashboard"}
          </h2>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2 h-11 px-6 border-white/5 bg-white/[0.02]">
            <Filter size={14} className="text-white/40" />
            <span className="text-xs font-bold text-white/60">Filter</span>
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 h-11 px-6 shadow-2xl shadow-white/5">
            <Plus size={14} />
            <span className="text-xs font-bold">New Transaction</span>
          </Button>
        </div>
      </motion.header>

      {/* Bento Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12"
      >
        {/* Main Balance Card - Spans 2x2 */}
        <motion.div variants={item} className="md:col-span-2 md:row-span-2">
          <Card className="h-full relative overflow-hidden flex flex-col justify-between group p-10 bg-violet-600/[0.03] border-violet-500/10">
            <div className="absolute top-0 right-0 p-8 text-violet-500 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layers size={120} />
            </div>
            <div>
              <p className="text-violet-400/30 text-[10px] font-bold uppercase tracking-widest mb-6 border-l-2 border-violet-500/20 pl-3">Account Balance</p>
              <h3 className="text-6xl font-bold text-white tracking-tighter mb-4">{formatCurrency(balance)}</h3>
            </div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold tracking-tight pt-10">
              <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center">
                <ArrowUpRight size={12} />
              </div>
              <span>Velocity +4.2%</span>
            </div>
          </Card>
        </motion.div>

        {/* Income Card */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="relative overflow-hidden group bg-white/[0.02] border-emerald-500/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Income</p>
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <TrendingUp size={14} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalIncome)}</h3>
          </Card>
        </motion.div>

        {/* Expense Card */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="relative overflow-hidden group bg-white/[0.02] border-rose-500/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Expenditure</p>
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                <CreditCard size={14} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalExpense)}</h3>
          </Card>
        </motion.div>

        {/* Categories Breakdown - Spans 4 columns */}
        <motion.div variants={item} className="md:col-span-4 lg:col-span-4">
          <Card className="h-full bg-white/[0.01] border-none">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-bold text-white/60">Spending Allocation</h4>
              <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100">Analytics</Button>
            </div>
            <div className="space-y-6">
              {expenseByCategory.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    {expenseByCategory.map((cat, i) => (
                      <div key={cat.name} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider">
                          <span>{cat.name}</span>
                          <span>{cat.percentage}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.percentage}%` }}
                            className={cn(
                              "h-full",
                              i === 0 ? "bg-white" : 
                              i === 1 ? "bg-white/40" : 
                              i === 2 ? "bg-emerald-500" : "bg-white/10"
                            )} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-20 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No Expenditures Recorded</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Modern List Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h4 className="text-2xl font-bold text-white tracking-tight">Activity</h4>
              <p className="text-xs text-white/30 font-medium">Your recent financial flow</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input placeholder="Search transactions..." className="bg-white/5 border border-white/5 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/20 w-48 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {transactions.length > 0 ? (
              transactions.slice(0, 6).map((t, idx) => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (idx * 0.05) }}
                  className="group flex items-center justify-between p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.02] hover:border-white/[0.06] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      t.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {t.type === "income" ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-white text-base group-hover:text-white/100 transition-colors uppercase tracking-tight leading-tight mb-1">{t.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{t.category}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{formatDate(t.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className={cn(
                      "text-lg font-bold tracking-tighter",
                      t.type === "income" ? "text-emerald-400" : "text-white"
                    )}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </p>
                    <button 
                      onClick={() => removeTransaction(t.id)}
                      className="text-white/10 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center rounded-3xl border border-dashed border-white/5">
                <p className="text-white/20 text-sm font-medium">No activity recorded yet.</p>
              </div>
            )}
            <Button variant="outline" className="w-full h-14 border-dashed border-white/5 text-white/30 hover:text-white hover:border-white/10 mt-4 rounded-2xl text-xs font-bold uppercase tracking-widest">
              Load more activity
            </Button>
          </motion.div>
        </div>
        <div className="lg:col-span-4 space-y-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
          >
            <UpcomingInstallments />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h4 className="text-2xl font-bold text-white tracking-tight mb-8">Performance</h4>
            <Card className="p-8 bg-white/[0.02] border-white/5">
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white opacity-80 mb-1">Savings Velocity</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white">74.2%</span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">+12%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Efficiency</span>
                    <span className="text-xs font-bold text-white">High</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 h-3">
                    {[1, 2, 3, 4, 5, 2, 1].map((h, i) => (
                      <div key={i} className="bg-white/5 rounded-sm overflow-hidden relative">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-white" 
                          style={{ height: `${h * 20}%`, opacity: 0.1 + (i * 0.15) }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-white/40">
                        {i}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-black bg-white text-black flex items-center justify-center text-[10px] font-bold">
                      +
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Collaborators</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
