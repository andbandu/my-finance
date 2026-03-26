"use client";

import React, { useState, useMemo } from "react";
import { useFinance, Asset, Transaction } from "@/context/FinanceContext";
import { Card, Button, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { 
  Plus, 
  Trash2,
  TrendingUp,
  History,
  Scale,
  Gem,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const AssetTransactions = ({ asset }: { asset: Asset }) => {
  if (!asset.transactions || asset.transactions.length === 0) return (
    <div className="py-4 text-center opacity-20 text-[10px] font-bold uppercase tracking-widest bg-white/[0.01] rounded-xl mt-4">
      No transaction history
    </div>
  );

  return (
    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 mt-6 divide-y divide-white/5 relative z-10 font-sans">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3 px-1">Transaction Log</p>
      {asset.transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between py-2.5 text-[10px]">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center",
              t.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            )}>
              {t.type === "income" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            </div>
            <div>
              <p className="font-bold text-white uppercase tracking-tight">{t.description}</p>
              <div className="flex items-center gap-2 opacity-40">
                <Calendar size={8} /> 
                <span>{new Date(t.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <p className={cn(
            "font-black tracking-tight",
            t.type === "income" ? "text-emerald-400" : "text-white"
          )}>
            {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
          </p>
        </div>
      ))}
    </div>
  );
};

export const GoldAssets = () => {
  const { assets, addAsset, removeAsset, updateGoldPrice, ledgers, currentLedgerId, debts } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [isSettingRate, setIsSettingRate] = useState(false);
  const [expandedAssetId, setExpandedAssetId] = useState<number | null>(null);
  
  const currentLedger = ledgers.find(l => l.id === currentLedgerId);
  const goldSpotPrice24k = currentLedger?.goldPrice24k || 0;

  const [newAsset, setNewAsset] = useState({
    name: "",
    quantity: "", // weight in grams
    purchasePrice: "",
    purity: "22", // Default to 22k
    type: "gold" as const
  });
  
  const [pawnRate, setPawnRate] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Auto-hide toast
  React.useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const goldAssets = assets.filter(a => a.type === "gold");
  
  // Calculate gold already pledged as collateral in Gold Loans
  const pledgedWeight = debts
    .filter(d => d.isGoldLoan && d.status !== "paid")
    .reduce((acc, d) => acc + (d.weight || 0), 0);

  const stats = useMemo(() => {
    const totalWeight = goldAssets.reduce((acc, a) => acc + a.quantity, 0);
    const totalValue = goldAssets.reduce((acc, a) => acc + (a.quantity * goldSpotPrice24k * (a.purity || 24) / 24), 0);
    const totalCost = goldAssets.reduce((acc, a) => acc + (a.purchasePrice * a.quantity), 0);
    const profit = totalValue - totalCost;
    
    return { totalWeight, totalValue, totalCost, profit };
  }, [goldAssets, goldSpotPrice24k]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.quantity) return;
    
    const qty = parseFloat(newAsset.quantity);
    const purchasePrice = parseFloat(newAsset.purchasePrice) || (goldSpotPrice24k * (parseInt(newAsset.purity) / 24));

    await addAsset({
      name: newAsset.name,
      quantity: qty,
      purchasePrice: purchasePrice,
      currentPrice: goldSpotPrice24k * (parseInt(newAsset.purity) / 24),
      type: "gold",
      purity: parseInt(newAsset.purity),
      realizedPnL: 0,
      date: new Date().toISOString()
    });
    
    setSuccessToast(`${newAsset.name} secured in vault`);
    setNewAsset({ name: "", quantity: "", purchasePrice: "", purity: "22", type: "gold" });
    setIsAdding(false);
  };

  const handleSetRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(pawnRate);
    if (isNaN(rate) || rate <= 0) return;
    
    // Convert Pawn rate (per 8g 22k) back to 24k per gram
    // rate = Gram24kPrice * (22/24) * 8
    const pricePerGram24k = rate / (8 * (22/24));
    
    await updateGoldPrice(pricePerGram24k);
    setSuccessToast("Market calibration successful");
    setPawnRate("");
    setIsSettingRate(false);
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
    <div className="p-8 pb-32 max-w-[1600px] mx-auto font-sans">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
            Gold Vault <Gem className="text-amber-400" size={32} />
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-white/40 font-medium max-w-md leading-relaxed">
              Technical analysis of physical holdings calibrated to market valuations.
            </p>
            {goldSpotPrice24k > 0 && (
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase font-sans">
                SPOT: {formatCurrency(goldSpotPrice24k * (22/24) * 8)} / PAWN (22K)
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => setIsSettingRate(true)}
            className="bg-white/5 hover:bg-white/10 text-white border-0 h-14 px-8 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] transition-all font-sans"
          >
            <TrendingUp size={18} className="mr-2 text-amber-500" />
            Set Market Rate
          </Button>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black border-0 h-14 px-8 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] shadow-2xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 font-sans"
          >
            <Plus size={18} className="mr-2" />
            Secure New Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-8 bg-white/[0.02] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-amber-500/10 group-hover:scale-110 transition-transform">
            <Scale size={48} />
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Gross Volumetric Weight</p>
          <h3 className="text-4xl font-black text-white tracking-tighter mb-2">{stats.totalWeight.toFixed(2)}g</h3>
          <p className="text-[10px] text-amber-400/60 font-medium font-sans">Incl. {pledgedWeight.toFixed(2)}g collateral</p>
        </Card>

        <Card className="p-8 bg-white/[0.02] border-white/5 relative overflow-hidden group text-right">
          <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:scale-110 transition-transform origin-right">
            <TrendingUp size={48} />
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Market Valuation</p>
          <h3 className="text-4xl font-black text-white tracking-tighter mb-1 font-sans">{formatCurrency(stats.totalValue)}</h3>
          <p className="text-[10px] text-emerald-400/60 font-medium uppercase tracking-widest">Aggregate Liquid Assets</p>
        </Card>

        <Card className={cn(
          "p-8 border-white/5 relative overflow-hidden group col-span-1 md:col-span-2",
          stats.profit >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"
        )}>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Unrealized Growth</p>
          <h3 className={cn(
            "text-4xl font-black tracking-tighter mb-1 font-sans",
            stats.profit >= 0 ? "text-emerald-400" : "text-rose-400"
          )}>
            {stats.profit >= 0 ? "+" : ""}{formatCurrency(stats.profit)}
          </h3>
          <p className="text-[10px] font-medium uppercase tracking-widest opacity-60 font-sans">
            {((stats.profit / (stats.totalCost || 1)) * 100).toFixed(2)}% ROI
          </p>
        </Card>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {goldAssets.map((asset) => {
            const currentPriceForPurity = goldSpotPrice24k * (asset.purity || 24) / 24;
            const valuation = asset.quantity * currentPriceForPurity;
            const purchaseValue = asset.quantity * asset.purchasePrice;
            const isExpanded = expandedAssetId === asset.id;
            
            return (
              <motion.div key={asset.id} layout variants={item}>
                <Card className={cn(
                  "p-8 bg-white/[0.02] border-white/5 hover:border-amber-500/20 transition-all group relative overflow-hidden font-sans",
                  isExpanded && "border-amber-500/30 ring-1 ring-amber-500/10"
                )}>
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                        isExpanded ? "bg-amber-500 text-black" : "bg-amber-500/10 text-amber-500"
                      )}>
                        <Gem size={20} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white tracking-tight">{asset.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-black tracking-widest uppercase">
                            {asset.purity}K Purity
                          </Badge>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">{new Date(asset.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => setExpandedAssetId(isExpanded ? null : asset.id)}
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                          isExpanded ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-white/5 text-white/30 hover:text-white"
                        )}
                        title="History"
                      >
                        <History size={14} />
                      </button>
                      <button 
                        onClick={() => removeAsset(asset.id)}
                        className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8 relative z-10 font-sans">
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Gross Weight</p>
                      <p className="text-3xl font-black text-white tracking-tighter">{asset.quantity}<span className="text-lg ml-1 font-bold text-white/20">g</span></p>
                    </div>
                    <div className="text-right font-sans">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1 font-sans">Current Value</p>
                      <p className="text-3xl font-black text-amber-400 tracking-tighter font-sans">{formatCurrency(valuation)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] relative z-10 border border-white/5 font-sans">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Spot per Gram</p>
                      <p className="text-xs font-bold text-white/60 font-sans">{formatCurrency(currentPriceForPurity)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Floating P/L</p>
                      <p className={cn(
                        "text-xs font-black font-sans",
                        valuation >= purchaseValue ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {valuation >= purchaseValue ? "+" : ""}
                        {formatCurrency(valuation - purchaseValue)}
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <AssetTransactions asset={asset} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
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
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl font-sans"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-amber-500/5">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Onboard Physical Gold</h3>
                  <p className="text-xs text-white/40">Calibrate your physical assets for market tracking.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Gem size={20} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Asset Description</label>
                  <input 
                    autoFocus
                    placeholder="e.g., 22k Gold Necklace"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-sans"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 font-sans">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Gross Mass (Grams)</label>
                    <input 
                      type="number" step="0.001"
                      placeholder="0.000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-sans"
                      value={newAsset.quantity}
                      onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 font-sans">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Gold Purity</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none uppercase font-sans"
                      value={newAsset.purity}
                      onChange={(e) => setNewAsset({ ...newAsset, purity: e.target.value })}
                    >
                      <option value="24" className="bg-[#0A0A0A]">24K (Pure Fine)</option>
                      <option value="22" className="bg-[#0A0A0A]">22K (Standard)</option>
                      <option value="21" className="bg-[#0A0A0A]">21K</option>
                      <option value="20" className="bg-[#0A0A0A]">20K</option>
                      <option value="18" className="bg-[#0A0A0A]">18K</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 font-sans">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1 font-sans">Acquisition Cost (Total Paid)</p>
                  <input 
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-transparent border-0 text-center text-2xl font-black text-white focus:outline-none font-sans"
                    value={newAsset.purchasePrice}
                    onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: e.target.value })}
                  />
                  <p className="text-[9px] text-white/20 mt-2 font-medium font-sans">
                    Defaults to {formatCurrency(goldSpotPrice24k * (parseFloat(newAsset.purity)/24) * (parseFloat(newAsset.quantity) || 0))} if zero.
                  </p>
                </div>

                <div className="flex gap-4 pt-4 font-sans">
                  <Button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border-0 h-14 rounded-2xl text-[10px] uppercase font-bold tracking-widest font-sans"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-[2] bg-amber-500 hover:bg-amber-600 text-black border-0 h-14 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-amber-500/20 font-sans"
                  >
                    Mint Asset
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isSettingRate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingRate(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl font-sans"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Sync Market Rate</h3>
                  <p className="text-xs text-white/40">Calibrate vault to current trading price.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>

              <form onSubmit={handleSetRate} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 font-sans">Current Pawn Rate (22K - 8g)</label>
                  <input 
                    autoFocus
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-sans"
                    value={pawnRate}
                    onChange={(e) => setPawnRate(e.target.value)}
                  />
                  <p className="text-[9px] text-white/30 px-1 font-sans">
                    The system will automatically extrapolate the pure gold value based on the standard 22K pawn rate.
                  </p>
                </div>

                <div className="flex gap-3 font-sans">
                  <Button 
                    type="button"
                    onClick={() => setIsSettingRate(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border-0 h-14 rounded-2xl text-[10px] uppercase font-bold tracking-widest font-sans"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white border-0 h-14 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-emerald-600/20 font-sans"
                  >
                    Update Valuation
                  </Button>
                </div>
              </form>
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
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] font-sans"
          >
            <div className="bg-amber-500 text-black px-6 py-4 rounded-[24px] shadow-2xl shadow-amber-500/20 flex items-center gap-4 border border-amber-400/20 font-sans">
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center font-sans">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest font-sans">{successToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
