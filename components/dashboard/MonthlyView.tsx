"use client";

import React, { useState } from "react";
import { useFinance, Transaction } from "@/context/FinanceContext";
import { Card, Button, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingDown, 
  PieChart as PieChartIcon,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  Download,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const MonthlyView = () => {
  const { transactions, allocations } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const selectedMonth = currentDate.getMonth();
  const selectedYear = currentDate.getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
  });

  const expenses = monthlyTransactions.filter((t: Transaction) => t.type === "expense");
  const income = monthlyTransactions.filter((t: Transaction) => t.type === "income");
  
  const totalExpenses = expenses.reduce((acc: number, t: Transaction) => acc + t.amount, 0);
  const totalIncome = income.reduce((acc: number, t: Transaction) => acc + t.amount, 0);
  const monthlyBalance = totalIncome - totalExpenses;

  const exportToCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    const rows = monthlyTransactions.map((t: Transaction) => [
      t.date,
      t.description,
      t.category,
      t.type,
      t.amount.toString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Salary_LK_Monthly_${monthNames[selectedMonth]}_${selectedYear}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group expenses by category
  const expenseCategories = expenses.reduce((acc: Record<string, number>, t: Transaction) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedExpenseCategories = Object.entries(expenseCategories)
    .sort(([, a], [, b]) => b - a);

  // Group income by category
  const incomeCategories = income.reduce((acc: Record<string, number>, t: Transaction) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedIncomeCategories = Object.entries(incomeCategories)
    .sort(([, a], [, b]) => b - a);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Analytics</p>
          <div className="flex items-center gap-6">
            <h2 className="text-5xl font-bold tracking-tight text-white leading-none">
              {monthNames[selectedMonth]} <span className="text-white/20 font-light">{selectedYear}</span>
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all text-white/40 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all text-white/40 hover:text-white">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
        <Button 
          onClick={exportToCSV}
          variant="outline" 
          className="flex items-center gap-2 h-12 px-6 border-white/5 bg-white/[0.02] hover:bg-violet-600/10 hover:border-violet-500/20 transition-all group"
        >
          <Download size={16} className="text-white/40 group-hover:text-violet-400 transition-colors" />
          <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors uppercase tracking-widest">Monthly Export</span>
        </Button>
      </motion.header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
      >
        <motion.div variants={item}>
          <Card className={cn(
            "p-10 overflow-hidden relative group h-full transition-all",
            monthlyBalance >= 0 ? "bg-white/[0.02] border-white/10" : "bg-rose-500/[0.03] border-rose-500/10"
          )}>
            <div className="relative z-10">
              <div className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", monthlyBalance >= 0 ? "bg-white/40" : "bg-rose-500")} />
                Net Balance
              </div>
              <h3 className={cn("text-5xl font-bold tracking-tighter mb-2", monthlyBalance >= 0 ? "text-white" : "text-rose-400")}>
                {monthlyBalance >= 0 ? "+" : ""}{formatCurrency(monthlyBalance)}
              </h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Efficiency for {monthNames[selectedMonth]}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-10 bg-emerald-500/[0.03] border-emerald-500/10 overflow-hidden relative group h-full">
            <div className="absolute -right-10 -top-10 text-emerald-500 opacity-5 group-hover:opacity-10 transition-all -rotate-12">
              <ArrowUpRight size={200} />
            </div>
            <div className="relative z-10">
              <div className="text-emerald-400/40 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Monthly Cash In
              </div>
              <h3 className="text-5xl font-bold text-white tracking-tighter mb-2">{formatCurrency(totalIncome)}</h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{income.length} Sources</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-10 bg-violet-600/[0.03] border-violet-500/10 overflow-hidden relative group h-full">
            <div className="absolute -right-10 -top-10 text-violet-500 opacity-5 group-hover:opacity-10 transition-all rotate-12">
              <TrendingDown size={200} />
            </div>
            <div className="relative z-10">
              <div className="text-violet-400/40 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                Monthly Cash Out
              </div>
              <h3 className="text-5xl font-bold text-white tracking-tighter mb-2">{formatCurrency(totalExpenses)}</h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{expenses.length} Total Entries</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        {/* Requirement Fulfillment */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-2xl font-bold text-white tracking-tight">Requirement Fulfillment</h4>
              <p className="text-xs text-white/30 font-medium font-mono uppercase tracking-widest mt-1">Allocation Coverage</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allocations.length > 0 ? allocations.map(al => {
              const spent = monthlyTransactions
                .filter(t => t.description.toLowerCase().includes(al.name.toLowerCase()) || t.category === al.category)
                .reduce((acc, t) => acc + t.amount, 0);
              const percent = Math.min((spent / (al.amount || 1)) * 100, 100);
              const isFulfilled = spent >= al.amount;

              return (
                <Card key={al.id} className="p-6 bg-white/[0.01] border-white/5 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{al.name}</p>
                    {isFulfilled ? 
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[8px] font-black tracking-widest p-0 flex items-center gap-1">
                        <CheckCircle2 size={10} /> FULFILLED
                      </Badge> :
                      <Badge className="bg-white/5 text-white/30 border-0 text-[8px] font-black tracking-widest p-0">
                        {Math.round(percent)}%
                      </Badge>
                    }
                  </div>
                  <h5 className="text-lg font-bold text-white tracking-tight mb-4">{formatCurrency(al.amount)}</h5>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        isFulfilled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/20"
                      )} 
                      style={{ width: `${percent}%` }} 
                    />
                  </div>
                </Card>
              );
            }) : (
              <div className="col-span-2 py-12 text-center rounded-3xl border border-dashed border-white/5 opacity-10">
                <p className="text-sm font-bold uppercase tracking-widest">No requirements defined</p>
              </div>
            )}
          </div>
        </div>

        {/* Categorized Small Cards */}
        <div className="lg:col-span-4">
          <h4 className="text-2xl font-bold text-white tracking-tight mb-8">Categorized flow</h4>
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Income sources</p>
            {sortedIncomeCategories.length > 0 ? sortedIncomeCategories.map(([cat, amt]) => (
              <div key={cat} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center group hover:bg-white/[0.03] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <ArrowUpRight size={14} />
                  </div>
                  <span className="text-xs text-white/60 font-bold uppercase tracking-tight">{cat}</span>
                </div>
                <span className="text-sm font-bold text-white">{formatCurrency(amt)}</span>
              </div>
            )) : (
              <p className="text-[10px] text-white/10 uppercase font-black px-1">None</p>
            )}

            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1 pt-4">Expense Categories</p>
            {sortedExpenseCategories.length > 0 ? sortedExpenseCategories.map(([cat, amt]) => (
              <div key={cat} className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center group hover:bg-white/[0.03] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <ArrowDownRight size={14} />
                  </div>
                  <span className="text-xs text-white/60 font-bold uppercase tracking-tight">{cat}</span>
                </div>
                <span className="text-sm font-bold text-white">{formatCurrency(amt)}</span>
              </div>
            )) : (
              <p className="text-[10px] text-white/10 uppercase font-black px-1">None</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Transaction List */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-2xl font-bold text-white tracking-tight">Ledger entries</h4>
            <p className="text-xs text-white/30 font-medium font-mono uppercase tracking-widest mt-1">Individual monthly movement</p>
          </div>
        </div>

        <div className="space-y-2">
          {monthlyTransactions.length > 0 ? (
            monthlyTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.01 }}
                className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.02] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    t.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {t.type === "income" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm tracking-tight">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{t.category}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{formatDate(t.date)}</span>
                    </div>
                  </div>
                </div>
                <p className={cn(
                  "text-base font-bold tracking-tighter",
                  t.type === "income" ? "text-emerald-400" : "text-white"
                )}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center rounded-3xl border border-dashed border-white/5 opacity-10">
              <p className="text-sm font-bold uppercase tracking-widest">No entries for this period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
