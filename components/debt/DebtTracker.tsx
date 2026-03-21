"use client";

import React, { useState } from "react";
import { useFinance, Debt } from "@/context/FinanceContext";
import { Card, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const DebtTracker = () => {
  const { debts, addDebt, removeDebt, updateDebtStatus } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [newDebt, setNewDebt] = useState<Omit<Debt, "id" | "ledgerId">>({
    person: "",
    amount: 0,
    type: "owe_to",
    status: "pending",
  });

  const totalToPay = debts
    .filter(d => d.type === "owe_to" && d.status !== "paid")
    .reduce((acc, d) => acc + d.amount, 0);
  
  const totalToCollect = debts
    .filter(d => d.type === "owed_by" && d.status !== "paid")
    .reduce((acc, d) => acc + d.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebt.person || newDebt.amount <= 0) return;
    addDebt(newDebt);
    setNewDebt({ person: "", amount: 0, type: "owe_to", status: "pending" });
    setIsAdding(false);
  };

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
    <div className="flex-1 overflow-y-auto p-10">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Social Finance</p>
          <h2 className="text-5xl font-bold tracking-tight text-white leading-none">Debt Tracker</h2>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 h-11 px-6 shadow-2xl shadow-white/5">
          <Plus size={14} />
          <span className="text-xs font-bold">Record New Debt</span>
        </Button>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-8 bg-rose-500/[0.02] border-rose-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <ArrowDownRight size={80} />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-rose-400/60 font-bold mb-4">Total Payable</p>
            <h3 className="text-4xl font-bold text-white tracking-tighter">{formatCurrency(totalToPay)}</h3>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-8 bg-emerald-500/[0.02] border-emerald-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <ArrowUpRight size={80} />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-400/60 font-bold mb-4">Total Receivable</p>
            <h3 className="text-4xl font-bold text-white tracking-tighter">{formatCurrency(totalToCollect)}</h3>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12 overflow-hidden"
          >
            <Card className="p-8 bg-white/[0.02] border-white/10">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-1">Person / Entity</label>
                  <input 
                    type="text" 
                    placeholder="Name" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                    value={newDebt.person}
                    onChange={e => setNewDebt({ ...newDebt, person: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-1">Amount</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                    value={newDebt.amount || ""}
                    onChange={e => setNewDebt({ ...newDebt, amount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-1">Type</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none text-white font-sans"
                    value={newDebt.type}
                    onChange={e => setNewDebt({ ...newDebt, type: e.target.value as any })}
                  >
                    <option value="owe_to" className="bg-black">I owe them</option>
                    <option value="owed_by" className="bg-black">They owe me</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 h-12 rounded-xl">Add Entry</Button>
                  <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="h-12 border-white/5">Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {debts.length > 0 ? (
            debts.map((debt) => (
              <motion.div
                key={debt.id}
                layout
                variants={item}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className={cn(
                  "p-6 group relative overflow-hidden transition-all border-white/[0.03] hover:border-white/[0.1] bg-white/[0.01] hover:bg-white/[0.02]",
                  debt.status === "paid" && "opacity-40 grayscale"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                        debt.type === "owe_to" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg tracking-tight mb-1">{debt.person}</h4>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                            debt.type === "owe_to" ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                          )}>
                            {debt.type === "owe_to" ? "Payable" : "Receivable"}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} />
                            {debt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold tracking-tighter text-white mb-2">{formatCurrency(debt.amount)}</p>
                      <div className="flex items-center justify-end gap-2">
                        {debt.status !== "paid" && (
                          <button 
                            onClick={() => updateDebtStatus(debt.id, "paid")}
                            className="text-white/20 hover:text-emerald-500 transition-colors p-2"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => removeDebt(debt.id)}
                          className="text-white/10 hover:text-rose-500 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="lg:col-span-2 py-32 text-center rounded-3xl border border-dashed border-white/5 opacity-20">
              <Users size={48} className="mx-auto mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No active debts found</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
