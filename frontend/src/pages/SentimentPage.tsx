import React, { useEffect, useState } from 'react';
import { Sparkles, Newspaper, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { MarketSentimentOverview, NewsArticle } from '@/types';
import { api } from '@/services/api';
import { SentimentGauge } from '@/components/sentiment/SentimentGauge';
import { LiveSentimentTester } from '@/components/sentiment/LiveSentimentTester';
import { NewsSentimentCard } from '@/components/sentiment/NewsSentimentCard';

export const SentimentPage: React.FC = () => {
  const [sentiment, setSentiment] = useState<MarketSentimentOverview | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sentData, newsData] = await Promise.all([
          api.getMarketSentimentOverview(),
          api.getNewsArticles(),
        ]);
        setSentiment(sentData);
        setArticles(newsData);
      } catch (err) {
        console.error('Failed to load sentiment page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredArticles = articles.filter((a) => {
    if (filter === 'ALL') return true;
    return a.sentiment_label === filter;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-cyan-500" />
          FinBERT AI Sentiment Engine
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          State-of-the-art financial NLP model for Indian capital markets, analyzing IPO filings, news wires, and broker notes.
        </p>
      </div>

      {/* Top Section: Sentiment Gauge + Interactive Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          {sentiment ? (
            <SentimentGauge overview={sentiment} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
              Loading market sentiment gauge...
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <LiveSentimentTester />
        </div>
      </div>

      {/* Real-time News Sentiment Stream */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              Live Indian Financial News Sentiment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated from Economic Times, LiveMint, Moneycontrol with FinBERT inference.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-border">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                filter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-foreground shadow-sm'
                  : 'text-slate-500 hover:text-foreground'
              }`}
            >
              All ({articles.length})
            </button>
            <button
              onClick={() => setFilter('BULLISH')}
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                filter === 'BULLISH'
                  ? 'bg-emerald-500/20 text-emerald-500 font-bold'
                  : 'text-slate-500 hover:text-emerald-500'
              }`}
            >
              Bullish Only
            </button>
            <button
              onClick={() => setFilter('BEARISH')}
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                filter === 'BEARISH'
                  ? 'bg-rose-500/20 text-rose-500 font-bold'
                  : 'text-slate-500 hover:text-rose-500'
              }`}
            >
              Bearish Only
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading financial headlines...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No articles matching filter.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((article) => (
              <NewsSentimentCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

