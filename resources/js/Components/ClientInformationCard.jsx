import { useMemo } from 'react';
import { Users, Inbox } from 'lucide-react';
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

const COLORS = [
  '#2563EB', '#F97316', '#94A3B8', '#EAB308', '#38BDF8',
  '#22C55E', '#1E3A8A', '#B45309', '#64748B', '#A16207',
];

export default function ClientInformationCard({ clientDetails = [] }) {
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

  const options = {
    chart: {
      type: 'pie',
      options3d: { enabled: true, alpha: 45, beta: 0 },
      backgroundColor: 'transparent',
      margin: [10, 10, 10, 10],
      spacing: [10, 10, 10, 10],
      height: 300,
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

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1 min-w-0" data-card>
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Users size={16} strokeWidth={2.2} />
        </div>
        <h3 className="font-semibold text-slate-900">Client Information</h3>
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
    </div>
  );
}