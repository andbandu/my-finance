"use client";

import React, { useState } from "react";
import { useFinance, TransactionType } from "@/context/FinanceContext";
import { Card, Button } from "@/components/ui";
import { X, Banknote, Tag, FileText, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const AddTransactionModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;
    await addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
    });
    setAmount("");
    setCategory("");
    setDescription("");
    onClose();
  };

  const categories = type === "income" 
    ? ["Salary", "Freelance", "Investment", "Gift", "Other"]
    : ["Food", "Transport", "Rent", "Utilities", "Shopping", "Entertainment", "Health", "Other"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md relative z-10"
          >
            <Card className="p-0 border-white/10 overflow-hidden bg-background shadow-2xl shadow-black">
              <div className="flex items-center justify-between p-8 border-b border-white/5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Entry System</p>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Record Transaction</h3>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="flex p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                      type === "expense" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-white/20 hover:text-white/40"
                    )}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("income")}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                      type === "income" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-white/20 hover:text-white/40"
                    )}
                  >
                    Income
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-1">Value Amount</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                        <Banknote size={18} />
                      </div>
                      <input
                        type="number"
                        placeholder="0.00"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-white/20 transition-all font-mono text-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-1">Description</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                        <FileText size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="What is this for?"
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-white/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-1">Category</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
                          <Tag size={18} />
                        </div>
                        <select
                          value={category}
                          required
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-white/20 transition-all text-sm appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-black text-white/20">Select</option>
                          {categories.map((c) => (
                            <option key={c} value={c} className="bg-black text-white">{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-1">Date</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
                          <CalendarIcon size={18} />
                        </div>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-white/20 transition-all text-xs [color-scheme:dark] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 text-sm font-bold uppercase tracking-widest">
                  Confirm {type} Entry
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
