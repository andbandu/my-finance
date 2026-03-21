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
  Receipt,
  Coins,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const GoldLoanTracker = () => {
  const { debts, addDebt, removeDebt, updateDebtStatus, addTransaction } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "Gold loan repayment"
  });
  
  const [newDebt, setNewDebt] = useState({
    person: "",
    amount: "",
    type: "owe_to" as "owe_to" | "owed_by",
    startDate: new Date().toISOString().split('T')[0],
    interestRate: "0",
    period: "0",
    processingFee: "0",
    isGoldLoan: true, // Always true for this tracker
    weight: "0",
    purity: "22k"
  });
  const [successToast, setSuccessToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Auto-hide toast
  React.useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Filter only gold loans
  const goldDebts = debts.filter(d => d.isGoldLoan);

  const calculations = useMemo(() => {
    const principal = parseFloat(newDebt.amount) || 0;
    const rate = parseFloat(newDebt.interestRate) || 0;
    const months = parseInt(newDebt.period) || 0;
    const fee = parseFloat(newDebt.processingFee) || 0;

    const interest = principal * (rate / 100) * (months / 12);
    const total = principal + interest + fee;
    const installment = months > 0 ? total / months : 0;

    const start = new Date(newDebt.startDate);
    const maturity = new Date(start);
    maturity.setMonth(start.getMonth() + months);

    return { total, installment, interest, fee, maturity };
  }, [newDebt.amount, newDebt.interestRate, newDebt.period, newDebt.processingFee, newDebt.startDate]);

  const totalOutstanding = goldDebts
    .filter(d => d.status !== "paid")
    .reduce((acc, d) => acc + d.remainingPrincipal, 0);
  
  const totalCollateralWeight = goldDebts
    .filter(d => d.status !== "paid")
    .reduce((acc, d) => acc + (d.weight || 0), 0);

  const totalFutureLiability = goldDebts
    .filter(d => d.status !== "paid")
    .reduce((acc, d) => {
      const start = new Date(d.startDate);
      const maturity = new Date(start);
      maturity.setMonth(start.getMonth() + (d.period || 0));
      const today = new Date();
      let remainingMonths = (maturity.getFullYear() - today.getFullYear()) * 12 + (maturity.getMonth() - today.getMonth());
      if (remainingMonths <= 0) remainingMonths = 1;

      const futureInterest = (d.remainingPrincipal * (d.interestRate / 100)) * (remainingMonths / 12);
      return acc + d.remainingPrincipal + futureInterest;
    }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebt.person || !newDebt.amount) return;
    
    await addDebt({
      ...newDebt,
      amount: parseFloat(newDebt.amount),
      remainingPrincipal: parseFloat(newDebt.amount),
      interestRate: parseFloat(newDebt.interestRate),
      period: parseInt(newDebt.period),
      processingFee: parseFloat(newDebt.processingFee),
      isGoldLoan: true,
      weight: parseFloat(newDebt.weight),
      purity: newDebt.purity,
      status: "pending"
    });
    setSuccessToast({ message: "Gold loan secured and recorded", type: 'success' });
    setNewDebt({ 
      person: "", 
      amount: "", 
      type: "owe_to", 
      startDate: new Date().toISOString().split('T')[0],
      interestRate: "0",
      period: "0",
      processingFee: "0",
      isGoldLoan: true,
      weight: "0",
      purity: "22k"
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500/40 font-bold mb-2">Asset-Backed</p>
          <h2 className="text-5xl font-bold tracking-tight text-white leading-none">Gold Loans</h2>
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 h-11 px-6 bg-amber-500 hover:bg-amber-600 text-black border-0 shadow-2xl shadow-amber-500/20">
          <Plus size={14} />
          <span className="text-xs font-bold">New Gold Obligation</span>
        </Button>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-8 bg-amber-500/[0.02] border-amber-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-amber-500">
              <Coins size={80} />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-amber-500/60 font-bold mb-4">Secured Principal</p>
            <h3 className="text-4xl font-bold text-white tracking-tighter">{formatCurrency(totalOutstanding)}</h3>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 bg-indigo-500/[0.02] border-indigo-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-indigo-500">
              <Calculator size={80} />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-indigo-400/60 font-bold mb-4">Total Future Liability</p>
            <h3 className="text-4xl font-bold text-white tracking-tighter">{formatCurrency(totalFutureLiability)}</h3>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="p-8 bg-amber-500/[0.02] border-amber-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-amber-500">
              <Scale size={80} />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-amber-500/60 font-bold mb-4">Total Collateral Weight</p>
            <h3 className="text-4xl font-bold text-white tracking-tighter">{totalCollateralWeight.toFixed(3)}g</h3>
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
            <Card className="p-10 bg-[#1a1b23] border border-amber-500/10 rounded-[40px] shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter">Gold Loan Terms</h3>
                  <p className="text-[10px] font-bold text-amber-500/30 uppercase tracking-widest mt-1">Configure asset-backed financing</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <User size={10} /> Lender Entity
                    </label>
                    <input 
                      required
                      placeholder="Bank or Pawn Center" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      value={newDebt.person}
                      onChange={e => setNewDebt({ ...newDebt, person: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Scale size={10} /> Purity (Karat)
                    </label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 appearance-none"
                      value={newDebt.purity}
                      onChange={e => setNewDebt({ ...newDebt, purity: e.target.value })}
                    >
                      <option value="24k" className="bg-black text-white px-4">24K (Pure Gold)</option>
                      <option value="22k" className="bg-black text-white px-4">22K (Standard)</option>
                      <option value="18k" className="bg-black text-white px-4">18K</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest pl-1">Amount Taken</label>
                    <input 
                      required
                      type="number"
                      placeholder="0.00" 
                      className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      value={newDebt.amount}
                      onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest pl-1">Weight (Grams)</label>
                    <input 
                      type="number"
                      placeholder="0.000g" 
                      className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      value={newDebt.weight}
                      onChange={e => setNewDebt({ ...newDebt, weight: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Percent size={10} /> Annual Interest (%)
                    </label>
                    <input 
                      type="number"
                      placeholder="APR" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      value={newDebt.interestRate}
                      onChange={e => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Clock size={10} /> Loan Period (Months)
                    </label>
                    <input 
                      type="number"
                      placeholder="Months" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      value={newDebt.period}
                      onChange={e => setNewDebt({ ...newDebt, period: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Calendar size={10} /> Date Received
                    </label>
                    <input 
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 block"
                      value={newDebt.startDate}
                      onChange={e => setNewDebt({ ...newDebt, startDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-[32px] p-8 flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-black">
                      <Calculator size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-1">Get Out Strategy</p>
                      <h4 className="text-xl font-black text-white tracking-tighter">
                        Maturity: {calculations.maturity.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </h4>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                        Total Payable: {formatCurrency(calculations.total)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Monthly Target</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(calculations.installment)}</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-[2] h-16 rounded-[24px] bg-amber-500 text-black font-black text-sm uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20"
                  >
                    <Plus size={20} />
                    Authorize Terms
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
          {goldDebts.length > 0 ? (
            goldDebts.map((debt) => {
              const start = new Date(debt.startDate);
              const maturity = new Date(start);
              maturity.setMonth(start.getMonth() + (debt.period || 0));

              return (
                <motion.div
                  key={debt.id}
                  layout
                  variants={item}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className={cn(
                    "p-8 bg-white/[0.02] border-white/5 hover:border-amber-500/20 transition-all group overflow-hidden relative",
                    debt.status === "paid" && "opacity-40 grayscale"
                  )}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0" />
                    
                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                          <Coins size={20} />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            {debt.person}
                          </h4>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                            Borrowed {start.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={debt.status === "paid" ? "success" : "warning"} className="font-bold uppercase tracking-widest text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                        {debt.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
                      <div>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Total to Settle</p>
                        <p className="text-3xl font-black text-white tracking-tighter font-mono">
                          {(() => {
                            const today = new Date();
                            const start = new Date(debt.startDate);
                            const maturity = new Date(start);
                            maturity.setMonth(start.getMonth() + (debt.period || 0));
                            let remainingMonths = (maturity.getFullYear() - today.getFullYear()) * 12 + (maturity.getMonth() - today.getMonth());
                            if (remainingMonths <= 0) remainingMonths = 1;
                            const futureInterest = (debt.remainingPrincipal * (debt.interestRate / 100)) * (remainingMonths / 12);
                            return formatCurrency(debt.remainingPrincipal + futureInterest);
                          })()}
                        </p>
                        <p className="text-[8px] text-white/20 font-bold uppercase mt-1">Principal + Future Interest</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-rose-400/40 uppercase tracking-widest mb-1">Interest (Est.)</p>
                        <p className="text-2xl font-bold text-rose-400/60 tracking-tight font-mono">
                          +{(() => {
                            const today = new Date();
                            const start = new Date(debt.startDate);
                            const maturity = new Date(start);
                            maturity.setMonth(start.getMonth() + (debt.period || 0));
                            let remainingMonths = (maturity.getFullYear() - today.getFullYear()) * 12 + (maturity.getMonth() - today.getMonth());
                            if (remainingMonths <= 0) remainingMonths = 1;
                            const futureInterest = (debt.remainingPrincipal * (debt.interestRate / 100)) * (remainingMonths / 12);
                            return formatCurrency(futureInterest);
                          })()}
                        </p>
                        <p className="text-[8px] text-rose-400/20 font-bold uppercase mt-1">Remaining Duration</p>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl p-6 mb-8 relative z-10 bg-amber-500/[0.03] border border-amber-500/10">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-white/20">Original Loan</span>
                        <span className="text-white/60">{formatCurrency(debt.amount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-white/20">Interest ({debt.interestRate}%)</span>
                        <span className="text-rose-400/60">Annualized</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest pt-2 border-t border-amber-500/10">
                        <span className="text-amber-500/60 text-[11px]">Monthly Get Out Target</span>
                        <span className="text-white font-black text-sm">
                          {(() => {
                            const today = new Date();
                            let remainingMonths = (maturity.getFullYear() - today.getFullYear()) * 12 + (maturity.getMonth() - today.getMonth());
                            if (remainingMonths <= 0) remainingMonths = 1;

                            const monthlyInterest = (debt.remainingPrincipal * (debt.interestRate / 100)) / 12;
                            const principalPart = debt.remainingPrincipal / remainingMonths;
                            return formatCurrency(principalPart + monthlyInterest);
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                      {debt.status !== "paid" && (
                        <Button 
                          onClick={() => setPayingDebt(debt)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black border-0 h-10 text-[10px] uppercase font-bold tracking-widest"
                        >
                          Record Repayment
                        </Button>
                      )}
                      {debt.status !== "paid" && (
                        <Button 
                          onClick={() => updateDebtStatus(debt.id, "paid")}
                          className="bg-white/[0.05] hover:bg-white/10 text-white border-0 h-10 px-4 text-[10px] uppercase font-bold tracking-widest"
                        >
                          Settle All
                        </Button>
                      )}
                      <button 
                        onClick={() => removeDebt(debt.id)}
                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="absolute top-0 right-0 p-8 text-amber-500/[0.02] pointer-events-none">
                      <span className="text-9xl opacity-20">✨</span>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="lg:col-span-2 py-32 text-center rounded-[40px] border border-dashed border-amber-500/10 opacity-20">
              <Coins size={48} className="mx-auto mb-4 text-amber-500" />
              <p className="text-sm font-bold uppercase tracking-widest text-amber-500">No active gold loans found</p>
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
              className="w-full max-w-lg bg-[#2c2c34] rounded-[40px] border border-amber-500/10 p-10 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 text-amber-500/[0.02] pointer-events-none">
                <Receipt size={160} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Record Gold Payment</h3>
              <p className="text-sm text-white/40 mb-8 font-medium">Payment for loan from {payingDebt.person}</p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 block">Payment Amount</label>
                  <input 
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl h-14 px-5 text-white focus:outline-none focus:border-amber-500/50 transition-all text-xl font-bold tracking-tight"
                    placeholder="0.00"
                  />
                  <p className="text-[10px] text-amber-500/40 mt-2 font-bold uppercase tracking-widest flex flex-col gap-1">
                    <span>Secured Principal Remainder: {formatCurrency(payingDebt.remainingPrincipal)}</span>
                    <span className="text-white/40">
                      Estimated Settlement (with interest): {(() => {
                        const start = new Date(payingDebt.startDate);
                        const maturity = new Date(start);
                        maturity.setMonth(start.getMonth() + (payingDebt.period || 0));
                        const today = new Date();
                        let remainingMonths = (maturity.getFullYear() - today.getFullYear()) * 12 + (maturity.getMonth() - today.getMonth());
                        if (remainingMonths <= 0) remainingMonths = 1;
                        const futureInterest = (payingDebt.remainingPrincipal * (payingDebt.interestRate / 100)) * (remainingMonths / 12);
                        return formatCurrency(payingDebt.remainingPrincipal + futureInterest);
                      })()}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 block">Payment Date</label>
                  <input 
                    type="date"
                    value={paymentData.date}
                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl h-14 px-5 text-white focus:outline-none focus:border-amber-500/50 transition-all"
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
                        message: `Gold payment of ${formatCurrency(parseFloat(paymentData.amount))} recorded`, 
                        type: 'success' 
                      });
                      setPayingDebt(null);
                      setPaymentData({ amount: "", date: new Date().toISOString().split('T')[0], description: "Gold loan repayment" });
                    }}
                    className="flex-3 h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black border-0 uppercase text-[10px] font-bold tracking-[0.2em]"
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
            <div className="bg-amber-500 text-black px-6 py-4 rounded-[24px] shadow-2xl shadow-amber-500/20 flex items-center gap-4 border border-amber-400/20">
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
