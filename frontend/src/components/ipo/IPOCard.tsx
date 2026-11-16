import React from 'react';
import { Calendar, DollarSign, Layers, ArrowUpRight } from 'lucide-react';
import { IPO } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GMPBadge } from './GMPBadge';
import { formatCrores, formatDate, formatINR } from '@/lib/utils';

interface IPOCardProps {
  ipo: IPO;
  onSelect: (ipo: IPO) => void;
}

export const IPOCard: React.FC<IPOCardProps> = ({ ipo, onSelect }) => {
  const getStatusBadge = () => {
    switch (ipo.status) {
      case 'OPEN':
        return <Badge variant="open">LIVE BIDDING</Badge>;
      case 'UPCOMING':
        return <Badge variant="upcoming">UPCOMING</Badge>;
      case 'LISTED':
        return <Badge variant="listed">LISTED</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary">CLOSED</Badge>;
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge()}
              <Badge variant="outline" className="text-[10px] font-mono">
                {ipo.series}
              </Badge>
            </div>
            <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1">
              {ipo.company_name}
            </CardTitle>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              NSE: {ipo.symbol}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] text-slate-400 uppercase font-sans">Current GMP</span>
            <GMPBadge gmp={ipo.current_gmp} expectedGainPct={ipo.expected_gain_pct} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-border">
          <div>
            <span className="text-slate-400 block text-[10px]">Price Band</span>
            <span className="font-semibold font-mono text-foreground">
              {formatINR(ipo.price_band_low)} - {formatINR(ipo.price_band_high)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Issue Size</span>
            <span className="font-semibold font-mono text-foreground">{formatCrores(ipo.issue_size_cr)}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Lot Size / Min Bid</span>
            <span className="font-semibold font-mono text-foreground">
              {ipo.lot_size} shares ({formatINR(ipo.lot_size * ipo.price_band_high)})
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">Subscription</span>
            <span className="font-semibold font-mono text-foreground">
              {ipo.latest_total_subscription > 0 ? `${ipo.latest_total_subscription.toFixed(2)}x` : 'Awaiting Bids'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Closes: {formatDate(ipo.close_date)}
          </span>
          {ipo.sentiment_score !== undefined && (
            <span className="font-medium text-emerald-500 flex items-center gap-1">
              FinBERT: {ipo.sentiment_label}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="w-full text-xs"
          onClick={() => onSelect(ipo)}
        >
          View Full Prospectus & Analytics
          <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

