import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeftRight, Calendar, Inbox } from 'lucide-react';
import Highcharts from 'highcharts';
import * as HighchartsReactModule from 'highcharts-react-official';
import * as Highcharts3DModule from 'highcharts/highcharts-3d';

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

export default function ShareMovementCard({ shareMovement = [], filters = {} }) {
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

  const options = {
    chart: {
      type: 'column',
      options3d: { enabled: true, alpha: 15, beta: 15, depth: 50, viewDistance: 25 },
      backgroundColor: 'transparent',
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

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 min-w-0" data-card>
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
            <ArrowLeftRight size={16} strokeWidth={2.2} />
          </div>
          <h3 className="font-semibold text-slate-900">Share Movement</h3>
        </div>
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
    </div>
  );
}