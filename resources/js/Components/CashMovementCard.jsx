import { useMemo } from 'react';
import { ArrowDownUp, Inbox, Download } from 'lucide-react';
import Highcharts from 'highcharts';
import * as HighchartsReactModule from 'highcharts-react-official';
import CardIconButton from '@/Components/CardIconButton';
import { downloadCardAsPdf } from '@/lib/exportCardPdf';

function resolveComponent(mod) {
  let m = mod;
  while (m && typeof m !== 'function' && m.default) {
    m = m.default;
  }
  return m;
}

const HighchartsReact = resolveComponent(HighchartsReactModule);

const COLORS = {
  'Total Deposits': '#2563EB',
  'Total Withdrawals': '#F97316',
  'Asset Maturities': '#94A3B8',
  'Liability Maturities': '#EAB308',
  'Asset Placements': '#38BDF8',
  'Liability Placements': '#22C55E',
};

const fmt = (n) => (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CashMovementCard({ cashMovement = { items: [], total: 0 } }) {
  const { items, total } = cashMovement;

  const chartData = useMemo(
    () => items.map((i) => ({ name: i.name, y: i.value, color: COLORS[i.name] })),
    [items]
  );

  const hasData = total > 0;

  const options = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 300, spacing: [10, 10, 10, 10] },
    title: { text: undefined },
    tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        size: '62%',
        center: ['32%', '50%'],
        dataLabels: { enabled: false },
        showInLegend: true,
      },
    },
    legend: {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
      itemStyle: { fontWeight: '600', fontSize: '12px', color: '#334155' },
      itemHoverStyle: { color: '#0F172A' },
      itemMarginBottom: 9,
      symbolRadius: 3,
      symbolWidth: 12,
      symbolHeight: 12,
    },
    credits: { enabled: false },
    series: [{ type: 'pie', name: 'Cash Movement', data: chartData }],
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 min-w-0" data-card>
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
            <ArrowDownUp size={16} strokeWidth={2.2} />
          </div>
          <h3 className="font-semibold text-slate-900">Cash Movement</h3>
        </div>
        <button
          type="button"
          onClick={(e) => downloadCardAsPdf(e, 'Cash Movement')}
          title="Export Cash Movement as PDF"
          className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shrink-0"
        >
          <Download size={13} />
          Export
        </button>
      </div>
      <p className="text-xs text-slate-400 mb-3 pl-[42px]">
        Deposits, withdrawals, maturities, and placements for the selected month.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="h-[300px] flex items-center justify-center">
          {hasData ? (
            <HighchartsReact
              highcharts={Highcharts}
              options={options}
              containerProps={{ style: { width: '100%', height: '100%' } }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Inbox size={28} strokeWidth={1.5} />
              <span className="text-sm">No cash movement data for this period.</span>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#0F172A]">
                <th className="text-left text-white text-xs font-medium px-3 py-2">Category</th>
                <th className="text-right text-white text-xs font-medium px-3 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.name} className="border-b border-slate-100 hover:bg-slate-50/60">
                  <td className="px-3 py-2 text-slate-700">{i.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-800">{fmt(i.value)}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-slate-50">
                <td className="px-3 py-2">TOTAL</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}