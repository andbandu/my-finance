"use client";

import React, { useMemo } from "react";
import { useFinance, Transaction } from "@/context/FinanceContext";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const CalendarOverview = () => {
  const { transactions } = useFinance();
  
  const calendarData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0-6 (Sun-Sat)
    
    // Group transactions by date string YYYY-MM-DD
    const dailyNet: Record<string, number> = {};
    
    transactions.forEach((t: Transaction) => {
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dateStr = d.toISOString().split('T')[0];
        const amount = t.type === "income" ? t.amount : -t.amount;
        dailyNet[dateStr] = (dailyNet[dateStr] || 0) + amount;
      }
    });
    
    const days = [];
    // Padding for the start of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, net: 0, dateStr: "" });
    }
    
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDay = new Date(year, month, i);
      const dateStr = currentDay.toISOString().split('T')[0];
      days.push({
        day: i,
        net: dailyNet[dateStr] || 0,
        dateStr
      });
    }
    
    return { days, monthName: today.toLocaleString('default', { month: 'long' }), year };
  }, [transactions]);

  const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  return (
    <Card className="h-full bg-white/[0.01] border-none flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-[11px] font-bold text-white/40 tracking-tight">{calendarData.monthName} {calendarData.year}</h4>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 flex-1">
        {weekDays.map(wd => (
          <div key={wd} className="text-center py-0.5">
            <span className="text-[8px] font-black text-white/5 uppercase tracking-widest">{wd}</span>
          </div>
        ))}
        
        {calendarData.days.map((d, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.005 }}
            className={cn(
              "relative aspect-square rounded-lg flex flex-col items-center justify-center border transition-all",
              d.day === null ? "border-transparent opacity-0" : "bg-white/[0.01] border-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.06]"
            )}
            title={d.day ? `${formatCurrency(d.net)} net on ${d.dateStr}` : ""}
          >
            {d.day && (
              <>
                <span className="absolute top-1.5 left-2 text-[8px] font-bold text-white/10">{d.day}</span>
                {d.net !== 0 && (
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      "text-[9px] font-black tracking-tighter leading-none",
                      d.net > 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {Math.abs(d.net) >= 1000 ? (d.net/1000).toFixed(0) + 'k' : Math.round(d.net)}
                    </span>
                    <div className={cn(
                      "w-0.5 h-0.5 rounded-full mt-0.5",
                      d.net > 0 ? "bg-emerald-500/30" : "bg-rose-500/30"
                    )} />
                  </div>
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
