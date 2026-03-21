"use client";

import React, { useState, useMemo } from "react";
import { useFinance, Asset } from "@/context/FinanceContext";
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
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const GoldAssets = () => {
  const { assets, addAsset, removeAsset, updateGoldPrice, ledgers, currentLedgerId, debts } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [isSettingRate, setIsSettingRate] = useState(false);
  
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

  const handleSetRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(pawnRate);
    if (isNaN(rate)) return;
    
    // Calculate 24k per gram from 1 Pawn (8g) 22k
    // 22k price per g = rate / 8
    // 24k price per g = (rate / 8) * (24 / 22)
    const price24k = (rate / 8) * (24 / 22);
    
    await updateGoldPrice(price24k);
    setSuccessToast("Market Rate Synchronized");
    setIsSettingRate(false);
    setPawnRate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.quantity) return;
    
    const pur = parseFloat(newAsset.purity) || 24;
    const currentPrice = goldSpotPrice24k * (pur / 24);

    await addAsset({
      name: newAsset.name,
      quantity: parseFloat(newAsset.quantity),
      purchasePrice: newAsset.purchasePrice 
        ? parseFloat(newAsset.purchasePrice) / (parseFloat(newAsset.quantity) || 1)
        : currentPrice, // Default cost to current market if not specified
      currentPrice: currentPrice,
      purity: pur,
      type: "gold",
      date: new Date().toISOString()
    });
    
    setSuccessToast("Gold asset secure in vault");
    setNewAsset({ name: "", quantity: "", purchasePrice: "", purity: "22", type: "gold" });
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
    <div className="p-8 pb-32 max-w-[1600px] mx-auto">
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
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                SPOT: {formatCurrency(goldSpotPrice24k * (22/24) * 8)} / PAWN (22K)
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => setIsSettingRate(true)}
            className="bg-white/5 hover:bg-white/10 text-white border-0 h-14 px-8 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] transition-all"
          >
            <TrendingUp size={18} className="mr-2 text-amber-500" />
            Set Market Rate
          </Button>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black border-0 h-14 px-8 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] shadow-2xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} className="mr-2" />
            Secure New Asset
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-8 bg-white/[0.02] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-amber-500/10 group-hover:scale-110 transition-transform">
            <Scale size={48} />
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Gross Volumetric Weight</p>
          <h3 className="text-4xl font-black text-white tracking-tighter mb-2">{stats.totalWeight.toFixed(2)}g</h3>
          <p className="text-[10px] text-amber-400/60 font-medium">Incl. {pledgedWeight.toFixed(2)}g pledged as collateral</p>
        </Card>

        <Card className="p-8 bg-white/[0.02] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:scale-110 transition-transform">
            <TrendingUp size={48} />
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Market Valuation</p>
          <h3 className="text-4xl font-black text-white tracking-tighter mb-1">{formatCurrency(stats.totalValue)}</h3>
          <p className="text-[10px] text-emerald-400/60 font-medium uppercase tracking-widest">Aggregate Liquid Assets</p>
        </Card>

        <Card className={cn(
          "p-8 border-white/5 relative overflow-hidden group col-span-1 md:col-span-2",
          stats.profit >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"
        )}>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Unrealized Growth</p>
          <h3 className={cn(
            "text-4xl font-black tracking-tighter mb-1",
            stats.profit >= 0 ? "text-emerald-400" : "text-rose-400"
          )}>
            {stats.profit >= 0 ? "+" : ""}{formatCurrency(stats.profit)}
          </h3>
          <p className="text-[10px] font-medium uppercase tracking-widest opacity-60">
            {((stats.profit / (stats.totalCost || 1)) * 100).toFixed(2)}% ROI
          </p>
        </Card>
      </div>

      {/* Asset List */}
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
            const netFine = asset.quantity * (asset.purity || 24) / 24;
            
            return (
              <motion.div key={asset.id} layout variants={item}>
                <Card className="p-8 bg-white/[0.02] border-white/5 hover:border-amber-500/20 transition-all group relative overflow-hidden">
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
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
                    <button 
                      onClick={() => removeAsset(asset.id)}
                      className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Gross Weight</p>
                      <p className="text-3xl font-black text-white tracking-tighter">{asset.quantity}g</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Market Valuation</p>
                      <p className="text-3xl font-black text-amber-400 tracking-tighter">{formatCurrency(valuation)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] relative z-10">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Current Spot/g</p>
                      <p className="text-xs font-bold text-white/60">{formatCurrency(currentPriceForPurity)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Growth/Depreciation</p>
                      <p className={cn(
                        "text-xs font-black",
                        valuation >= purchaseValue ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {valuation >= purchaseValue ? "+" : ""}
                        {formatCurrency(valuation - purchaseValue)}
                      </p>
                    </div>
                  </div>
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
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-amber-500/5">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Secure Gold Asset</h3>
                  <p className="text-xs text-white/40">Secure a new physical gold entry with technical specs.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Gem size={20} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Asset Nomenclature</label>
                  <input 
                    autoFocus
                    placeholder="e.g., 22k Sovereign Coin"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Gross Weight (g)</label>
                    <input 
                      type="number" step="0.001"
                      placeholder="0.000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                      value={newAsset.quantity}
                      onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Purity (Karats)</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none"
                      value={newAsset.purity}
                      onChange={(e) => setNewAsset({ ...newAsset, purity: e.target.value })}
                    >
                      <option value="24" className="bg-[#0A0A0A]">24k (Fine Gold)</option>
                      <option value="22" className="bg-[#0A0A0A]">22k (Standard)</option>
                      <option value="21" className="bg-[#0A0A0A]">21k</option>
                      <option value="20" className="bg-[#0A0A0A]">20k</option>
                      <option value="18" className="bg-[#0A0A0A]">18k</option>
                      <option value="14" className="bg-[#0A0A0A]">14k</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Total Acquisition Price (Whole Item)</p>
                  <input 
                    type="number"
                    placeholder="Total amount paid"
                    className="w-full bg-transparent border-0 text-center text-2xl font-black text-white focus:outline-none placeholder:text-white/10"
                    value={newAsset.purchasePrice}
                    onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: e.target.value })}
                  />
                  <p className="text-[9px] text-white/20 mt-2 font-medium">
                    Leave empty to use current market value of {formatCurrency(goldSpotPrice24k * (parseFloat(newAsset.purity)/24) * (parseFloat(newAsset.quantity) || 0))}
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border-0 h-14 rounded-2xl text-[10px] uppercase font-bold tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-[2] bg-amber-500 hover:bg-amber-600 text-black border-0 h-14 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-amber-500/20"
                  >
                    Secure Item
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
              className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
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
                <div className="space-y-4 text-center">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Price for 22 Carat 8 Grams (1 Pawn)</p>
                  <input 
                    type="number"
                    autoFocus
                    placeholder="0.00"
                    className="w-full bg-transparent border-0 text-center text-5xl font-black text-white focus:outline-none placeholder:text-white/5"
                    value={pawnRate}
                    onChange={(e) => setPawnRate(e.target.value)}
                  />
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] text-white/20 font-medium leading-relaxed">
                      We will automatically derive the 24k base rate and update all vault valuations.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black border-0 h-14 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-emerald-500/20"
                  >
                    Calibrate Vault
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setIsSettingRate(false)}
                    className="w-full bg-transparent hover:bg-white/5 text-white/40 border-0 h-10 text-[10px] uppercase font-bold tracking-widest"
                  >
                    Dismiss
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
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="bg-amber-500 text-black px-6 py-4 rounded-[24px] shadow-2xl shadow-amber-500/20 flex items-center gap-4 border border-amber-400/20">
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest">{successToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
