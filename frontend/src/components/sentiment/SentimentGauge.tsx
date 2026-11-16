import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MarketSentimentOverview } from '@/types';

interface SentimentGaugeProps {
  overview: MarketSentimentOverview;
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({ overview }) => {
  const { sentiment_index, market_sentiment_label, bullish_percentage, bearish_percentage, neutral_percentage } = overview;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-500" />
            FinBERT Market Sentiment Index
          </CardTitle>
          <span className="text-xs font-mono text-slate-400">
            {overview.total_analyzed} News Feeds Scanned
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="text-4xl font-extrabold font-mono tracking-tight text-foreground flex items-baseline gap-1">
            {sentiment_index.toFixed(1)}
            <span className="text-sm font-normal text-slate-400 font-sans">/ 100</span>
          </div>
          <div
            className={`mt-1 font-semibold text-sm uppercase tracking-wider flex items-center gap-1.5 ${
              market_sentiment_label === 'BULLISH'
                ? 'text-emerald-500'
                : market_sentiment_label === 'BEARISH'
                ? 'text-rose-500'
                : 'text-amber-500'
            }`}
          >
            {market_sentiment_label === 'BULLISH' && <TrendingUp className="h-4 w-4" />}
            {market_sentiment_label === 'BEARISH' && <TrendingDown className="h-4 w-4" />}
            {market_sentiment_label === 'NEUTRAL' && <Minus className="h-4 w-4" />}
            {market_sentiment_label} CLIMATE
          </div>
        </div>

        {/* Sentiment Gradient Slider */}
        <div className="space-y-1">
          <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 overflow-hidden shadow-inner">
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-white border border-slate-800 rounded-full shadow-md -ml-1 transition-all duration-500"
              style={{ left: `${sentiment_index}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono font-medium">
            <span>Extreme Fear (0)</span>
            <span>Neutral (50)</span>
            <span>Extreme Greed (100)</span>
          </div>
        </div>

        {/* Ratio Breakdown */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Bullish</div>
            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {bullish_percentage}%
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">Neutral</div>
            <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
              {neutral_percentage}%
            </div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase">Bearish</div>
            <div className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
              {bearish_percentage}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

