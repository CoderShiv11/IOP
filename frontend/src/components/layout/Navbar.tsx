import React from 'react';
import { TrendingUp, BarChart2, MessageSquareText, Cpu, Search, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'ipos', label: 'IPO Hub', icon: BarChart2 },
    { id: 'sentiment', label: 'FinBERT Sentiment', icon: Sparkles },
    { id: 'rag', label: 'DRHP AI Assistant', icon: MessageSquareText },
    { id: 'predictor', label: 'Listing Gain Predictor', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                INDIA IPO AI
              </span>
              <span className="block text-[10px] text-muted-foreground font-mono font-medium -mt-1 text-slate-500 dark:text-slate-400">
                NSE • BSE ANALYZER
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Swiggy, Hyundai..."
              className="h-9 w-48 lg:w-64 rounded-lg border border-border bg-slate-50 dark:bg-slate-900 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-slate-400"
            />
          </div>

          <ThemeToggle />

          <Button
            size="sm"
            onClick={() => setActiveTab('predictor')}
            className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Predict Gains
          </Button>
        </div>
      </div>
    </header>
  );
};

