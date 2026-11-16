import React from 'react';
import { BookOpen, Sparkles, ShieldCheck } from 'lucide-react';
import { ProspectusChat } from '@/components/rag/ProspectusChat';
import { Card, CardContent } from '@/components/ui/card';

export const ProspectusRAGPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          SEBI DRHP & Prospectus RAG Studio
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Retrieval-Augmented Generation directly over Red Herring Prospectuses (RHP) submitted to SEBI, BSE & NSE.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Zero Hallucination</span>
            <div className="text-sm font-semibold text-foreground">Statutory Section Citations</div>
            <p className="text-xs text-slate-500">Every response links to exact filing pages and prospectus clauses.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Risk Factor Analysis</span>
            <div className="text-sm font-semibold text-foreground">Litigation & Royalty Audits</div>
            <p className="text-xs text-slate-500">Extract promoter liabilities, tax claims, and foreign royalty payouts.</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Fund Deployment</span>
            <div className="text-sm font-semibold text-foreground">Objects of the Issue</div>
            <p className="text-xs text-slate-500">Verify whether proceeds go to growth/capex or debt servicing & OFS.</p>
          </CardContent>
        </Card>
      </div>

      <ProspectusChat />
    </div>
  );
};

