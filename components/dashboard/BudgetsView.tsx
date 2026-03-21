"use client";

import React, { useState } from "react";
import { useFinance, Budget } from "@/context/FinanceContext";
import { Card, Button } from "@/components/ui";
import { 
  Plus, 
  Target, 
  Wallet, 
  ShoppingBag, 
  Home as HomeIcon, 
  Car,
  MoreHorizontal,
  Smartphone,
  Coffee,
  Music,
  Heart,
  Shield,
  Trash2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  HomeIcon,
  ShoppingBag,
  Car,
  Target,
  Wallet,
  Smartphone,
  Coffee,
  Music,
  Heart,
  Shield,
};

const COLOR_MAP = [
  { name: "Blue", class: "text-blue-400", bg: "bg-blue-400" },
  { name: "Emerald", class: "text-emerald-400", bg: "bg-emerald-400" },
  { name: "Rose", class: "text-rose-400", bg: "bg-rose-400" },
  { name: "Amber", class: "text-amber-400", bg: "bg-amber-400" },
  { name: "Violet", class: "text-violet-400", bg: "bg-violet-400" },
  { name: "Cyan", class: "text-cyan-400", bg: "bg-cyan-400" },
];

export const BudgetsView = () => {
  const { budgets, transactions, addBudget, removeBudget } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "",
    limit: "",
    icon: "Target",
    color: "text-violet-400",
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

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

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.limit) return;
    await addBudget({
      ...newBudget,
      limit: parseFloat(newBudget.limit),
    });
    setNewBudget({ category: "", limit: "", icon: "Target", color: "text-violet-400" });
    setIsAdding(false);
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
    <div className="flex-1 overflow-y-auto p-10">
      <motion.header 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Planning</p>
          <h2 className="text-5xl font-bold tracking-tight text-white leading-none">Budgets</h2>
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 h-11 px-6 shadow-2xl shadow-white/5">
          <Plus size={14} />
          <span className="text-xs font-bold">New Budget Goal</span>
        </Button>
      </motion.header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {budgets.map((budget) => {
          const currentSpent = getSpentForCategory(budget.category);
          const percent = Math.min((currentSpent / budget.limit) * 100, 100);
          const isOver = currentSpent > budget.limit;
          const Icon = ICON_MAP[budget.icon] || Target;

          return (
            <motion.div key={budget.id} variants={item}>
              <Card className="p-8 bg-white/[0.02] border-white/5 group hover:border-white/10 transition-all cursor-default relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110", budget.color)}>
                    <Icon size={20} />
                  </div>
                  <button 
                    onClick={() => removeBudget(budget.id)}
                    className="text-white/10 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-white tracking-tight mb-1">{budget.category}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Monthly Limit: ${budget.limit}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Spent this month</p>
                      <p className={cn("text-2xl font-bold tracking-tighter", isOver ? "text-rose-400" : "text-white")}>
                        ${currentSpent.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{Math.round(percent)}%</p>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full transition-colors duration-500",
                        isOver ? "bg-rose-500" : percent > 85 ? "bg-amber-500" : "bg-white"
                      )} 
                    />
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    {isOver ? (
                      <span className="text-rose-400">Exceeded by ${(currentSpent - budget.limit).toFixed(2)}</span>
                    ) : (
                      <span>${(budget.limit - currentSpent).toFixed(2)} Available</span>
                    )}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
        
        {budgets.length === 0 && (
          <motion.div variants={item} className="lg:col-span-3">
            <Card className="p-20 bg-white/[0.01] border-dashed border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6">
                <Target size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Budget Goals Set</h3>
              <p className="text-white/40 text-sm max-w-md">Track your spending by category and stay within your monthly limits.</p>
              <Button onClick={() => setIsAdding(true)} variant="outline" className="mt-8 border-white/10 hover:bg-white/5">
                Create First Goal
              </Button>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Add Budget Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#1a1b23] border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 bg-gradient-to-br from-white/5 to-transparent flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">New Budget Goal</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBudget} className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">Category Name</label>
                    <input 
                      autoFocus
                      required
                      placeholder="e.g. Dining Out" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                      value={newBudget.category}
                      onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">Monthly Limit ($)</label>
                    <input 
                      required
                      type="number"
                      placeholder="500.00" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                      value={newBudget.limit}
                      onChange={e => setNewBudget({ ...newBudget, limit: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">Visual Identity</label>
                    
                    {/* Icon Selection */}
                    <div className="grid grid-cols-5 gap-3">
                      {Object.keys(ICON_MAP).map(iconName => {
                        const Icon = ICON_MAP[iconName];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setNewBudget({ ...newBudget, icon: iconName })}
                            className={cn(
                              "aspect-square rounded-xl flex items-center justify-center transition-all",
                              newBudget.icon === iconName ? "bg-white/10 text-white border border-white/20" : "bg-white/5 text-white/30 hover:bg-white/[0.07]"
                            )}
                          >
                            <Icon size={20} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Color Selection */}
                    <div className="flex gap-4 items-center justify-center p-2">
                      {COLOR_MAP.map(color => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setNewBudget({ ...newBudget, color: color.class })}
                          className={cn(
                            "w-8 h-8 rounded-full transition-transform hover:scale-110",
                            color.bg,
                            newBudget.color === color.class ? "ring-4 ring-white/10 scale-110" : "opacity-40"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 h-14 rounded-2xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] h-14 rounded-2xl bg-white text-black font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Establish Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
