import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeftRight, Calendar, Inbox, Download, ExpandIcon } from 'lucide-react';
import Highcharts from 'highcharts';
import * as HighchartsReactModule from 'highcharts-react-official';
import * as Highcharts3DModule from 'highcharts/highcharts-3d';
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
const Highcharts3D = resolveComponent(Highcharts3DModule);

if (typeof Highcharts === 'object' && typeof Highcharts3D === 'function') {
  Highcharts3D(Highcharts);
}

const COLORS = ['#1E3A8A', '#22C55E', '#F97316', '#EAB308'];

const fmt = (n) => (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildOptions(categories, chartData, height) {
  return {
    chart: {
      type: 'column',
      options3d: { enabled: true, alpha: 15, beta: 15, depth: 50, viewDistance: 25 },
      backgroundColor: 'transparent',
      height,
    },
    title: { text: null },
    xAxis: {
      categories,
      labels: { skew3d: true, style: { fontSize: '12.5px', fontWeight: '600', color: '#475569' } },
      lineColor: '#E2E8F0',
    },
    yAxis: {
      allowDecimals: true,
      min: 0,
      title: { text: 'Total Cost', skew3d: true, style: { fontWeight: '600', color: '#64748B' } },
      gridLineColor: '#F1F5F9',
    },
    tooltip: {
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:,.2f}</b><br/>',
    },
    plotOptions: {
      column: {
        depth: 25,
        dataLabels: { enabled: true, format: '{point.y:,.2f}', style: { textOutline: 'none', fontSize: '11.5px', color: '#334155' } },
      },
    },
    credits: { enabled: false },
    series: [{ name: 'Total Cost', data: chartData, showInLegend: false }],
  };
}

export default function ShareMovementCard({ shareMovement = [], filters = {} }) {
  const [expanded, setExpanded] = useState(false);

  const handleDateChange = (e) => {
    router.get('/dashboard', { ...filters, value_date: e.target.value }, { preserveState: true, preserveScroll: true });
  };

  const { categories, chartData, hasData } = useMemo(() => {
    const cats = shareMovement.map((item) => item.dealTypeName || 'Unknown');
    let total = 0;
    const data = shareMovement.map((item, i) => {
      let numericVal = 0;
      if (typeof item.totalCost === 'string') {
        numericVal = parseFloat(item.totalCost.replace(/,/g, '')) || 0;
      } else if (typeof item.totalCost === 'number') {
        numericVal = item.totalCost;
      }
      total += numericVal;
      return { name: item.dealTypeName || 'Unknown', y: numericVal, color: COLORS[i % COLORS.length] };
    });
    return { categories: cats, chartData: data, hasData: total > 0 };
  }, [shareMovement]);

  const options = useMemo(() => buildOptions(categories, chartData, 330), [categories, chartData]);
  const expandedOptions = useMemo(() => buildOptions(categories, chartData, 440), [categories, chartData]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 min-w-0" data-card>
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
            <ArrowLeftRight size={16} strokeWidth={2.2} />
          </div>
          <h3 className="font-semibold text-slate-900">Share Movement</h3>
        </div>
        <div className="flex items-start gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Date</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={filters.value_date || ''}
                onChange={handleDateChange}
                className="border border-slate-300 rounded-lg text-sm pl-8 pr-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-[18px]">
            <button
              type="button"
              onClick={(e) => downloadCardAsPdf(e, 'Share Movement')}
              title="Export Share Movement as PDF"
              className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
            >
              <Download size={13} />
              Export
            </button>
            <CardIconButton onClick={() => setExpanded(true)} title="Expand Share Movement">
              <ExpandIcon size={16} />
            </CardIconButton>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-3 pl-[42px]">Deal type totals and chart breakdown for share movement.</p>

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
            <span className="text-sm">No share movement data available for the selected date.</span>
          </div>
        )}
      </div>

      <CardExpandModal open={expanded} onClose={() => setExpanded(false)} title="Share Movement">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Chart</h3>
            <div className="bg-slate-50 p-4 rounded-lg h-[440px]">
              {hasData ? (
                <HighchartsReact
                  highcharts={Highcharts}
                  options={expandedOptions}
                  containerProps={{ style: { width: '100%', height: '100%' } }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 h-full">
                  <Inbox size={28} strokeWidth={1.5} />
                  <span className="text-sm">No share movement data available for the selected date.</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Data</h3>
            <div className="bg-slate-50 p-4 rounded-lg overflow-y-auto max-h-[440px]">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200">
                    <th className="border border-slate-300 p-2 text-left font-semibold">Deal Type</th>
                    <th className="border border-slate-300 p-2 text-right font-semibold">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {shareMovement.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-100">
                      <td className="border border-slate-300 p-2">{row.dealTypeName || 'Unknown'}</td>
                      <td className="border border-slate-300 p-2 text-right">{fmt(row.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardExpandModal>
    </div>
  );
}