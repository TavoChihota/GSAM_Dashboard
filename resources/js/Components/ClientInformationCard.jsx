import { useMemo, useState } from 'react';
import { Users, Inbox, Download, ExpandIcon } from 'lucide-react';
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

const COLORS = [
  '#2563EB', '#F97316', '#94A3B8', '#EAB308', '#38BDF8',
  '#22C55E', '#1E3A8A', '#B45309', '#64748B', '#A16207',
];

function buildOptions(chartData, height) {
  return {
    chart: {
      type: 'pie',
      options3d: { enabled: true, alpha: 45, beta: 0 },
      backgroundColor: 'transparent',
      margin: [10, 10, 10, 10],
      spacing: [10, 10, 10, 10],
      height,
    },
    title: null,
    tooltip: { pointFormat: '{series.name}: <b>{point.y}</b>' },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 35,
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
    series: [{ type: 'pie', name: 'Record Count', data: chartData }],
  };
}

export default function ClientInformationCard({ clientDetails = [] }) {
  const [expanded, setExpanded] = useState(false);

  const chartData = useMemo(() => {
    const validData = clientDetails.filter(
      (item) => item.counterpartyCategory && item.counterpartyCategory.trim() !== ''
    );

    let totalSum = 0;
    const pieces = validData.map((item) => {
      totalSum += item.recordCount || 0;
      return { name: item.counterpartyCategory, y: item.recordCount || 0 };
    });

    return [{ name: 'Total no of clients', y: totalSum }, ...pieces].map((item, i) => ({
      ...item,
      color: COLORS[i % COLORS.length],
    }));
  }, [clientDetails]);

  const hasData = chartData.some((d) => d.y > 0);
  const options = useMemo(() => buildOptions(chartData, 300), [chartData]);
  const expandedOptions = useMemo(() => buildOptions(chartData, 420), [chartData]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 min-w-0" data-card>
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Users size={16} strokeWidth={2.2} />
          </div>
          <h3 className="font-semibold text-slate-900">Client Information</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => downloadCardAsPdf(e, 'Client Information')}
            title="Export Client Information as PDF"
            className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
          >
            <Download size={13} />
            Export
          </button>
          <CardIconButton onClick={() => setExpanded(true)} title="Expand Client Information">
            <ExpandIcon size={16} />
          </CardIconButton>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-3 pl-[42px]">
        Client segmentation and record status from the analytics service.
      </p>

      <div className="w-full flex flex-col items-center justify-center relative z-10 h-[300px]">
        {hasData ? (
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            containerProps={{ style: { width: '100%', height: '100%' } }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Inbox size={28} strokeWidth={1.5} />
            <span className="text-sm">No client information available.</span>
          </div>
        )}
      </div>

      <CardExpandModal open={expanded} onClose={() => setExpanded(false)} title="Client Information">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Chart</h3>
            <div className="bg-slate-50 p-4 rounded-lg h-[420px]">
              {hasData ? (
                <HighchartsReact
                  highcharts={Highcharts}
                  options={expandedOptions}
                  containerProps={{ style: { width: '100%', height: '100%' } }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 h-full">
                  <Inbox size={28} strokeWidth={1.5} />
                  <span className="text-sm">No client information available.</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Data</h3>
            <div className="bg-slate-50 p-4 rounded-lg overflow-y-auto max-h-[420px]">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200">
                    <th className="border border-slate-300 p-2 text-left font-semibold">Category</th>
                    <th className="border border-slate-300 p-2 text-right font-semibold">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-100">
                      <td className="border border-slate-300 p-2">{row.name}</td>
                      <td className="border border-slate-300 p-2 text-right">{row.y}</td>
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