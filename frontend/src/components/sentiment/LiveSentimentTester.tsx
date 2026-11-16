import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { TextSentimentAnalysisResponse } from '@/types';

export const LiveSentimentTester: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TextSentimentAnalysisResponse | null>(null);

  const sampleHeadlines = [
    'Swiggy shares debut with 8% premium as institutional anchor bids surge on Day 1.',
    'Hyundai India listing disappoints with discount open amid expensive valuation and sluggish sales.',
    'Bajaj Housing Finance delivers 114% multibagger return as retail and QIB books explode 67x.',
    'SEBI issues regulatory caution on high SME valuations; investor scrutiny intensifies.',
  ];

  const handleAnalyze = async (sample?: string) => {
    const queryText = sample || text;
    if (!queryText.trim()) return;

    setLoading(true);
    try {
      const res = await api.analyzeTextSentiment({ text: queryText });
      setResult(res);
      if (sample) setText(sample);
    } catch (err) {
      console.error('Sentiment analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-500" />
          Live FinBERT Sentiment Inference Engine
        </CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter any financial headline, broker note, or management commentary to classify sentiment using financial NLP.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste financial headline..."
            rows={3}
            className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Try samples:</span>
            {sampleHeadlines.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnalyze(sample)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
              >
                Sample {idx + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={() => handleAnalyze()}
            disabled={loading || !text.trim()}
            className="w-full sm:w-auto"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing via FinBERT...
              </>
            ) : (
              <>
                Run Inference
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Classification:</span>
                <Badge
                  variant={
                    result.sentiment_label === 'BULLISH'
                      ? 'bullish'
                      : result.sentiment_label === 'BEARISH'
                      ? 'bearish'
                      : 'neutral'
                  }
                  className="text-xs font-mono font-bold"
                >
                  {result.sentiment_label}
                </Badge>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Confidence: <span className="font-bold text-foreground">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <span className="block text-[10px] text-slate-400 uppercase font-sans">Positive Prob</span>
                <span className="text-emerald-500 font-semibold">{(result.positive_prob * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <span className="block text-[10px] text-slate-400 uppercase font-sans">Neutral Prob</span>
                <span className="text-amber-500 font-semibold">{(result.neutral_prob * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <span className="block text-[10px] text-slate-400 uppercase font-sans">Negative Prob</span>
                <span className="text-rose-500 font-semibold">{(result.negative_prob * 100).toFixed(1)}%</span>
              </div>
            </div>

            {result.key_drivers.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Detected Financial Drivers:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.key_drivers.map((driver, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {driver}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

