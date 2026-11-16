import React from 'react';
import { ExternalLink, Clock, Tag } from 'lucide-react';
import { NewsArticle } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface NewsSentimentCardProps {
  article: NewsArticle;
}

export const NewsSentimentCard: React.FC<NewsSentimentCardProps> = ({ article }) => {
  const getBadgeVariant = () => {
    if (article.sentiment_label === 'BULLISH') return 'bullish';
    if (article.sentiment_label === 'BEARISH') return 'bearish';
    return 'neutral';
  };

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={getBadgeVariant()} className="font-mono text-xs font-bold">
              {article.sentiment_label}
            </Badge>
            {article.symbol && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {article.symbol}
              </Badge>
            )}
            <span className="text-xs font-medium text-slate-400">{article.source}</span>
          </div>

          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(article.published_at)}
          </span>
        </div>

        <CardTitle className="text-sm font-semibold pt-1 leading-snug">
          {article.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {article.summary && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-border text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">FinBERT Score:</span>
            <span
              className={`font-bold ${
                article.sentiment_score > 0
                  ? 'text-emerald-500'
                  : article.sentiment_score < 0
                  ? 'text-rose-500'
                  : 'text-amber-500'
              }`}
            >
              {article.sentiment_score > 0 ? '+' : ''}
              {article.sentiment_score.toFixed(3)}
            </span>
            <span className="text-slate-400">({(article.confidence * 100).toFixed(0)}% conf)</span>
          </div>

          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-primary hover:underline text-[11px] font-sans"
            >
              Read Source <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

