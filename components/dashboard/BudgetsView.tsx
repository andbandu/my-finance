"use client";

import React from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, Button } from "@/components/ui";
import { 
  Plus, 
  Target, 
  Wallet, 
  ShoppingBag, 
  Home as HomeIcon, 
  Car,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BudgetsView = () => {
  const { transactions } = useFinance();

  const mockBudgets = [
    { id: "1", category: "Housing", limit: 2000, current: 1850, icon: HomeIcon, color: "text-blue-400" },
    { id: "2", category: "Food & Dining", limit: 800, current: 620, icon: ShoppingBag, color: "text-emerald-400" },
    { id: "3", category: "Transport", limit: 400, current: 415, icon: Car, color: "text-rose-400" },
    { id: "4", category: "Entertainment", limit: 300, current: 120, icon: Target, color: "text-amber-400" },
  ];

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
        <Button className="flex items-center gap-2 h-11 px-6 shadow-2xl shadow-white/5">
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
        {mockBudgets.map((budget) => {
          const percent = Math.min((budget.current / budget.limit) * 100, 100);
          const isOver = budget.current > budget.limit;

          return (
            <motion.div key={budget.id} variants={item}>
              <Card className="p-8 bg-white/[0.02] border-white/5 group hover:border-white/10 transition-all cursor-default">
                <div className="flex items-center justify-between mb-8">
                  <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110", budget.color)}>
                    <budget.icon size={20} />
                  </div>
                  <button className="text-white/20 hover:text-white transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-white tracking-tight mb-1">{budget.category}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Target Limit: ${budget.limit}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Spent</p>
                      <p className={cn("text-2xl font-bold tracking-tighter", isOver ? "text-rose-400" : "text-white")}>
                        ${budget.current}
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
                      <span className="text-rose-400">Exceeded by ${budget.current - budget.limit}</span>
                    ) : (
                      <span>${budget.limit - budget.current} Available</span>
                    )}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
        
        <motion.div variants={item} className="flex">
          <button className="flex-1 rounded-3xl border-2 border-dashed border-white/5 hover:border-white/10 p-10 flex flex-col items-center justify-center gap-4 transition-all group min-h-[300px]">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/40 transition-colors">
              <Plus size={24} />
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white transition-colors">Configure System</p>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
