import React, { useEffect, useState } from 'react';
import { Search, LayoutGrid, Table as TableIcon, Filter } from 'lucide-react';
import { IPO } from '@/types';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { IPOCard } from '@/components/ipo/IPOCard';
import { IPOTable } from '@/components/ipo/IPOTable';

interface IPOsPageProps {
  onSelectIPO: (ipo: IPO) => void;
}

export const IPOsPage: React.FC<IPOsPageProps> = ({ onSelectIPO }) => {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [seriesFilter, setSeriesFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    const fetchIPOs = async () => {
      setLoading(true);
      try {
        const statusParam = statusFilter !== 'ALL' ? statusFilter : undefined;
        const seriesParam = seriesFilter !== 'ALL' ? seriesFilter : undefined;
        const data = await api.getIPOs(statusParam, seriesParam);
        setIpos(data);
      } catch (err) {
        console.error('Failed to load IPOs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIPOs();
  }, [statusFilter, seriesFilter]);

  const filteredIPOs = ipos.filter(
    (ipo) =>
      ipo.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ipo.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ipo.sector && ipo.sector.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            NSE & BSE IPO Intelligence Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time track of Mainboard & SME Initial Public Offerings, GMP, issue dates, and valuations.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-border flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-foreground shadow-sm'
                  : 'text-slate-500 hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-foreground shadow-sm'
                  : 'text-slate-500 hover:text-foreground'
              }`}
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'OPEN', 'UPCOMING', 'LISTED', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {status === 'ALL' ? 'All Issues' : status}
            </button>
          ))}
        </div>

        {/* Series Filter & Search */}
        <div className="flex items-center gap-3">
          <select
            value={seriesFilter}
            onChange={(e) => setSeriesFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Series (Mainboard + SME)</option>
            <option value="MAINBOARD">Mainboard Only</option>
            <option value="SME">NSE / BSE SME</option>
          </select>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search company, symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-48 sm:w-60 rounded-lg border border-border bg-background pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading market issues...</div>
      ) : filteredIPOs.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          No IPOs found matching the specified filters.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIPOs.map((ipo) => (
            <IPOCard key={ipo.id} ipo={ipo} onSelect={onSelectIPO} />
          ))}
        </div>
      ) : (
        <IPOTable ipos={filteredIPOs} onSelectIPO={onSelectIPO} />
      )}
    </div>
  );
};

