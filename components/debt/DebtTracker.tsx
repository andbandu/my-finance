"use client";

import React, { useState, useMemo } from "react";
import { useFinance, Debt } from "@/context/FinanceContext";
import { Card, Button, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { 
  Plus, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownLeft,
  Trash2,
  Calendar,
  Percent,
  Calculator,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const DebtTracker = () => {
  const { debts, addDebt, removeDebt, updateDebtStatus, addTransaction, currentLedgerId } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "Loan repayment"
  });
  const [newDebt, setNewDebt] = useState({
    person: "",
    amount: "",
    type: "owe_to" as "owe_to" | "owed_by",
    startDate: new Date().toISOString().split('T')[0],
    interestRate: "0",
    period: "0",
    processingFee: "0",
    inputMode: "principal" as "principal" | "installment"
  });
  const [successToast, setSuccessToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Auto-hide toast
  React.useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Filter out gold loans
  const filteredDebts = debts.filter(d => !d.isGoldLoan);

  const calculations = useMemo(() => {
    let principal = 0;
    let installment = 0;
    const rate = parseFloat(newDebt.interestRate) || 0;
    const months = parseInt(newDebt.period) || 0;
    const fee = parseFloat(newDebt.processingFee) || 0;

    if (newDebt.inputMode === "principal") {
      principal = parseFloat(newDebt.amount) || 0;
      const interest = principal * (rate / 100) * (months / 12);
      const total = principal + interest + fee;
      installment = months > 0 ? total / months : 0;
      return { principal, total, installment, interest, fee, maturity: getMaturity(newDebt.startDate, months) };
    } else {
      installment = parseFloat(newDebt.amount) || 0;
      const total = installment * months;
      // In installment mode, interest is assumed to be built-in or calculated backwards
      // For simplicity in this UI, we treat Total = Sum of installments
      // To show interest correctly, we'd need to assume the entered 'amount' is 'installment'
      const interest = 0; // Or derived if principal was known
      principal = total - fee; 
      return { principal, total, installment, interest, fee, maturity: getMaturity(newDebt.startDate, months) };
    }
  }, [newDebt.amount, newDebt.interestRate, newDebt.period, newDebt.processingFee, newDebt.startDate, newDebt.inputMode]);

  function getMaturity(dateStr: string, months: number) {
    const start = new Date(dateStr);
    const maturity = new Date(start);
    maturity.setMonth(start.getMonth() + months);
    return maturity;
  }

  const totalToPay = filteredDebts
    .filter(d => d.type === "owe_to" && d.status !== "paid")
    .reduce((acc, d) => {
      const interest = d.amount * (d.interestRate / 100) * (d.period / 12);
      return acc + d.amount + interest + d.processingFee;
    }, 0);
  
  const totalToCollect = filteredDebts
    .filter(d => d.type === "owed_by" && d.status !== "paid")
    .reduce((acc, d) => {
      const interest = d.amount * (d.interestRate / 100) * (d.period / 12);
      return acc + d.amount + interest + d.processingFee;
    }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebt.person || !newDebt.amount) return;
    
    await addDebt({
      ...newDebt,
      amount: calculations.principal,
      remainingPrincipal: calculations.principal,
      interestRate: parseFloat(newDebt.interestRate),
      period: parseInt(newDebt.period),
      processingFee: parseFloat(newDebt.processingFee),
      weight: 0,
      isGoldLoan: false,
      status: "pending"
    });
    setSuccessToast({ message: "New loan terms authorized successfully", type: 'success' });
    setNewDebt({ 
      person: "", 
      amount: "", 
      type: "owe_to", 
      startDate: new Date().toISOString().split('T')[0],
      interestRate: "0",
      period: "0",
      processingFee: "0",
      inputMode: "principal"
    });
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
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">Obligations</p>
          <h2 className="text-5xl font-bold tracking-tight text-white leading-none">Debt Tracker</h2>
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 h-11 px-6 shadow-2xl shadow-violet-500/20">
          <Plus size={14} />
          <span className="text-xs font-bold text-white">Record Obligation</span>
        </Button>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-8 bg-rose-500/[0.02] border-rose-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <ArrowUpRight size={80} />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-rose-400/60 font-bold mb-4">Total Payable</p>
            <h3 className="text-4xl font-bold text-white tracking-tighter">{formatCurrency(totalToPay)}</h3>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-8 bg-emerald-500/[0.02] border-emerald-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <ArrowDownLeft size={80} />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-400/60 font-bold mb-4">Total Receivable</p>
            <h3 className="text-4xl font-bold text-white tracking-tighter">{formatCurrency(totalToCollect)}</h3>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-12 overflow-hidden"
          >
            <Card className="p-10 bg-[#1a1b23] border border-white/5 rounded-[40px] shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter">New Loan Terms</h3>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Configure automated maturity tracking</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="flex gap-4 mb-10">
                <button
                  type="button"
                  onClick={() => setNewDebt({ ...newDebt, inputMode: "principal" })}
                  className={cn(
                    "flex-1 p-6 rounded-3xl border transition-all text-left group",
                    newDebt.inputMode === "principal" 
                      ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20" 
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  )}
                >
                  <p className={cn("text-[8px] font-bold uppercase tracking-[0.2em] mb-2", newDebt.inputMode === "principal" ? "text-indigo-400" : "text-white/20")}>Method A</p>
                  <h4 className="text-sm font-bold text-white mb-1">Principal-First</h4>
                  <p className="text-[10px] text-white/30 font-medium">Define by total borrowed sum</p>
                </button>
                <button
                  type="button"
                  onClick={() => setNewDebt({ ...newDebt, inputMode: "installment" })}
                  className={cn(
                    "flex-1 p-6 rounded-3xl border transition-all text-left group",
                    newDebt.inputMode === "installment" 
                      ? "bg-violet-500/10 border-violet-500/30 ring-1 ring-violet-500/20" 
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  )}
                >
                  <p className={cn("text-[8px] font-bold uppercase tracking-[0.2em] mb-2", newDebt.inputMode === "installment" ? "text-violet-400" : "text-white/20")}>Method B</p>
                  <h4 className="text-sm font-bold text-white mb-1">Installment-First</h4>
                  <p className="text-[10px] text-white/30 font-medium">Define by monthly payout</p>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <User size={10} /> Recipient / Lender
                    </label>
                    <input 
                      required
                      placeholder="Name" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      value={newDebt.person}
                      onChange={e => setNewDebt({ ...newDebt, person: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Clock size={10} /> Type
                    </label>
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 h-[58px]">
                      <button
                        type="button"
                        className={cn("flex-1 rounded-xl transition-all text-[10px] font-bold uppercase", newDebt.type === "owe_to" ? "bg-white text-black" : "text-white/40")}
                        onClick={() => setNewDebt({ ...newDebt, type: "owe_to" })}
                      >
                        Owe To
                      </button>
                      <button
                        type="button"
                        className={cn("flex-1 rounded-xl transition-all text-[10px] font-bold uppercase", newDebt.type === "owed_by" ? "bg-white text-black" : "text-white/40")}
                        onClick={() => setNewDebt({ ...newDebt, type: "owed_by" })}
                      >
                        Owed By
                      </button>
                    </div>
                  </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">
                      {newDebt.inputMode === "principal" ? "Principal Sum" : "Scheduled Installment"}
                    </label>
                    <input 
                      required
                      type="number"
                      placeholder="0.00" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      value={newDebt.amount}
                      onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Percent size={10} /> Nominal APR (%)
                    </label>
                    <input 
                      type="number"
                      placeholder="Annual Rate" 
                      className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50",
                        newDebt.inputMode === "installment" && "opacity-40 grayscale pointer-events-none"
                      )}
                      value={newDebt.interestRate}
                      onChange={e => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                      disabled={newDebt.inputMode === "installment"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Clock size={10} /> Amortization Tenure
                    </label>
                    <input 
                      type="number"
                      placeholder="Months" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      value={newDebt.period}
                      onChange={e => setNewDebt({ ...newDebt, period: e.target.value })}
                    />
                  </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Receipt size={10} /> Origination Fee
                    </label>
                    <input 
                      type="number"
                      placeholder="0.00" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      value={newDebt.processingFee}
                      onChange={e => setNewDebt({ ...newDebt, processingFee: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Calendar size={10} /> Commencement Date
                    </label>
                    <input 
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 block"
                      value={newDebt.startDate}
                      onChange={e => setNewDebt({ ...newDebt, startDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[32px] p-8 flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-black">
                      <Calculator size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Amortization Engine</p>
                      <h4 className="text-xl font-black text-white tracking-tighter">
                        Maturity: {calculations.maturity.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </h4>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                        Total {newDebt.inputMode === "principal" ? "Future Liability" : "Commitment"}: {formatCurrency(calculations.total)}
                      </p>
                    </div>
                  </div>
                  {calculations.installment > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Scheduled Installment</p>
                      <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(calculations.installment)}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-[2] h-16 rounded-[24px] bg-violet-600 text-white font-black text-sm uppercase tracking-widest hover:bg-violet-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-violet-500/20"
                  >
                    <Plus size={20} />
                    Authorize Loan Terms
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 h-16 rounded-[24px] bg-white/5 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
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
          {filteredDebts.length > 0 ? (
            filteredDebts.map((debt) => {
              const principal = debt.amount;
              const interest = principal * (debt.interestRate / 100) * (debt.period / 12);
              const total = principal + interest + debt.processingFee;
              const installment = debt.period > 0 ? total / debt.period : 0;
              
              const start = new Date(debt.startDate);
              const maturity = new Date(start);
              maturity.setMonth(start.getMonth() + debt.period);

              const today = new Date();
              let monthsElapsed = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
              if (today.getDate() < start.getDate()) monthsElapsed--;
              
              const expectedPayments = Math.max(0, monthsElapsed);
              const actualPayments = Math.floor((principal - debt.remainingPrincipal) / (installment || 1));
              const overdueCount = Math.max(0, expectedPayments - actualPayments);
              const isOverdue = overdueCount > 0 && debt.status !== "paid" && installment > 0;

              return (
                <motion.div
                  key={debt.id}
                  layout
                  variants={item}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className={cn(
                    "p-8 bg-white/[0.02] border-white/5 hover:border-white/10 transition-all group overflow-hidden relative",
                    debt.status === "paid" && "opacity-40 grayscale"
                  )}>
                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                          debt.type === "owe_to" ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                        )}>
                          {debt.type === "owe_to" ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            {debt.person}
                          </h4>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            Commenced {start.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={debt.status === "paid" ? "success" : "warning"} className="font-bold uppercase tracking-widest text-[8px]">
                          {debt.status}
                        </Badge>
                        <button 
                          onClick={() => removeDebt(debt.id)}
                          className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
                      <div>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Aggregate Liability</p>
                        <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(total)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Maturity Date</p>
                        <p className="text-sm font-bold text-white/60 uppercase tracking-widest">
                          {maturity.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl p-6 mb-8 relative z-10 bg-white/[0.02]">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-white/20">Principal Sum</span>
                        <span className="text-white/60">{formatCurrency(principal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest pl-4 border-l border-white/5">
                        <span className="text-rose-400/30">Cumulative Repayments</span>
                        <span className="text-rose-400/60">-{formatCurrency(principal - debt.remainingPrincipal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest pl-4 border-l border-white/5">
                        <span className="text-emerald-400/30">Residual Balance (Principal)</span>
                        <span className="text-emerald-400/60">{formatCurrency(debt.remainingPrincipal)}</span>
                      </div>
                      {debt.interestRate > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-white/20">Nominal APR ({debt.interestRate}%)</span>
                          <span className="text-rose-400/60">+{formatCurrency(interest)}</span>
                        </div>
                      )}
                      {debt.period > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest pt-2 border-t border-white/5">
                          <span className="text-white/20">Scheduled Installment ({debt.period}mo)</span>
                          <span className="text-white/60">{formatCurrency(installment)}/mo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 relative z-10">
                      <div className="flex items-center gap-4">
                        {debt.status !== "paid" && (
                          <Button 
                            onClick={() => setPayingDebt(debt)}
                            className="flex-1 bg-white/[0.05] hover:bg-white/10 text-white border-white/5 h-10 text-[10px] uppercase font-bold tracking-widest"
                          >
                            Variable Payment
                          </Button>
                        )}
                        {debt.status !== "paid" && installment > 0 && (
                          <Button 
                            onClick={async () => {
                              await addTransaction({
                                type: debt.type === "owe_to" ? "expense" : "income",
                                amount: installment,
                                category: "Debt Repayment",
                                description: `Scheduled Installment (${debt.person})`,
                                date: new Date().toISOString().split('T')[0],
                                debtId: debt.id
                              });
                              setSuccessToast({ 
                                message: `Installment of ${formatCurrency(installment)} settled`, 
                                type: 'success' 
                              });
                            }}
                            className="flex-[2] bg-violet-500 hover:bg-violet-600 text-white border-0 h-10 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
                          >
                            <CheckCircle2 size={14} />
                            Settle {formatCurrency(installment)} Installment
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {debt.status !== "paid" && (
                            <button 
                              onClick={() => {
                                updateDebtStatus(debt.id, "paid");
                                setSuccessToast({ message: "Obligation fully liquidated", type: 'success' });
                              }}
                              className="text-white/20 hover:text-emerald-400 text-[9px] uppercase font-bold tracking-[0.2em] transition-colors"
                            >
                              Settle Entire Liability
                            </button>
                          )}
                        </div>
                        
                        {isOverdue && (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 animate-pulse">
                            <AlertCircle size={10} className="text-rose-500" />
                            <span className="text-[9px] font-black uppercase text-rose-500 tracking-tighter">
                              {overdueCount} {overdueCount === 1 ? 'Settlement' : 'Settlements'} Overdue
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 p-8 text-white/[0.01] pointer-events-none">
                      {debt.type === "owe_to" ? <ArrowUpRight size={120} /> : <ArrowDownLeft size={120} />}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="lg:col-span-2 py-32 text-center rounded-[40px] border border-dashed border-white/5 opacity-20">
              <User size={48} className="mx-auto mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No active obligations found</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {payingDebt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#2c2c34] rounded-[40px] border border-white/5 p-10 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 text-white/[0.02] pointer-events-none">
                <Receipt size={160} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Record Payment</h3>
              <p className="text-sm text-white/40 mb-8 font-medium">Payment for loan from {payingDebt.person}</p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 block">Payment Amount</label>
                  <input 
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl h-14 px-5 text-white focus:outline-none focus:border-violet-500/50 transition-all text-xl font-bold tracking-tight"
                    placeholder="0.00"
                  />
                  <p className="text-[10px] text-white/20 mt-2 font-bold uppercase tracking-widest">
                    Remaining Principal: {formatCurrency(payingDebt.remainingPrincipal)}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 block">Payment Date</label>
                  <input 
                    type="date"
                    value={paymentData.date}
                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl h-14 px-5 text-white focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>

                <div className="pt-6 flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setPayingDebt(null)}
                    className="flex-1 h-14 rounded-2xl border-white/5 text-white uppercase text-[10px] font-bold tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      if (!paymentData.amount) return;
                      await addTransaction({
                        type: payingDebt.type === "owe_to" ? "expense" : "income",
                        amount: parseFloat(paymentData.amount),
                        category: "Debt Repayment",
                        description: `${paymentData.description} (${payingDebt.person})`,
                        date: paymentData.date,
                        debtId: payingDebt.id
                      });
                      setSuccessToast({ 
                        message: `Payment of ${formatCurrency(parseFloat(paymentData.amount))} recorded`, 
                        type: 'success' 
                      });
                      setPayingDebt(null);
                      setPaymentData({ amount: "", date: new Date().toISOString().split('T')[0], description: "Loan repayment" });
                    }}
                    className="flex-3 h-14 rounded-2xl bg-violet-500 hover:bg-violet-600 text-white border-0 uppercase text-[10px] font-bold tracking-[0.2em]"
                  >
                    Confirm Payment
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="bg-emerald-500 text-black px-6 py-4 rounded-[24px] shadow-2xl shadow-emerald-500/20 flex items-center gap-4 border border-emerald-400/20">
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest">{successToast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
