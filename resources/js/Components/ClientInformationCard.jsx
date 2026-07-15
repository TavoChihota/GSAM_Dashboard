import { useMemo } from 'react';
import Highcharts from 'highcharts';
import * as HighchartsReactModule from 'highcharts-react-official';
import * as HighchartsReactModule from 'highcharts-react-official';

function resolveComponent(mod) {
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

const COLORS = [
  '#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5',
  '#70AD47', '#264478', '#9E480E', '#636363', '#997300',
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

  const options = {
    chart: {
      type: 'pie',
      options3d: { enabled: true, alpha: 45, beta: 0 },
      backgroundColor: 'transparent',
      margin: [10, 0, 10, 0],
      spacing: [0, 0, 0, 0],
    },
    title: null,
    tooltip: { pointFormat: '{series.name}: <b>{point.y}</b>' },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 35,
        size: '100%',
        dataLabels: {
          enabled: true,
          useHTML: true,
          connectorWidth: 0,
          formatter() {
            return `<span style="color: ${this.point.color}; font-weight: bold; font-size: 13px;">${this.point.name}</span>`;
          },
          distance: 15,
          style: { textOutline: 'none' },
        },
      },
    },
    credits: { enabled: false },
    series: [{ type: 'pie', name: 'Record Count', data: chartData }],
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex-1" data-card>
      <div className="mb-2">
        <h3 className="font-semibold text-gray-900">Client Information</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Client segmentation and record status from the analytics service.
        </p>
      </div>
      <div className="w-full flex flex-col items-center justify-center relative z-10 h-[400px]">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          containerProps={{ style: { width: '100%', height: '100%' } }}
        />
      </div>
    </div>
  );
}
