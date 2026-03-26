import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Users, 
  FileText, 
  Settings,
  PlusCircle,
  LogOut,
  Search,
  Layers,
  Calendar,
  Coins,
  Bitcoin
} from "lucide-react";
import { cn } from "@/lib/utils";

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-4 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl relative group",
      active 
        ? "text-white bg-violet-600/10" 
        : "text-white/40 hover:text-white hover:bg-white/[0.02]"
    )}
  >
    {active && <div className="absolute left-0 w-1 h-5 bg-violet-500 rounded-full" />}
    <Icon size={18} className={cn("transition-transform group-hover:scale-110", active ? "text-violet-400" : "text-white/40")} />
    {label}
  </button>
);

export const Sidebar = ({ activeTab, setActiveTab }: any) => {
  const { ledgers, currentLedgerId, setCurrentLedgerId, addLedger } = useFinance();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "monthly", label: "Monthly", icon: Calendar },
    { id: "allocations", label: "Allocations", icon: Receipt, category: "Planning" },
    { id: "transactions", label: "Ledger", icon: Wallet },
    { id: "reports", label: "Insights", icon: FileText, category: "Insights" },
    { id: "debts", label: "Debts", icon: Users, category: "Liabilities" },
    { id: "gold_loans", label: "Gold Loans", icon: Coins, category: "Liabilities" },
    { id: "gold_assets", label: "Gold", icon: Coins, category: "Assets" },
    { id: "stock_assets", label: "Stocks", icon: Layers, category: "Assets" },
    { id: "crypto_assets", label: "Crypto", icon: Bitcoin, category: "Assets" },
  ].filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <aside className="w-72 h-screen border-r border-white/5 flex flex-col p-6 bg-black/20 backdrop-blur-3xl sticky top-0">
      <div className="flex items-center gap-3 mb-10 group cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-xl shadow-violet-600/20 group-hover:scale-105 transition-transform">
          <Layers className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-none mb-1">Salary.lk</h1>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Finance OS</p>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
          <Search size={14} />
        </div>
        <input 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
        />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Main Sections */}
        {filteredItems.filter(i => !i.category).map(item => (
          <NavItem 
            key={item.id}
            icon={item.icon} 
            label={item.label} 
            active={activeTab === item.id} 
            onClick={() => setActiveTab(item.id)} 
          />
        ))}

        {/* Planning Section */}
        <div className="pt-4 mb-2">
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold px-4 mb-2">Planning</p>
          {filteredItems.filter(i => i.category === "Planning").map(item => (
            <NavItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={activeTab === item.id} 
              onClick={() => setActiveTab(item.id)} 
            />
          ))}
        </div>

        {/* Insights Section */}
        <div className="pt-4 mb-2">
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold px-4 mb-2">Analytics</p>
          {filteredItems.filter(i => i.category === "Insights").map(item => (
            <NavItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={activeTab === item.id} 
              onClick={() => setActiveTab(item.id)} 
            />
          ))}
        </div>

        {/* Assets Section */}
        <div className="pt-2 mb-2">
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold px-4 mb-2">Assets</p>
          {filteredItems.filter(i => i.category === "Assets").map(item => (
            <NavItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={activeTab === item.id} 
              onClick={() => setActiveTab(item.id)} 
            />
          ))}
        </div>

        {/* Liabilities Section */}
        <div className="pt-2 mb-2">
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold px-4 mb-2">Liabilities</p>
          {filteredItems.filter(i => i.category === "Liabilities").map(item => (
            <NavItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={activeTab === item.id} 
              onClick={() => setActiveTab(item.id)} 
            />
          ))}
        </div>
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Your Ledgers</p>
            <button 
              onClick={async () => {
                const name = prompt("Enter ledger name:");
                if (name) await addLedger({ name, description: "", color: `#${Math.floor(Math.random()*16777215).toString(16)}` });
              }}
              className="text-white/30 hover:text-white transition-colors"
            >
              <PlusCircle size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {ledgers.map((ledger) => (
              <button
                key={ledger.id}
                onClick={() => setCurrentLedgerId(ledger.id)}
                className={cn(
                  "flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                  currentLedgerId === ledger.id ? "bg-white/5 text-white" : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
                )}
              >
                <div 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: ledger.color || '#3b82f6' }} 
                />
                <span className="truncate">{ledger.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <NavItem icon={Settings} label="System" active={false} />
          <NavItem icon={LogOut} label="Sign out" active={false} />
        </div>
      </div>
    </aside>
  );
};
