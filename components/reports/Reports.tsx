"use client";

import React from "react";
import { useFinance, Transaction } from "@/context/FinanceContext";
import { Card, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Home as HomeIcon,
  ShoppingBag,
  Car
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, Cell as BarCell 
} from "recharts";
import { motion } from "framer-motion";

export const Reports = () => {
  const { transactions } = useFinance();

  const expenseByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc: Record<string, number>, t: Transaction) => {
      acc[t.category] = (acc[t.category] || 0) + (t.amount as number);
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expenseByCategory).map(name => ({
    name,
    value: expenseByCategory[name]
  }));

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const incomeVsExpense = [
    { name: "Income", amount: totalIncome },
    { name: "Expense", amount: totalExpense }
  ];

  const mockBudgets = [
    { id: 101, category: "Housing", limit: 2000, current: 1850, icon: HomeIcon, color: "text-blue-400" },
    { id: 102, category: "Food & Dining", limit: 800, current: 620, icon: ShoppingBag, color: "text-emerald-400" },
    { id: 103, category: "Transport", limit: 400, current: 415, icon: Car, color: "text-rose-400" },
    { id: 104, category: "Entertainment", limit: 300, current: 120, icon: Target, color: "text-amber-400" },
  ];

  const COLORS = ["#8b5cf6", "#a78bfa", "#6366f1", "#4f46e5", "#3730a3", "#a855f7"];

  const exportToCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    const rows = transactions.map(t => [
      t.date,
      t.description,
      t.category,
      t.type,
      t.amount
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "finance_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Analytics</p>
          <h2 className="text-5xl font-bold tracking-tight text-white leading-none">Intelligence</h2>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 h-11 px-6 border-white/5 bg-white/[0.02]">
          <Download size={14} className="text-white/60" />
          <span className="text-xs font-bold text-white/80">Export Data Set</span>
        </Button>
      </motion.header>

      {/* Insight Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <motion.div variants={item}>
          <Card className="p-8 bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                <Target size={16} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Burn Rate</p>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : "0"}%
            </h3>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Efficiency Metrics</p>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="p-8 bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                <TrendingUp size={16} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Total Flow</p>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{formatCurrency(totalIncome + totalExpense)}</h3>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Gross Volume</p>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="p-8 bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                <TrendingDown size={16} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Net Margin</p>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{formatCurrency(totalIncome - totalExpense)}</h3>
            <p className="text-[10px] font-bold text-rose-400/60 uppercase tracking-widest">Retained Earnings</p>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="p-10 bg-white/[0.01] border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h4 className="text-sm font-bold text-white/60 tracking-widest uppercase">Allocation</h4>
              <PieChartIcon size={14} className="text-white/20" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: "No Data", value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {pieData.length === 0 && <Cell fill="#ffffff10" />}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="p-10 bg-white/[0.01] border-white/5">
            <div className="flex items-center justify-between mb-10">
              <h4 className="text-sm font-bold text-white/60 tracking-widest uppercase">Flow Analysis</h4>
              <BarChartIcon size={14} className="text-white/20" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpense} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#ffffff33" fontSize={10} width={60} />
                  <Tooltip 
                     cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                     contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]} animationDuration={1500}>
                    <BarCell fill="#8b5cf6" />
                    <BarCell fill="#8b5cf633" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
