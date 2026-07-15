import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import Highcharts from 'highcharts';
import * as HighchartsReactModule from 'highcharts-react-official';
import * as HighchartsReactModule from 'highcharts-react-official';

function resolveCompaaonent(mod) {
  let m = mod;
  while (m && typeof m !== 'function' && m.default) {
    m = m.default;
  }
  return m;
}

const HighchartsReact = resolveComponent(HighchartsReactModule);
if (typeof Highcharts === 'object') {
  if (typeof Highcharts3D === 'function') {
    Highcharts3D(Highcharts);
  } else if (Highcharts3D && typeof Highcharts3D.default === 'function') {
    Highcharts3D.default(Highcharts);
  }
}

const COLORS = ['#264478', '#70AD47', '#ED7D31', '#FFC000'];

export default function ShareMovementCard({ shareMovement = [], filters = {} }) {
  const handleDateChange = (e) => {
    router.get('/dashboard', { ...filters, value_date: e.target.value }, { preserveState: true, preserveScroll: true });
  };

  const { categories, chartData } = useMemo(() => {
    const cats = shareMovement.map((item) => item.dealTypeName || 'Unknown');
    const data = shareMovement.map((item, i) => {
      let numericVal = 0;
      if (typeof item.totalCost === 'string') {
        numericVal = parseFloat(item.totalCost.replace(/,/g, '')) || 0;
      } else if (typeof item.totalCost === 'number') {
        numericVal = item.totalCost;
      }
      return { name: item.dealTypeName || 'Unknown', y: numericVal, color: COLORS[i % COLORS.length] };
    });
    return { categories: cats, chartData: data };
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
      labels: { skew3d: true, style: { fontSize: '13px', fontWeight: 'bold', color: '#333' } },
    },
    yAxis: {
      allowDecimals: true,
      min: 0,
      title: { text: 'Total Cost', skew3d: true, style: { fontWeight: 'bold' } },
    },
    tooltip: {
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:,.2f}</b><br/>',
    },
    plotOptions: {
      column: {
        depth: 25,
        dataLabels: { enabled: true, format: '{point.y:,.2f}', style: { textOutline: 'none', fontSize: '12px' } },
      },
    },
    credits: { enabled: false },
    series: [{ name: 'Total Cost', data: chartData, showInLegend: false }],
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex-1" data-card>
      <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Share Movement</h3>
          <p className="text-xs text-gray-500 mt-0.5">Deal type totals and chart breakdown for share movement.</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase block mb-1">Date</label>
          <input
            type="date"
            value={filters.value_date || ''}
            onChange={handleDateChange}
            className="border border-gray-300 rounded-md text-sm px-2 py-1.5"
          />
        </div>
      </div>
      <div className="w-full flex justify-center items-center h-[350px]">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          containerProps={{ style: { width: '100%', height: '100%' } }}
        />
      </div>
    </div>
  );
}
