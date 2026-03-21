"use client";

import React, { useState } from "react";
import { useFinance, Transaction } from "@/context/FinanceContext";
import { Card, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingDown, 
  PieChart as PieChartIcon,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const MonthlyView = () => {
  const { transactions } = useFinance();
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Cash In Breakdown */}
        <div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h4 className="text-2xl font-bold text-white tracking-tight">Categorized Income</h4>
              <p className="text-xs text-white/30 font-medium font-mono uppercase tracking-widest mt-1">Cash In Breakdown</p>
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 gap-6">
              {sortedIncomeCategories.length > 0 ? (
                sortedIncomeCategories.map(([cat, amt], idx) => (
                  <motion.div
                    key={cat}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group p-8 bg-white/[0.01] hover:bg-white/[0.03] border-white/[0.02] hover:border-white/[0.08] transition-all">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-3 rounded-2xl bg-white/[0.02] text-white/40 group-hover:text-emerald-400 transition-colors">
                          <ArrowUpRight size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{Math.round((amt / totalIncome) * 100)}% of Total</p>
                      </div>
                      <h5 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2">{cat}</h5>
                      <p className="text-3xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors pr-10">{formatCurrency(amt)}</p>
                      
                      <div className="mt-8 h-1 bg-white/[0.02] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(amt / totalIncome) * 100}%` }}
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        />
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center rounded-3xl border border-dashed border-white/5 opacity-10">
                  <p className="text-sm font-bold uppercase tracking-widest">No income sources recorded</p>
                </div>
              )}
            </div>
          </AnimatePresence>
        </div>

        {/* Cash Out Breakdown */}
        <div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h4 className="text-2xl font-bold text-white tracking-tight">Categorized Expenses</h4>
              <p className="text-xs text-white/30 font-medium font-mono uppercase tracking-widest mt-1">Cash Out Breakdown</p>
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 gap-6">
              {sortedExpenseCategories.length > 0 ? (
                sortedExpenseCategories.map(([cat, amt], idx) => (
                  <motion.div
                    key={cat}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="group p-8 bg-white/[0.01] hover:bg-white/[0.03] border-white/[0.02] hover:border-white/[0.08] transition-all">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-3 rounded-2xl bg-white/[0.02] text-white/40 group-hover:text-violet-400 transition-colors">
                          <ArrowDownRight size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{Math.round((amt / totalExpenses) * 100)}% of Total</p>
                      </div>
                      <h5 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2">{cat}</h5>
                      <p className="text-3xl font-bold text-white tracking-tight group-hover:text-violet-400 transition-colors pr-10">{formatCurrency(amt)}</p>
                      
                      <div className="mt-8 h-1 bg-white/[0.02] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(amt / totalExpenses) * 100}%` }}
                          className="h-full bg-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        />
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center rounded-3xl border border-dashed border-white/5 opacity-10">
                  <p className="text-sm font-bold uppercase tracking-widest">No expenses recorded</p>
                </div>
              )}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
