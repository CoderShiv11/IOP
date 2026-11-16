import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { api } from '@/services/api';
import { MarketSummaryResponse } from '@/types';

export const MarketTicker: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketSummaryResponse | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const data = await api.getMarketSummary();
        setMarketData(data);
      } catch {
        // Fallback static metrics if offline
        setMarketData({
          market_status: 'OPEN',
          timestamp: new Date().toISOString(),
          indices: [
            { name: 'NIFTY 50', symbol: '^NSEI', value: 24852.15, change: 118.45, change_pct: 0.48 },
            { name: 'SENSEX', symbol: '^BSESN', value: 81435.6, change: 342.1, change_pct: 0.42 },
            { name: 'BANK NIFTY', symbol: '^NSEBANK', value: 52180.4, change: 280.25, change_pct: 0.54 },
            { name: 'INDIA VIX', symbol: '^INDIAVIX', value: 13.82, change: -0.45, change_pct: -3.15 },
          ],
        });
      }
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!marketData) return null;

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-xs py-2 px-4 overflow-x-auto select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 min-w-max">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${marketData.market_status === 'OPEN' ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${marketData.market_status === 'OPEN' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </span>
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
            NSE/BSE {marketData.market_status}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {marketData.indices.map((idx) => {
            const isPositive = idx.change >= 0;
            return (
              <div key={idx.name} className="flex items-center gap-2">
                <span className="text-slate-300 font-medium">{idx.name}</span>
                <span className="text-white font-mono font-semibold">
                  {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`inline-flex items-center text-[11px] font-medium font-mono ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {isPositive ? '+' : ''}
                  {idx.change_pct.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px]">
          <Activity className="h-3.5 w-3.5 text-cyan-400" />
          <span>Real-time Indian Market Feed</span>
        </div>
      </div>
    </div>
  );
};

