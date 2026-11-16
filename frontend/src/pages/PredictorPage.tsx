import React from 'react';
import { Cpu, TrendingUp, Layers } from 'lucide-react';
import { ListingGainCalculator } from '@/components/predictor/ListingGainCalculator';

export const PredictorPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Cpu className="h-6 w-6 text-emerald-500" />
          IPO Listing Gain ML Predictor & Risk Estimator
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Machine learning ensemble trained on Indian IPO debut prices, utilizing GMP momentum, institutional QIB demand, and FinBERT sentiment.
        </p>
      </div>

      <ListingGainCalculator />
    </div>
  );
};

