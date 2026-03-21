"use client";

import React, { useState } from "react";
import { useFinance, Transaction } from "@/context/FinanceContext";
import { Card, Button } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2,
  Calendar,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const TransactionsView = () => {
  const { transactions, removeTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesMonth = selectedMonth === "all" || new Date(t.date).getMonth() === selectedMonth;
    return matchesSearch && matchesType && matchesMonth;
  });

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Ledger</p>
          <h2 className="text-5xl font-bold tracking-tight text-white leading-none">Transactions</h2>
        </div>
      </motion.header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
          <input 
            placeholder="Search by description or category..." 
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="bg-white/[0.02] border border-white/5 rounded-2xl py-2 pl-9 pr-6 text-xs font-bold text-white/60 appearance-none focus:outline-none focus:ring-1 focus:ring-white/10 transition-all cursor-pointer"
            >
              <option value="all">All Months</option>
              {monthNames.map((name, i) => (
                <option key={name} value={i} className="bg-neutral-900">{name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
            {(["all", "income", "expense"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                  filterType === type ? "bg-white text-black" : "text-white/30 hover:text-white"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((t, idx) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Card className="group flex items-center justify-between p-5 bg-white/[0.01] hover:bg-white/[0.03] border-white/[0.02] hover:border-white/[0.08] cursor-default">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                      t.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {t.type === "income" ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg tracking-tight mb-1">{t.description}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                        <span className="flex items-center gap-1.5"><Tag size={10} />{t.category}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="flex items-center gap-1.5"><Calendar size={10} />{formatDate(t.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <p className={cn(
                      "text-xl font-bold tracking-tighter",
                      t.type === "income" ? "text-emerald-400" : "text-white"
                    )}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </p>
                    <button 
                      onClick={() => removeTransaction(t.id)}
                      className="text-white/10 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="py-40 text-center rounded-3xl border border-dashed border-white/5 opacity-10">
              <p className="text-sm font-bold uppercase tracking-widest">No entries found matching filters</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
