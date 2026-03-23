"use client";

import React, { useState, useMemo } from "react";
import { useFinance, Asset } from "@/context/FinanceContext";
import { Card, Button, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { 
  Plus, 
  Trash2,
  TrendingUp,
  BarChart4,
  Briefcase,
  CheckCircle2,
  Search,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Edit3, Check, X, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const UpdatePriceButton = ({ id, currentPrice }: { id: number, currentPrice: number }) => {
  const { updateAssetPrice } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(currentPrice.toString());

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="text-[9px] font-bold text-violet-400/60 hover:text-violet-400 uppercase tracking-[0.15em] flex items-center gap-1 mt-1 transition-colors"
      >
        <Edit3 size={10} /> Update Price
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <input 
        autoFocus
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-16 bg-white/5 border border-white/10 rounded-md px-1 py-0.5 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
      />
      <button 
        onClick={async () => {
          await updateAssetPrice(id, parseFloat(price));
          setIsEditing(false);
        }}
        className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
      >
        <Check size={10} />
      </button>
      <button 
        onClick={() => setIsEditing(false)}
        className="w-5 h-5 rounded-md bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 transition-all"
      >
        <X size={10} />
      </button>
    </div>
  );
};

const PositionManager = ({ asset }: { asset: Asset }) => {
  const { adjustAssetPosition } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState(asset.currentPrice.toString());

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(qty);
    if (isNaN(q) || q <= 0) return;
    
    await adjustAssetPosition(asset.id, mode === "buy" ? q : -q, parseFloat(price));
    setIsOpen(false);
    setQty("");
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-all"
        title="Manage position"
      >
        <BarChart4 size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-[#0D0D0D] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <Briefcase size={14} />
                  </div>
                  <h3 className="font-bold text-white tracking-tight uppercase">{asset.ticker} Position</h3>
                </div>
              </div>

              <div className="p-6">
                <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                  <button 
                    onClick={() => setMode("buy")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      mode === "buy" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-white/20 hover:text-white/40"
                    )}
                  >
                    <ArrowUpCircle size={14} /> Buy More
                  </button>
                  <button 
                    onClick={() => setMode("sell")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      mode === "sell" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-white/20 hover:text-white/40"
                    )}
                  >
                    <ArrowDownCircle size={14} /> Sell Partial
                  </button>
                </div>

                <form onSubmit={handleAdjust} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-1">Quantity (Shares)</label>
                    <input 
                      type="number" step="0.0001"
                      autoFocus
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                    />
                  </div>
                  
                  {mode === "buy" && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-1">Purchase Price</label>
                      <input 
                        type="number" step="0.01"
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <Button 
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 h-12 bg-white/5 border-0 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className={cn(
                        "flex-[2] h-12 border-0 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl",
                        mode === "buy" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                      )}
                    >
                      Process Transaction
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export const StockAssets = () => {
  const { assets, addAsset, removeAsset, updateAssetPrice } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newAsset, setNewAsset] = useState({
    name: "",
    ticker: "",
    quantity: "", // Shares
    purchasePrice: "",
    currentPrice: "",
    type: "stock" as const
  });
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Auto-hide toast
  React.useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const stockAssets = assets.filter(a => 
    a.type === "stock" && 
    (a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     a.ticker?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = useMemo(() => {
    const totalValue = stockAssets.reduce((acc, a) => acc + (a.currentPrice * a.quantity), 0);
    const totalCost = stockAssets.reduce((acc, a) => acc + (a.purchasePrice * a.quantity), 0);
    const profit = totalValue - totalCost;
    const profitPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    return { totalValue, totalCost, profit, profitPercentage };
  }, [stockAssets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.ticker || !newAsset.quantity) return;
    
    await addAsset({
      name: newAsset.name,
      ticker: newAsset.ticker.toUpperCase(),
      quantity: parseFloat(newAsset.quantity),
      purchasePrice: parseFloat(newAsset.purchasePrice) || 0,
      currentPrice: parseFloat(newAsset.currentPrice) || parseFloat(newAsset.purchasePrice) || 0,
      type: "stock",
      date: new Date().toISOString()
    });
    
    setSuccessToast(`${newAsset.ticker.toUpperCase()} added to portfolio`);
    setNewAsset({ name: "", ticker: "", quantity: "", purchasePrice: "", currentPrice: "", type: "stock" });
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
            Stock Portfolio <BarChart4 className="text-violet-400" size={32} />
          </h2>
          <p className="text-white/40 font-medium max-w-md leading-relaxed">
            Monitor your equity investments, track dividend yields, and analyze portfolio performance.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              placeholder="Filter holdings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            />
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white border-0 h-14 px-8 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] shadow-2xl shadow-violet-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} className="mr-2" />
            Buy Listing
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <Card className="p-8 bg-white/[0.02] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-violet-500/10 group-hover:scale-110 transition-transform">
            <Briefcase size={48} />
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Portfolio Value</p>
          <h3 className="text-5xl font-black text-white tracking-tighter mb-1">{formatCurrency(stats.totalValue)}</h3>
          <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest">Total Net Asset Value</p>
        </Card>

        <Card className="p-8 bg-white/[0.02] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:scale-110 transition-transform">
            <TrendingUp size={48} />
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Total Unrealized P/L</p>
          <div className="flex items-center gap-3 mb-1">
            <h3 className={cn(
              "text-5xl font-black tracking-tighter",
              stats.profit >= 0 ? "text-emerald-400" : "text-rose-400"
            )}>
              {stats.profit >= 0 ? "+" : ""}{formatCurrency(stats.profit)}
            </h3>
            <div className={cn(
              "px-2 py-1 rounded-lg text-[10px] font-black",
              stats.profit >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            )}>
              {stats.profitPercentage.toFixed(2)}%
            </div>
          </div>
          <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest">Performance from Inception</p>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-8 bg-white/[0.02] border-white/5 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Total Cost</p>
            <h4 className="text-2xl font-bold text-white/60 tracking-tight">{formatCurrency(stats.totalCost)}</h4>
          </Card>
          <Card className="p-8 bg-white/[0.02] border-white/5 flex flex-col justify-center">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Holdings</p>
            <h4 className="text-2xl font-bold text-white/60 tracking-tight">{stockAssets.length} Tickers</h4>
          </Card>
        </div>
      </div>

      {/* Portfolio Table */}
      <Card className="bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-left">Equity / Listing</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-left">Quantity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-left">Avg Cost</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-left">Price</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-left">G/L</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-left">Position</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stockAssets.map((asset) => {
                const marketValue = asset.quantity * asset.currentPrice;
                const costBasis = asset.quantity * asset.purchasePrice;
                const gl = marketValue - costBasis;
                const glPercent = costBasis > 0 ? (gl / costBasis) * 100 : 0;

                return (
                  <tr key={asset.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[14px] bg-white/[0.02] border border-white/5 text-white/40 flex items-center justify-center font-black text-xs uppercase">
                          {asset.ticker?.substring(0, 2) || "??"}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white tracking-tight uppercase">{asset.ticker}</p>
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none mt-1 truncate max-w-[120px]">{asset.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-white tracking-tighter">{asset.quantity.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Shares Held</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-white/40 tracking-tighter">{formatCurrency(asset.purchasePrice)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-white tracking-tighter">{formatCurrency(asset.currentPrice)}</p>
                      <UpdatePriceButton id={asset.id} currentPrice={asset.currentPrice} />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className={cn(
                          "text-sm font-black tracking-tighter",
                          gl >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {gl >= 0 ? "+" : ""}{formatCurrency(gl)}
                        </p>
                        <p className={cn(
                          "text-[9px] font-black uppercase tracking-widest mt-0.5",
                          gl >= 0 ? "text-emerald-500/30" : "text-rose-500/30"
                        )}>
                          {gl >= 0 ? "+" : ""}{glPercent.toFixed(2)}%
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="text-sm font-black text-white tracking-tighter">{formatCurrency(marketValue)}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Net Valuation</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <PositionManager asset={asset} />
                        <button 
                          onClick={() => removeAsset(asset.id)}
                          className="w-10 h-10 rounded-xl bg-white/5 text-white/20 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                          title="Remove holding"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {stockAssets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-white/[0.02] flex items-center justify-center text-white/5">
                        <TrendingUp size={32} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white/40 tracking-tight">Empty Portfolio</p>
                        <p className="text-xs text-white/20">Add your first equity holding to start tracking.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Stock Modal */}
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
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-violet-600/5">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Buy Equity Listing</h3>
                  <p className="text-xs text-white/40">Enter listing details to analyze portfolio weights.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                  <BarChart4 size={20} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Ticker Symbol</label>
                    <input 
                      autoFocus
                      placeholder="e.g., AAPL"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:uppercase"
                      value={newAsset.ticker}
                      onChange={(e) => setNewAsset({ ...newAsset, ticker: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Full Company Name</label>
                    <input 
                      placeholder="e.g., Apple Inc"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Total Shares</label>
                    <input 
                      type="number" step="0.0001"
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                      value={newAsset.quantity}
                      onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Current Price</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                      value={newAsset.currentPrice}
                      onChange={(e) => setNewAsset({ ...newAsset, currentPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Average Purchase Price</p>
                  <input 
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-transparent border-0 text-center text-2xl font-black text-white focus:outline-none placeholder:text-white/10"
                    value={newAsset.purchasePrice}
                    onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: e.target.value })}
                  />
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
                    className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white border-0 h-14 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-violet-600/20"
                  >
                    Add to Portfolio
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
            <div className="bg-violet-600 text-white px-6 py-4 rounded-[24px] shadow-2xl shadow-violet-600/20 flex items-center gap-4 border border-violet-400/20">
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
