"use client";

import React, { useState, useMemo } from "react";
import { useFinance, Allocation } from "@/context/FinanceContext";
import { Card, Button, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ShoppingCart, 
  Home, 
  CreditCard, 
  Milk, 
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  ChevronRight,
  Package,
  Layers,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, any> = {
  "Housing": Home,
  "Transport": CreditCard,
  "Food": UtensilsCrossed,
  "Grocery": ShoppingCart,
  "Utilities": Layers,
  "Subscription": Package,
  "Snacks": Milk,
  "PickMe": CreditCard,
};

export const AllocationsView = () => {
  const { allocations, transactions, addAllocation, removeAllocation } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [allocationType, setAllocationType] = useState<"fixed" | "commodity">("fixed");
  
  const [newAllocation, setNewAllocation] = useState({
    name: "",
    amount: "",
    category: "Grocery",
    quantity: "1",
    unit: "unit",
    targetDay: ""
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllocation.name || !newAllocation.amount) return;
    
    await addAllocation({
      ...newAllocation,
      type: allocationType,
      amount: parseFloat(newAllocation.amount),
      quantity: parseFloat(newAllocation.quantity) || 1,
      targetDay: newAllocation.targetDay ? parseInt(newAllocation.targetDay) : undefined
    });
    
    setNewAllocation({ name: "", amount: "", category: "Grocery", quantity: "1", unit: "unit", targetDay: "" });
    setIsAdding(false);
  };

  const totals = useMemo(() => {
    const fixed = allocations.filter(a => a.type === "fixed").reduce((acc, a) => acc + a.amount, 0);
    const commodity = allocations.filter(a => a.type === "commodity").reduce((acc, a) => acc + a.amount, 0);
    return { fixed, commodity, total: fixed + commodity };
  }, [allocations]);

  const getSpentForCategory = (category: string) => {
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.category === category && 
               t.type === "expense" && 
               d.getMonth() === currentMonth && 
               d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

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
    <div className="flex-1 overflow-y-auto p-10 pb-32">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Monthly Strategy</p>
          <h2 className="text-5xl font-bold tracking-tight text-white leading-none">Allocations</h2>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-white text-black hover:bg-white/90 h-12 px-8 rounded-2xl flex items-center gap-2 shadow-2xl shadow-white/5 transition-all hover:scale-105 active:scale-95">
          <Plus size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Add Requirement</span>
        </Button>
      </motion.header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-10 bg-white/[0.02] border-white/10 relative overflow-hidden group col-span-1 md:col-span-2">
          <div className="absolute top-0 right-0 p-10 text-white/5 group-hover:scale-110 transition-transform -rotate-12">
            <TrendingDown size={120} />
          </div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">Minimum Monthly Capital Required</p>
          <h3 className="text-6xl font-black text-white tracking-tighter mb-2">
            {formatCurrency(totals.total)}
          </h3>
          <div className="flex gap-4 mt-6">
            <Badge className="bg-white/5 text-white/60 border-white/10 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest">
              {formatCurrency(totals.fixed)} Fixed Obligations
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest">
              {formatCurrency(totals.commodity)} Commodity Reserve
            </Badge>
          </div>
        </Card>

        <Card className="p-10 bg-violet-600/10 border-violet-500/10 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] mb-4">Allocation Coverage</p>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-black text-white tracking-tighter">
                {Math.round((getSpentForCategory("Fixed") / (totals.total || 1)) * 100)}%
              </span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Fulfilled</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
               <div 
                className="h-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-1000" 
                style={{ width: `${Math.min((getSpentForCategory("Fixed") / (totals.total || 1)) * 100, 100)}%` }} 
               />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Fixed Obligations Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/60">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white tracking-tight">Fixed Obligations</h4>
              <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest">Rent, Leasing, Utilities</p>
            </div>
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {allocations.filter(a => a.type === "fixed").map((al) => {
              const Icon = CATEGORY_ICONS[al.category] || CreditCard;
              return (
                <motion.div key={al.id} variants={item}>
                  <Card className="p-6 bg-white/[0.01] border-white/5 flex items-center justify-between group hover:bg-white/[0.03] hover:border-white/10 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-lg tracking-tight">{al.name}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-white/5 text-white/30 border-0 text-[8px] font-black tracking-widest px-2">{al.category}</Badge>
                          {al.targetDay && <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Due on {al.targetDay}th</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xl font-black text-white tracking-tight">{formatCurrency(al.amount)}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Per Month</p>
                      </div>
                      <button 
                        onClick={() => removeAllocation(al.id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white/5 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
            {allocations.filter(a => a.type === "fixed").length === 0 && (
              <div className="p-12 rounded-[32px] border border-dashed border-white/5 flex flex-col items-center justify-center opacity-20">
                <Calendar size={32} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No Fixed Obligations</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* Commodity Planner Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white tracking-tight">Commodity Planner</h4>
              <p className="text-[10px] font-medium text-emerald-400/40 uppercase tracking-widest">Grocery & Supplies Quota</p>
            </div>
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {allocations.filter(a => a.type === "commodity").map((al) => {
              return (
                <motion.div key={al.id} variants={item}>
                  <Card className="p-6 bg-emerald-500/[0.02] border-emerald-500/5 flex items-center justify-between group hover:bg-emerald-500/[0.05] hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-400/40 group-hover:text-emerald-400 transition-colors">
                        <Package size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-lg tracking-tight">{al.name}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest h-6 px-3 bg-emerald-500/10 flex items-center rounded-full leading-none">
                            {al.quantity} {al.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-400 tracking-tight">{formatCurrency(al.amount)}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Estimated allocation</p>
                      </div>
                      <button 
                        onClick={() => removeAllocation(al.id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white/5 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
             {allocations.filter(a => a.type === "commodity").length === 0 && (
              <div className="p-12 rounded-[32px] border border-dashed border-white/5 flex flex-col items-center justify-center opacity-10">
                <ShoppingCart size={32} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No Commodity Quotas</p>
              </div>
            )}
          </motion.div>
        </section>
      </div>

      {/* Add Allocation Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-10 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter">New Allocation</h3>
                  <p className="text-xs text-white/30 font-bold uppercase tracking-[0.2em] mt-1">Rule Definition</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="p-10 space-y-8">
                {/* Type Toggle */}
                <div className="p-1.5 bg-white/5 rounded-2xl flex gap-1">
                  <button 
                    type="button"
                    onClick={() => setAllocationType("fixed")}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all",
                      allocationType === "fixed" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                    )}
                  >
                    Fixed Obligation
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAllocationType("commodity")}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all",
                      allocationType === "commodity" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white"
                    )}
                  >
                    Commodity Quota
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Requirement Name</label>
                    <input 
                      autoFocus required
                      placeholder={allocationType === "fixed" ? "e.g., Monthly Rent" : "e.g., Milk Powder"}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-medium"
                      value={newAllocation.name}
                      onChange={(e) => setNewAllocation({ ...newAllocation, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Estimated Cost (LKR)</label>
                      <input 
                        type="number" required
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-mono"
                        value={newAllocation.amount}
                        onChange={(e) => setNewAllocation({ ...newAllocation, amount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none font-bold"
                        value={newAllocation.category}
                        onChange={(e) => setNewAllocation({ ...newAllocation, category: e.target.value })}
                      >
                        <option value="Grocery" className="bg-[#0A0A0A]">Grocery</option>
                        <option value="Food" className="bg-[#0A0A0A]">Food & Dining</option>
                        <option value="Housing" className="bg-[#0A0A0A]">Housing</option>
                        <option value="Transport" className="bg-[#0A0A0A]">Transport</option>
                        <option value="Utilities" className="bg-[#0A0A0A]">Utilities</option>
                        <option value="Subscription" className="bg-[#0A0A0A]">Subscription</option>
                        <option value="Snacks" className="bg-[#0A0A0A]">Snacks</option>
                      </select>
                    </div>
                  </div>

                  {allocationType === "commodity" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="grid grid-cols-2 gap-6 pt-2"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-emerald-400/40 uppercase tracking-widest ml-1">Monthly Quantity</label>
                        <input 
                          type="number"
                          placeholder="e.g., 3"
                          className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold"
                          value={newAllocation.quantity}
                          onChange={(e) => setNewAllocation({ ...newAllocation, quantity: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-emerald-400/40 uppercase tracking-widest ml-1">Unit</label>
                        <input 
                          placeholder="e.g., kg, pack"
                          className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase font-black"
                          value={newAllocation.unit}
                          onChange={(e) => setNewAllocation({ ...newAllocation, unit: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}

                  {allocationType === "fixed" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Target Day of Month (Optional)</label>
                      <input 
                        type="number" min="1" max="31"
                        placeholder="e.g., 5"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                        value={newAllocation.targetDay}
                        onChange={(e) => setNewAllocation({ ...newAllocation, targetDay: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit"
                    className="w-full bg-white text-black border-0 h-16 rounded-[24px] text-xs uppercase font-black tracking-[0.2em] shadow-2xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Establish Allocation
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
