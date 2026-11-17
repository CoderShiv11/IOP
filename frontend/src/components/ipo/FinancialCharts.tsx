import React, { useMemo } from 'react';
import { FinancialDataPoint } from '@/types';
import { formatCrores, cn } from '@/lib/utils';

interface FinancialChartsProps {
  revenueHistory: FinancialDataPoint[];
  patHistory: FinancialDataPoint[];
  ebitdaHistory: FinancialDataPoint[];
  operatingCashflow: number | undefined;
  investingCashflow: number | undefined;
  financingCashflow: number | undefined;
}

const CHART_W = 400;
const CHART_H = 220;
const PADDING = { top: 30, right: 20, bottom: 40, left: 55 };
const INNER_W = CHART_W - PADDING.left - PADDING.right;
const INNER_H = CHART_H - PADDING.top - PADDING.bottom;

function niceMax(values: number[]): number {
  const max = Math.max(...values, 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / magnitude) * magnitude;
}

function yScale(value: number, maxVal: number, minVal = 0): number {
  const range = maxVal - minVal || 1;
  return INNER_H - ((value - minVal) / range) * INNER_H;
}

/** ---- Chart 1: Revenue & PAT Bar Chart ---- */
function RevenuePatChart({
  revenueHistory,
  patHistory,
}: {
  revenueHistory: FinancialDataPoint[];
  patHistory: FinancialDataPoint[];
}) {
  const years = revenueHistory.map((d) => d.year);
  const allValues = [
    ...revenueHistory.map((d) => d.value),
    ...patHistory.map((d) => Math.abs(d.value)),
    0,
  ];
  const maxVal = niceMax(allValues);
  const minVal = Math.min(0, ...patHistory.map((d) => d.value));
  const totalRange = maxVal - minVal;

  const groupW = INNER_W / (years.length || 1);
  const barW = groupW * 0.35;
  const gap = groupW * 0.05;

  const yTicks = 5;
  const tickStep = totalRange / yTicks;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Revenue &amp; Profit Trend (₹ Crore)
      </h3>
      <svg
        width="100%"
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Revenue and PAT bar chart"
        role="img"
      >
        <g transform={`translate(${PADDING.left},${PADDING.top})`}>
          {/* Y grid lines & labels */}
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const val = minVal + tickStep * i;
            const y = yScale(val, maxVal, minVal);
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={INNER_W} y2={y} stroke="currentColor" strokeOpacity={0.1} />
                <text x={-6} y={y + 4} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.5}>
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}K` : Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Zero line */}
          {minVal < 0 && (
            <line
              x1={0} y1={yScale(0, maxVal, minVal)}
              x2={INNER_W} y2={yScale(0, maxVal, minVal)}
              stroke="currentColor" strokeOpacity={0.3} strokeDasharray="3,3"
            />
          )}

          {/* Bars */}
          {years.map((year, i) => {
            const rev = revenueHistory.find((d) => d.year === year);
            const pat = patHistory.find((d) => d.year === year);
            const groupX = i * groupW + groupW * 0.1;
            const revVal = rev?.value ?? 0;
            const patVal = pat?.value ?? 0;

            const revY = yScale(Math.max(revVal, 0), maxVal, minVal);
            const revH = Math.abs(yScale(0, maxVal, minVal) - revY);
            const patY = patVal >= 0 ? yScale(patVal, maxVal, minVal) : yScale(0, maxVal, minVal);
            const patH = Math.abs(yScale(0, maxVal, minVal) - yScale(patVal, maxVal, minVal));

            return (
              <g key={year}>
                {/* Revenue bar */}
                <rect
                  x={groupX}
                  y={revY}
                  width={barW}
                  height={Math.max(revH, 1)}
                  fill="#3b82f6"
                  rx={2}
                  opacity={0.85}
                />
                <text
                  x={groupX + barW / 2}
                  y={revY - 4}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#3b82f6"
                >
                  {revVal >= 1000 ? `${(revVal / 1000).toFixed(1)}K` : Math.round(revVal)}
                </text>

                {/* PAT bar */}
                <rect
                  x={groupX + barW + gap}
                  y={patY}
                  width={barW}
                  height={Math.max(patH, 1)}
                  fill={patVal >= 0 ? '#10b981' : '#f43f5e'}
                  rx={2}
                  opacity={0.85}
                />
                <text
                  x={groupX + barW + gap + barW / 2}
                  y={patVal >= 0 ? patY - 4 : patY + patH + 10}
                  textAnchor="middle"
                  fontSize={8}
                  fill={patVal >= 0 ? '#10b981' : '#f43f5e'}
                >
                  {Math.round(patVal)}
                </text>

                {/* X-axis label */}
                <text
                  x={groupX + barW + gap / 2}
                  y={INNER_H + 14}
                  textAnchor="middle"
                  fontSize={10}
                  fill="currentColor"
                  opacity={0.6}
                >
                  {year}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={0} y1={0} x2={0} y2={INNER_H} stroke="currentColor" strokeOpacity={0.2} />
          <line x1={0} y1={INNER_H} x2={INNER_W} y2={INNER_H} stroke="currentColor" strokeOpacity={0.2} />
        </g>
      </svg>
      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground justify-center">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-500" />Revenue</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-500" />PAT (+)</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-rose-500" />PAT (−)</span>
      </div>
    </div>
  );
}

/** ---- Chart 2: EBITDA Line Chart ---- */
function EbitdaLineChart({
  ebitdaHistory,
  revenueHistory,
}: {
  ebitdaHistory: FinancialDataPoint[];
  revenueHistory: FinancialDataPoint[];
}) {
  const data = ebitdaHistory.length > 0 ? ebitdaHistory : revenueHistory;
  const label = ebitdaHistory.length > 0 ? 'EBITDA' : 'Revenue';
  const color = ebitdaHistory.length > 0 ? '#8b5cf6' : '#3b82f6';

  const values = data.map((d) => d.value);
  const maxVal = niceMax([...values, 1]);
  const minVal = Math.min(0, ...values);
  const totalRange = maxVal - minVal || 1;

  const stepX = INNER_W / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => ({
    x: i * stepX,
    y: yScale(d.value, maxVal, minVal),
    value: d.value,
    year: d.year,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `M${points[0].x},${INNER_H} ` +
        points.map((p) => `L${p.x},${p.y}`).join(' ') +
        ` L${points[points.length - 1].x},${INNER_H} Z`
      : '';

  const yTicks = 5;
  const tickStep = totalRange / yTicks;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        {label} Trend (₹ Crore)
      </h3>
      <svg
        width="100%"
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label={`${label} trend line chart`}
        role="img"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <g transform={`translate(${PADDING.left},${PADDING.top})`}>
          {/* Y grid & labels */}
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const val = minVal + tickStep * i;
            const y = yScale(val, maxVal, minVal);
            return (
              <g key={i}>
                <line x1={0} y1={y} x2={INNER_W} y2={y} stroke="currentColor" strokeOpacity={0.1} />
                <text x={-6} y={y + 4} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.5}>
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}K` : Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

          {/* Line */}
          {points.length > 1 && (
            <polyline points={polyline} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          )}

          {/* Dots and labels */}
          {points.map((p) => (
            <g key={p.year}>
              <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth={1.5} />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize={9} fill={color}>
                {p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}K` : Math.round(p.value)}
              </text>
              <text x={p.x} y={INNER_H + 14} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.6}>
                {p.year}
              </text>
            </g>
          ))}

          {/* Axes */}
          <line x1={0} y1={0} x2={0} y2={INNER_H} stroke="currentColor" strokeOpacity={0.2} />
          <line x1={0} y1={INNER_H} x2={INNER_W} y2={INNER_H} stroke="currentColor" strokeOpacity={0.2} />
        </g>
      </svg>
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground justify-center">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ background: color }} />
          {label} (₹ Cr)
        </span>
      </div>
    </div>
  );
}

/** ---- Chart 3: Cash Flow Waterfall ---- */
function CashFlowChart({
  operatingCashflow,
  investingCashflow,
  financingCashflow,
}: {
  operatingCashflow: number | undefined;
  investingCashflow: number | undefined;
  financingCashflow: number | undefined;
}) {
  const items = useMemo(() => [
    { label: 'Operating', value: operatingCashflow ?? 0, color: (operatingCashflow ?? 0) >= 0 ? '#10b981' : '#f43f5e' },
    { label: 'Investing', value: investingCashflow ?? 0, color: (investingCashflow ?? 0) >= 0 ? '#10b981' : '#f43f5e' },
    { label: 'Financing', value: financingCashflow ?? 0, color: '#3b82f6' },
  ], [operatingCashflow, investingCashflow, financingCashflow]);

  const absMax = Math.max(...items.map((d) => Math.abs(d.value)), 1);

  const CFW = 480;
  const CFH = 160;
  const cfPad = { top: 20, right: 20, bottom: 20, left: 90 };
  const innerW = CFW - cfPad.left - cfPad.right;
  const barH = 30;
  const barGap = 20;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mt-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Cash Flow Statement (₹ Crore)
      </h3>
      <svg
        width="100%"
        viewBox={`0 0 ${CFW} ${CFH}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Cash flow waterfall chart"
        role="img"
      >
        <g transform={`translate(${cfPad.left},${cfPad.top})`}>
          {/* Zero line */}
          <line x1={innerW / 2} y1={0} x2={innerW / 2} y2={(barH + barGap) * items.length} stroke="currentColor" strokeOpacity={0.2} />

          {items.map((item, i) => {
            const scale = (Math.abs(item.value) / absMax) * (innerW / 2);
            const y = i * (barH + barGap);
            const isNeg = item.value < 0;
            const x = isNeg ? innerW / 2 - scale : innerW / 2;

            return (
              <g key={item.label}>
                <text x={-6} y={y + barH / 2 + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.7}>
                  {item.label}
                </text>
                <rect x={x} y={y} width={Math.max(scale, 2)} height={barH} fill={item.color} rx={3} opacity={0.85} />
                <text
                  x={isNeg ? x - 4 : x + scale + 4}
                  y={y + barH / 2 + 4}
                  textAnchor={isNeg ? 'end' : 'start'}
                  fontSize={10}
                  fill={item.color}
                  fontWeight="600"
                >
                  {item.value >= 0 ? '+' : ''}{Math.round(item.value)} Cr
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export function FinancialCharts({
  revenueHistory,
  patHistory,
  ebitdaHistory,
  operatingCashflow,
  investingCashflow,
  financingCashflow,
}: FinancialChartsProps) {
  const hasFinancials = revenueHistory.length > 0 || patHistory.length > 0;
  const hasCashFlow =
    operatingCashflow !== undefined ||
    investingCashflow !== undefined ||
    financingCashflow !== undefined;

  if (!hasFinancials && !hasCashFlow) {
    return (
      <div className="rounded-xl bg-card border border-border p-6 text-center text-muted-foreground text-sm">
        No financial chart data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasFinancials && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenuePatChart revenueHistory={revenueHistory} patHistory={patHistory} />
          <EbitdaLineChart ebitdaHistory={ebitdaHistory} revenueHistory={revenueHistory} />
        </div>
      )}
      {hasCashFlow && (
        <CashFlowChart
          operatingCashflow={operatingCashflow}
          investingCashflow={investingCashflow}
          financingCashflow={financingCashflow}
        />
      )}
    </div>
  );
}
