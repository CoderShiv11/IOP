import React from 'react';
import { IPO } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GMPBadge } from './GMPBadge';
import { SubscriptionProgress } from './SubscriptionProgress';
import { formatCrores, formatDate, formatINR } from '@/lib/utils';

interface IPOTableProps {
  ipos: IPO[];
  onSelectIPO: (ipo: IPO) => void;
}

export const IPOTable: React.FC<IPOTableProps> = ({ ipos, onSelectIPO }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="open">OPEN</Badge>;
      case 'UPCOMING':
        return <Badge variant="upcoming">UPCOMING</Badge>;
      case 'LISTED':
        return <Badge variant="listed">LISTED</Badge>;
      default:
        return <Badge variant="secondary">CLOSED</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900/60">
          <TableRow>
            <TableHead className="font-semibold text-xs">Company / Symbol</TableHead>
            <TableHead className="font-semibold text-xs">Status</TableHead>
            <TableHead className="font-semibold text-xs">Dates</TableHead>
            <TableHead className="font-semibold text-xs">Price Band</TableHead>
            <TableHead className="font-semibold text-xs">Issue Size</TableHead>
            <TableHead className="font-semibold text-xs">Lot Size</TableHead>
            <TableHead className="font-semibold text-xs">Current GMP</TableHead>
            <TableHead className="font-semibold text-xs">Subscription</TableHead>
            <TableHead className="font-semibold text-xs">FinBERT Sentiment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ipos.map((ipo) => (
            <TableRow
              key={ipo.id}
              onClick={() => onSelectIPO(ipo)}
              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <TableCell className="font-medium">
                <div className="font-semibold text-foreground">{ipo.company_name}</div>
                <div className="text-xs font-mono text-slate-500">
                  {ipo.symbol} • <span className="text-[11px]">{ipo.series}</span>
                </div>
              </TableCell>

              <TableCell>{getStatusBadge(ipo.status)}</TableCell>

              <TableCell className="text-xs font-mono">
                <div>Open: {formatDate(ipo.open_date)}</div>
                <div className="text-slate-400">Close: {formatDate(ipo.close_date)}</div>
              </TableCell>

              <TableCell className="font-mono text-xs font-semibold">
                {formatINR(ipo.price_band_low)} - {formatINR(ipo.price_band_high)}
              </TableCell>

              <TableCell className="font-mono text-xs font-semibold">
                {formatCrores(ipo.issue_size_cr)}
              </TableCell>

              <TableCell className="font-mono text-xs">
                {ipo.lot_size} shares
              </TableCell>

              <TableCell>
                <GMPBadge gmp={ipo.current_gmp} expectedGainPct={ipo.expected_gain_pct} />
              </TableCell>

              <TableCell>
                <SubscriptionProgress total={ipo.latest_total_subscription} compact />
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    ipo.sentiment_label === 'BULLISH'
                      ? 'bullish'
                      : ipo.sentiment_label === 'BEARISH'
                      ? 'bearish'
                      : 'neutral'
                  }
                >
                  {ipo.sentiment_label || 'NEUTRAL'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

