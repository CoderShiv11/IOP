import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, FileText, ExternalLink, ShieldCheck, TrendingUp, BarChart2, Layers } from 'lucide-react';
import { IPODetail } from '@/types';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GMPBadge } from '@/components/ipo/GMPBadge';
import { SubscriptionProgress } from '@/components/ipo/SubscriptionProgress';
import { ProspectusChat } from '@/components/rag/ProspectusChat';
import { formatCrores, formatDate, formatINR } from '@/lib/utils';

interface IPODetailPageProps {
  ipoId: number;
  onBack: () => void;
}

export const IPODetailPage: React.FC<IPODetailPageProps> = ({ ipoId, onBack }) => {
  const [ipo, setIpo] = useState<IPODetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.getIPODetail(ipoId);
        setIpo(data);
      } catch (err) {
        console.error('Failed to load IPO details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [ipoId]);

  if (loading) {
    return <div className="text-center py-20 text-slate-400 text-sm">Loading prospectus data...</div>;
  }

  if (!ipo) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-slate-400">IPO details could not be found.</p>
        <Button onClick={onBack} size="sm">
          Return to IPO Hub
        </Button>
      </div>
    );
  }

  const latestSub = ipo.subscriptions.length > 0 ? ipo.subscriptions[ipo.subscriptions.length - 1] : null;

  return (
    <div className="space-y-6 pb-16">
      {/* Back Button & Title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs">
          <ArrowLeft className="h-4 w-4" />
          Back to IPOs
        </Button>
      </div>

      {/* Main Header Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    ipo.status === 'OPEN'
                      ? 'open'
                      : ipo.status === 'LISTED'
                      ? 'listed'
                      : ipo.status === 'UPCOMING'
                      ? 'upcoming'
                      : 'secondary'
                  }
                  className="font-mono text-xs font-bold"
                >
                  {ipo.status}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  {ipo.series}
                </Badge>
                <span className="text-xs text-slate-400">{ipo.listing_exchanges}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {ipo.company_name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                <span>NSE: {ipo.symbol}</span>
                <span>•</span>
                <span>Sector: {ipo.sector || 'Diversified'}</span>
                {ipo.drhp_url && (
                  <>
                    <span>•</span>
                    <a
                      href={ipo.drhp_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 font-sans font-medium"
                    >
                      <FileText className="h-3 w-3" />
                      SEBI DRHP Filing
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Real-time GMP Box */}
            <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-border flex items-center justify-between lg:justify-end gap-6">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-sans block">Grey Market Premium</span>
                <GMPBadge gmp={ipo.current_gmp} expectedGainPct={ipo.expected_gain_pct} />
              </div>

              {ipo.listing_price && (
                <div className="border-l border-border pl-6">
                  <span className="text-[10px] text-slate-400 uppercase font-sans block">Listing Debut Price</span>
                  <div className="text-base font-bold font-mono text-emerald-500">
                    {formatINR(ipo.listing_price)}
                    <span className="text-xs font-normal ml-1">
                      ({ipo.listing_gain_pct && ipo.listing_gain_pct > 0 ? '+' : ''}
                      {ipo.listing_gain_pct}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Issue Parameters & Intermediaries */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Issue Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-slate-400">Price Band</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatINR(ipo.price_band_low)} - {formatINR(ipo.price_band_high)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-slate-400">Lot Size</span>
                <span className="font-mono font-semibold text-foreground">{ipo.lot_size} Shares</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-slate-400">Min. Retail Investment</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatINR(ipo.lot_size * ipo.price_band_high)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-slate-400">Total Issue Size</span>
                <span className="font-mono font-semibold text-foreground">{formatCrores(ipo.issue_size_cr)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-slate-400">Fresh Issue</span>
                <span className="font-mono font-semibold text-foreground">{formatCrores(ipo.fresh_issue_cr)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-slate-400">Offer for Sale (OFS)</span>
                <span className="font-mono font-semibold text-foreground">{formatCrores(ipo.ofs_cr)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Face Value</span>
                <span className="font-mono font-semibold text-foreground">{formatINR(ipo.face_value)} per share</span>
              </div>
            </CardContent>
          </Card>

          {/* Timetable */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-500" />
                Key Dates & Timetable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-slate-400 font-sans">Issue Opens</span>
                <span className="font-semibold text-foreground">{formatDate(ipo.open_date)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-slate-400 font-sans">Issue Closes</span>
                <span className="font-semibold text-foreground">{formatDate(ipo.close_date)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-slate-400 font-sans">Basis of Allotment</span>
                <span className="font-semibold text-foreground">{formatDate(ipo.allotment_date)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Listing Date</span>
                <span className="font-semibold text-foreground">{formatDate(ipo.listing_date)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Registrar & Lead Managers */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Intermediaries & SEBI Registrar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Registrar</span>
                <span className="font-semibold text-foreground">{ipo.registrar || 'TBA'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Lead Managers / Book Running</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {ipo.lead_managers || 'TBA'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Subscriptions, Financials, RAG */}
        <div className="lg:col-span-8 space-y-6">
          {/* Subscription Progress Section */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-purple-500" />
                  Bidding & Subscription Status
                </CardTitle>
                <span className="text-xs font-mono text-slate-400">
                  Day {latestSub?.day_number || 1} Final Book
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {latestSub ? (
                <SubscriptionProgress
                  total={latestSub.total_subscription}
                  qib={latestSub.qib_subscription}
                  nii={latestSub.nii_subscription}
                  retail={latestSub.retail_subscription}
                />
              ) : (
                <p className="text-xs text-slate-400">Subscription bidding has not opened yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Fundamentals & Financial Statements */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Fundamental Financials & Valuations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border">
                  <div className="text-[10px] text-slate-400 uppercase">P/E Ratio</div>
                  <div className="text-sm font-bold font-mono text-foreground">
                    {ipo.pe_ratio !== null && ipo.pe_ratio !== undefined ? `${ipo.pe_ratio.toFixed(1)}x` : 'N/A'}
                  </div>
                  <div className="text-[10px] text-slate-400">Ind: {ipo.industry_pe || 35.0}x</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border">
                  <div className="text-[10px] text-slate-400 uppercase">Revenue (FY24)</div>
                  <div className="text-sm font-bold font-mono text-foreground">
                    {formatCrores(ipo.revenue_cr)}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border">
                  <div className="text-[10px] text-slate-400 uppercase">PAT Profit</div>
                  <div
                    className={`text-sm font-bold font-mono ${
                      ipo.pat_cr && ipo.pat_cr < 0 ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {formatCrores(ipo.pat_cr)}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border">
                  <div className="text-[10px] text-slate-400 uppercase">RoE / RoCE</div>
                  <div className="text-sm font-bold font-mono text-foreground">
                    {ipo.roe ? `${ipo.roe}%` : 'N/A'} / {ipo.roce ? `${ipo.roce}%` : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrated DRHP RAG Q&A Assistant */}
          <ProspectusChat selectedIpoId={ipo.id} />
        </div>
      </div>
    </div>
  );
};

