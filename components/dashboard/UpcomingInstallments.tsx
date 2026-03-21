"use client";

import React from "react";
import { useFinance, Debt } from "@/context/FinanceContext";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Calendar, AlertCircle, CheckCircle2, Coins } from "lucide-react";
import { motion } from "framer-motion";

export const UpcomingInstallments = () => {
  const { debts, transactions } = useFinance();
  
  const activeDebts = debts.filter(d => d.status !== "paid");
  
  if (activeDebts.length === 0) return null;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const obligations = activeDebts.map(debt => {
    const startDate = new Date(debt.startDate);
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(startDate.getMonth() + (debt.period || 0));
    
    // Calculate remaining months
    const today = new Date();
    let remainingMonths = (maturityDate.getFullYear() - today.getFullYear()) * 12 + (maturityDate.getMonth() - today.getMonth());
    if (remainingMonths <= 0) remainingMonths = 1; // Minimum 1 month if past or at maturity

    // Calculate this month's target
    let amountDue = 0;
    let type: "Standard" | "Gold" = debt.isGoldLoan ? "Gold" : "Standard";
    
    if (debt.isGoldLoan) {
      // Gold Loan: (Remaining Principal / Remaining Months) + Monthly Interest
      const monthlyInterest = (debt.remainingPrincipal * (debt.interestRate / 100)) / 12;
      const principalPart = debt.remainingPrincipal / remainingMonths;
      amountDue = principalPart + monthlyInterest;
    } else {
      // Standard Loan: Total with interest / Total period (simple approximation if not stored)
      const totalInterest = (debt.amount * (debt.interestRate / 100)) * ((debt.period || 1) / 12);
      const totalAmount = debt.amount + totalInterest + (debt.processingFee || 0);
      amountDue = totalAmount / (debt.period || 1);
    }

    // Check if paid this month
    const paidThisMonth = transactions.some(t => 
      t.debtId === debt.id && 
      new Date(t.date).getMonth() === currentMonth && 
      new Date(t.date).getFullYear() === currentYear
    );

    return {
      ...debt,
      amountDue,
      type,
      paidThisMonth,
      maturityDate
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xl font-bold text-white tracking-tight">Active Obligations</h4>
        <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
          <Calendar size={12} />
          <span>{new Date().toLocaleString('default', { month: 'long' })}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {obligations.map((ob, idx) => (
          <motion.div
            key={ob.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * idx }}
          >
            <Card className={`p-4 bg-white/[0.02] border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-all ${ob.paidThisMonth ? 'opacity-60' : ''}`}>
              {/* Background Glow for Gold */}
              {ob.isGoldLoan && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors" />
              )}

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    ob.paidThisMonth 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : (ob.isGoldLoan ? "bg-amber-500/10 text-amber-500" : "bg-violet-500/10 text-violet-500")
                  }`}>
                    {ob.paidThisMonth ? <CheckCircle2 size={18} /> : (ob.isGoldLoan ? <Coins size={18} /> : <AlertCircle size={18} />)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-white text-sm">{ob.person}</p>
                      {ob.isGoldLoan && (
                        <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Gold</span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                      {ob.paidThisMonth ? "Settled for March" : (ob.isGoldLoan ? "Get Out Target" : "Monthly Installment")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-bold tracking-tighter ${ob.paidThisMonth ? 'text-emerald-400' : 'text-white'}`}>
                    {formatCurrency(ob.amountDue)}
                  </p>
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                    Maturity: {ob.maturityDate.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
