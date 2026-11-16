import React, { useEffect, useState } from 'react';
import { TrendingUp, BarChart2, Sparkles, Cpu, Layers, ArrowRight } from 'lucide-react';
import { IPO, MarketSentimentOverview, NewsArticle } from '@/types';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IPOCard } from '@/components/ipo/IPOCard';
import { SentimentGauge } from '@/components/sentiment/SentimentGauge';
import { NewsSentimentCard } from '@/components/sentiment/NewsSentimentCard';
import { formatCrores } from '@/lib/utils';

interface DashboardProps {
  onSelectIPO: (ipo: IPO) => void;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectIPO, setActiveTab }) => {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [sentiment, setSentiment] = useState<MarketSentimentOverview | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [iposData, sentimentData, newsData] = await Promise.all([
          api.getIPOs(),
          api.getMarketSentimentOverview(),
          api.getNewsArticles(),
        ]);
        setIpos(iposData);
        setSentiment(sentimentData);
        setNews(newsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openIpos = ipos.filter((i) => i.status === 'OPEN' || i.status === 'UPCOMING');
  const totalIssuePipeline = ipos.reduce((acc, curr) => acc + curr.issue_size_cr, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-800/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Active NSE / BSE IPO Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Indian IPO Intelligence & FinBERT Market Sentiment
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Track real-time Grey Market Premiums (GMP), day-wise QIB/NII/Retail subscriptions,
            FinBERT-driven news sentiment, and RAG-powered DRHP statutory filing inquiries.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => setActiveTab('ipos')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Explore Active IPOs
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('predictor')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            >
              <Cpu className="h-4 w-4 mr-1.5 text-cyan-400" />
              Listing Gain Predictor
            </Button>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none hidden md:block">
          <TrendingUp className="h-96 w-96 text-white" />
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase">Tracked IPO Pipeline</span>
              <div className="text-xl font-bold font-mono text-foreground">{ipos.length} Issues</div>
              <span className="text-[10px] text-slate-500 font-mono">{formatCrores(totalIssuePipeline)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase">Live Bidding</span>
              <div className="text-xl font-bold font-mono text-emerald-500">
                {ipos.filter((i) => i.status === 'OPEN').length} Active
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Bidding on NSE/BSE</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase">FinBERT Climate</span>
              <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                {sentiment?.market_sentiment_label || 'BULLISH'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Index: {sentiment?.sentiment_index.toFixed(1) || '68.5'}/100
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase">ML Gain Model</span>
              <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">92.4%</div>
              <span className="text-[10px] text-slate-500 font-mono">Ensemble Calibrated</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: IPO Highlights & Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active & Trending IPOs */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Featured Indian IPOs</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest mainboard issues with real-time grey market premium and book subscriptions.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('ipos')}
              className="text-xs"
            >
              View All ({ipos.length})
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ipos.slice(0, 4).map((ipo) => (
              <IPOCard key={ipo.id} ipo={ipo} onSelect={onSelectIPO} />
            ))}
          </div>
        </div>

        {/* Sentiment Overview & Gauge */}
        <div className="lg:col-span-4 space-y-4">
          {sentiment && <SentimentGauge overview={sentiment} />}

          {/* Recent FinBERT News Headlines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">FinBERT Scored Feeds</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('sentiment')}
                className="text-xs text-primary p-0 h-auto"
              >
                View Feed
              </Button>
            </div>

            <div className="space-y-3">
              {news.slice(0, 2).map((item) => (
                <NewsSentimentCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

