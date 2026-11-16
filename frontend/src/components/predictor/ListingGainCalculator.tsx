import React, { useState } from 'react';
import { Cpu, Calculator, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { ListingGainPredictionRequest, ListingGainPredictionResponse } from '@/types';
import { formatINR } from '@/lib/utils';

export const ListingGainCalculator: React.FC = () => {
  const [formData, setFormData] = useState<ListingGainPredictionRequest>({
    issue_price: 390.0,
    current_gmp: 25.0,
    qib_subscription: 6.02,
    nii_subscription: 4.14,
    retail_subscription: 3.15,
    market_sentiment_score: 0.25,
    pe_ratio: 35.0,
    industry_pe: 42.0,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ListingGainPredictionResponse | null>(null);

  const presets = [
    {
      name: 'Swiggy Setup',
      data: {
        issue_price: 390.0,
        current_gmp: 25.0,
        qib_subscription: 6.02,
        nii_subscription: 4.14,
        retail_subscription: 3.15,
        market_sentiment_score: 0.25,
        pe_ratio: -38.5,
        industry_pe: 45.0,
      },
    },
    {
      name: 'Bajaj Housing Setup',
      data: {
        issue_price: 70.0,
        current_gmp: 82.0,
        qib_subscription: 209.36,
        nii_subscription: 41.51,
        retail_subscription: 7.41,
        market_sentiment_score: 0.75,
        pe_ratio: 29.8,
        industry_pe: 24.5,
      },
    },
    {
      name: 'Tata Tech Setup',
      data: {
        issue_price: 500.0,
        current_gmp: 410.0,
        qib_subscription: 203.41,
        nii_subscription: 62.11,
        retail_subscription: 16.5,
        market_sentiment_score: 0.85,
        pe_ratio: 32.5,
        industry_pe: 65.0,
      },
    },
  ];

  const handlePredict = async (customData?: ListingGainPredictionRequest) => {
    const payload = customData || formData;
    setLoading(true);
    try {
      const res = await api.predictListingGain(payload);
      setResult(res);
      if (customData) setFormData(customData);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return <Badge variant="bullish">LOW RISK</Badge>;
      case 'MODERATE':
        return <Badge variant="neutral">MODERATE RISK</Badge>;
      case 'HIGH':
        return <Badge variant="bearish">HIGH RISK</Badge>;
      default:
        return <Badge variant="bearish">EXTREME RISK</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Parameter Input Form */}
      <Card className="lg:col-span-5 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Listing Gain Simulator
            </CardTitle>
            <span className="text-[11px] font-mono text-slate-400">Scikit-Learn ML</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulate institutional demand, GMP, and FinBERT sentiment parameters to predict listing price.
          </p>

          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold self-center mr-1">Presets:</span>
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePredict(p.data)}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Issue Price (₹)</label>
              <input
                type="number"
                value={formData.issue_price}
                onChange={(e) => setFormData({ ...formData, issue_price: Number(e.target.value) })}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Current GMP (₹)</label>
              <input
                type="number"
                value={formData.current_gmp}
                onChange={(e) => setFormData({ ...formData, current_gmp: Number(e.target.value) })}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-mono font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">QIB Demand (x)</label>
              <input
                type="number"
                step="0.1"
                value={formData.qib_subscription}
                onChange={(e) => setFormData({ ...formData, qib_subscription: Number(e.target.value) })}
                className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">NII / HNI (x)</label>
              <input
                type="number"
                step="0.1"
                value={formData.nii_subscription}
                onChange={(e) => setFormData({ ...formData, nii_subscription: Number(e.target.value) })}
                className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">Retail (x)</label>
              <input
                type="number"
                step="0.1"
                value={formData.retail_subscription}
                onChange={(e) => setFormData({ ...formData, retail_subscription: Number(e.target.value) })}
                className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">P/E Ratio</label>
              <input
                type="number"
                value={formData.pe_ratio || ''}
                onChange={(e) => setFormData({ ...formData, pe_ratio: Number(e.target.value) })}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Sector Benchmark P/E</label>
              <input
                type="number"
                value={formData.industry_pe || ''}
                onChange={(e) => setFormData({ ...formData, industry_pe: Number(e.target.value) })}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 font-medium mb-1">
              <span>FinBERT Sentiment Score</span>
              <span className="font-mono font-semibold text-foreground">
                {formData.market_sentiment_score > 0 ? '+' : ''}
                {formData.market_sentiment_score.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="-1.0"
              max="1.0"
              step="0.05"
              value={formData.market_sentiment_score}
              onChange={(e) => setFormData({ ...formData, market_sentiment_score: Number(e.target.value) })}
              className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-primary cursor-pointer"
            />
          </div>

          <Button
            onClick={() => handlePredict()}
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Computing AI Estimates...
              </>
            ) : (
              <>
                Run ML Listing Gain Prediction
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Prediction Output Display */}
      <Card className="lg:col-span-7 border-border flex flex-col justify-between">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-500" />
              AI Listing Day Projection
            </CardTitle>
            {result && getRiskBadge(result.risk_level)}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {result ? (
            <>
              {/* Primary Listing Price Metric */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-border text-center space-y-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Predicted Listing Price
                </span>
                <div className="text-4xl font-extrabold font-mono text-foreground flex items-center justify-center gap-2">
                  <span>{formatINR(result.predicted_listing_price)}</span>
                  <span
                    className={`text-xl font-bold ${
                      result.predicted_gain_pct >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    ({result.predicted_gain_pct >= 0 ? '+' : ''}
                    {result.predicted_gain_pct.toFixed(2)}%)
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono pt-1">
                  Estimated Range: {formatINR(result.predicted_price_low)} — {formatINR(result.predicted_price_high)} (±
                  {result.confidence_interval_pct}%)
                </div>
              </div>

              {/* Recommendation Banner */}
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                      Analyst Recommendation
                    </span>
                    <span className="text-xs font-bold text-foreground">{result.recommendation}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 uppercase block">Profit Probability</span>
                  <span className="text-sm font-bold text-emerald-500">
                    {(result.success_probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Feature Importance Attribution */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Model Feature Attribution:
                </span>
                <div className="space-y-1.5">
                  {result.feature_importance.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-card border border-border"
                    >
                      <span className="font-medium text-slate-600 dark:text-slate-300">{item.feature}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-400 text-[11px]">{item.value}</span>
                        <span className="text-primary font-semibold text-[11px] w-12 text-right">
                          {item.weight}% wt
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Cpu className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-medium">Select a preset or click Run ML Listing Gain Prediction</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Trained on Indian Mainboard IPOs across bull and bear cycles to estimate debut day opening pops.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

