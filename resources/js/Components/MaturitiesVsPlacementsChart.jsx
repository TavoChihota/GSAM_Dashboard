import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { LineChart as LineChartIcon, Calendar, Inbox, Download, ExpandIcon } from 'lucide-react';
import Highcharts from 'highcharts';
import * as HighchartsReactModule from 'highcharts-react-official';
import CardIconButton from '@/Components/CardIconButton';
import CardExpandModal from '@/Components/CardExpandModal';
import { downloadCardAsPdf } from '@/lib/exportCardPdf';

function resolveComponent(mod) {
  let m = mod;
  while (m && typeof m !== 'function' && m.default) {
    m = m.default;
  }
  return m;
}

const HighchartsReact = resolveComponent(HighchartsReactModule);

// Solid = Assets, dashed = Liabilities (matches what the backend actually
// splits maturities/placements by — the original app's Buy/Sell framing
// doesn't apply to this data).
const SERIES_COLORS = {
  maturitiesAssets: '#10B981', // emerald
  maturitiesLiabilities: '#EF4444', // red
  placementsAssets: '#3B82F6', // blue
  placementsLiabilities: '#F59E0B', // amber
};

function buildOptions(rows, height) {
  const categories = rows.map((r) => (r.month || '').slice(0, 3));

  const series = [
    {
      name: 'Maturities (Assets)',
      data: rows.map((r) => r.maturitiesAssets ?? null),
      color: SERIES_COLORS.maturitiesAssets,
      dashStyle: 'Solid',
      lineWidth: 3,
      marker: { radius: 4 },
    },
    {
      name: 'Maturities (Liabilities)',
      data: rows.map((r) => r.maturitiesLiabilities ?? null),
      color: SERIES_COLORS.maturitiesLiabilities,
      dashStyle: 'ShortDash',
      lineWidth: 2,
      marker: { radius: 4 },
    },
    {
      name: 'Placements (Assets)',
      data: rows.map((r) => r.placementsAssets ?? null),
      color: SERIES_COLORS.placementsAssets,
      dashStyle: 'Solid',
      lineWidth: 3,
      marker: { radius: 4 },
    },
    {
      name: 'Placements (Liabilities)',
      data: rows.map((r) => r.placementsLiabilities ?? null),
      color: SERIES_COLORS.placementsLiabilities,
      dashStyle: 'ShortDash',
      lineWidth: 2,
      marker: { radius: 4 },
    },
  ];

  return {
    chart: { type: 'line', backgroundColor: 'transparent', height },
    title: { text: null },
    xAxis: {
      categories,
      labels: { style: { fontSize: '12px', fontWeight: '600', color: '#475569' } },
      lineColor: '#E2E8F0',
    },
    yAxis: {
      title: { text: null },
      gridLineColor: '#F1F5F9',
      labels: {
        formatter() {
          return Highcharts.numberFormat(this.value, 0, '.', ',');
        },
        style: { color: '#64748B' },
      },
    },
    tooltip: {
      shared: true,
      valueDecimals: 2,
      valueThousandsSep: ',',
    },
    legend: {
      itemStyle: { fontSize: '12px', fontWeight: '500', color: '#475569' },
    },
    plotOptions: {
      series: { marker: { enabled: true } },
    },
    credits: { enabled: false },
    series,
  };
}

export default function MaturitiesVsPlacementsChart({ maturitiesVsPlacements = [], filters = {}, onDateChange }) {
  const [expanded, setExpanded] = useState(false);

  const handleDateChange = (e) => {
    if (onDateChange) {
      onDateChange('maturities_vs_placements_date', e.target.value);
    } else {
      router.get(
        '/dashboard',
        { ...filters, maturities_vs_placements_date: e.target.value },
        { preserveState: true, preserveScroll: true }
      );
    }
  };

  const hasData = maturitiesVsPlacements.length > 0;
  const options = useMemo(() => buildOptions(maturitiesVsPlacements, 330), [maturitiesVsPlacements]);
  const expandedOptions = useMemo(() => buildOptions(maturitiesVsPlacements, 440), [maturitiesVsPlacements]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 min-w-0" data-card>
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <LineChartIcon size={16} strokeWidth={2.2} />
          </div>
          <h3 className="font-semibold text-slate-900">Maturities vs Placements</h3>
        </div>
        <div className="flex items-start gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
              Period Ending
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={filters.maturities_vs_placements_date || ''}
                onChange={handleDateChange}
                className="border border-slate-300 rounded-lg text-sm pl-8 pr-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-[18px]">
            <button
              type="button"
              onClick={(e) => downloadCardAsPdf(e, 'Maturities vs Placements')}
              title="Export Maturities vs Placements as PDF"
              className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
            >
              <Download size={13} />
              Export
            </button>
            <CardIconButton onClick={() => setExpanded(true)} title="Expand Maturities vs Placements">
              <ExpandIcon size={16} />
            </CardIconButton>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-3 pl-[42px]">6-month trend of maturities and placements, split by assets and liabilities.</p>

      <div className="w-full flex justify-center items-center h-[330px]">
        {hasData ? (
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            containerProps={{ style: { width: '100%', height: '100%' } }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Inbox size={28} strokeWidth={1.5} />
            <span className="text-sm">No data available for the selected period.</span>
          </div>
        )}
      </div>

      <CardExpandModal open={expanded} onClose={() => setExpanded(false)} title="Maturities vs Placements">
        <div className="h-[440px]">
          {hasData ? (
            <HighchartsReact
              highcharts={Highcharts}
              options={expandedOptions}
              containerProps={{ style: { width: '100%', height: '100%' } }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400 h-full">
              <Inbox size={28} strokeWidth={1.5} />
              <span className="text-sm">No data available for the selected period.</span>
            </div>
          )}
        </div>
      </CardExpandModal>
    </div>
  );
}