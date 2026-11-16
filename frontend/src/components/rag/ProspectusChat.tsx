import React, { useState } from 'react';
import { MessageSquareText, Send, Sparkles, BookOpen, Clock, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { RAGQueryResponse } from '@/types';

interface ProspectusChatProps {
  selectedIpoId?: number;
}

export const ProspectusChat: React.FC<ProspectusChatProps> = ({ selectedIpoId = 1 }) => {
  const [ipoId, setIpoId] = useState<number>(selectedIpoId);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RAGQueryResponse | null>(null);

  const ipoOptions = [
    { id: 1, name: 'Swiggy Limited (SWIGGY)' },
    { id: 2, name: 'Hyundai Motor India Limited (HYUNDAI)' },
    { id: 3, name: 'Bajaj Housing Finance Limited (BAJAJHFL)' },
  ];

  const suggestedQueries = [
    'What are the core objects of the fresh issue proceeds?',
    'What are the top risk factors and parent royalty terms?',
    'How have EBITDA margins and net profits trended over the last 3 years?',
    'Who are the promoters and institutional pre-IPO shareholders?',
  ];

  const handleSend = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await api.queryProspectus(ipoId, q);
      setResponse(res);
      if (customQuery) setQuery(customQuery);
    } catch (err) {
      console.error('RAG query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              DRHP / RHP Document RAG Intelligence
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Query statutory SEBI filings with semantic vector search and exact section citations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Select IPO:</span>
            <select
              value={ipoId}
              onChange={(e) => {
                setIpoId(Number(e.target.value));
                setResponse(null);
              }}
              className="text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-semibold"
            >
              {ipoOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Suggested Queries */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Suggested Analyst Inquiries:</span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQueries.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(sq)}
                className="text-left text-xs bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 transition-colors border border-border"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about the DRHP (e.g. debt repayment, quick commerce dark stores)..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
          <Button
            size="sm"
            onClick={() => handleSend()}
            disabled={loading || !query.trim()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {/* Answer & Citations */}
        {response && (
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  SEBI Prospectus AI Synthesis
                </span>
                <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {response.latency_ms}ms • {(response.confidence * 100).toFixed(0)}% Match
                </span>
              </div>

              <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">
                {response.answer}
              </p>
            </div>

            {/* Citations */}
            {response.citations.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Statutory Citations & Snippets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {response.citations.map((cite, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-border bg-card text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-mono text-primary">
                          {cite.section}
                        </Badge>
                        <span className="text-[10px] font-mono text-emerald-500 font-semibold">
                          {(cite.relevance_score * 100).toFixed(0)}% rel
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] italic line-clamp-3">
                        "{cite.snippet}"
                      </p>
                    </div>
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

