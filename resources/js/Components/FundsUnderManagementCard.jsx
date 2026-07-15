import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import Highcharts from 'highcharts';
import * as HighchartsReactModule from 'highcharts-react-official';

function resolveComponent(mod) {
  let m = mod;
  while (m && typeof m !== 'function' && m.default) {
    m = m.default;
  }
  return m;
}

const HighchartsReact = resolveComponent(HighchartsReactModule);
const COLORS = {
  EQUITIES: '#4472C4',
  'MM Prescribed': '#ED7D31',
  'MM UnPrescribed': '#FF9F40',
  'Bond Prescribed': '#A5A5A5',
  'Bond UnPrescribed': '#D3D3D3',
  PROPERTY: '#FFC000',
  'UNIT TRUSTS': '#5B9BD5',
};

const fmt = (n) => (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildSummaryRows(sums) {
  if (!sums) return [];
  const base = [
    { label: 'EQUITIES', value: sums.equityTotal ?? 0 },
    { label: 'MM Prescribed', value: sums.moneyMarketPrescribedTotal ?? 0 },
    { label: 'MM UnPrescribed', value: sums.moneyMarketUnPrescribedTotal ?? 0 },
    { label: 'Bond Prescribed', value: sums.bondPrescribedTotal ?? 0 },
    { label: 'Bond UnPrescribed', value: sums.bondUnprescribedTotal ?? 0 },
    { label: 'PROPERTY', value: sums.propertyTotal ?? 0 },
    { label: 'UNIT TRUSTS', value: sums.cashTotal ?? 0 },
  ];
  const total = base.reduce((acc, r) => acc + r.value, 0);
  base.push({ label: 'TOTAL VALUATION', value: total, isTotal: true });
  return base;
}

export default function FundsUnderManagementCard({ fundsUnderManagement = { rows: [], sums: null }, filters = {} }) {
  const { rows, sums } = fundsUnderManagement;

  const handleChange = (key) => (e) => {
    router.get('/dashboard', { ...filters, [key]: e.target.value }, { preserveState: true, preserveScroll: true });
  };

  const summaryRows = useMemo(() => buildSummaryRows(sums), [sums]);

  const donutData = useMemo(() => {
    if (!sums) return [];
    return [
      { name: 'EQUITIES', y: sums.equityTotal ?? 0 },
      { name: 'MM Prescribed', y: sums.moneyMarketPrescribedTotal ?? 0 },
      { name: 'MM UnPrescribed', y: sums.moneyMarketUnPrescribedTotal ?? 0 },
      { name: 'Bond Prescribed', y: sums.bondPrescribedTotal ?? 0 },
      { name: 'Bond UnPrescribed', y: sums.bondUnprescribedTotal ?? 0 },
      { name: 'PROPERTY', y: sums.propertyTotal ?? 0 },
      { name: 'UNIT TRUSTS', y: sums.cashTotal ?? 0 },
    ].map((s) => ({ ...s, color: COLORS[s.name] }));
  }, [sums]);

  const donutOptions = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 280, spacing: [4, 4, 4, 4] },
    title: { text: undefined },
    tooltip: {
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:,.2f}</b> ({point.percentage:.1f}%)<br/>',
    },
    plotOptions: {
      pie: {
        innerSize: '55%',
        borderWidth: 2,
        borderColor: '#ffffff',
        startAngle: 0,
        dataLabels: {
          enabled: true,
          formatter() {
            if (!this.y || (this.percentage ?? 0) < 1) return null;
            const pct = Math.round(this.percentage ?? 0);
            return `<div style="background:#2d2d2d;color:#ffffff;padding:2px 6px;border-radius:2px;font-weight:700;font-size:11px;line-height:1.4;text-align:center;">${pct}%</div>`;
          },
          useHTML: true,
          distance: -30,
          style: { textOutline: 'none' },
        },
        showInLegend: true,
      },
    },
    legend: {
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical',
      itemStyle: { fontWeight: '600', fontSize: '11px', color: '#333333' },
      itemHoverStyle: { color: '#000000' },
      itemMarginBottom: 8,
      symbolRadius: 0,
      symbolWidth: 12,
      symbolHeight: 12,
    },
    credits: { enabled: false },
    series: [{ type: 'pie', name: 'Valuation', data: donutData }],
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5" data-card>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Funds Under Management</h3>
          <p className="text-xs text-gray-500 mt-0.5">Valuation chart, summary, and detailed rows.</p>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase block mb-1">Value Date</label>
            <input
              type="date"
              value={filters.value_date || ''}
              onChange={handleChange('value_date')}
              className="border border-gray-300 rounded-md text-sm px-2 py-1.5"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut */}
        <div id="fum-valuation">
          {sums ? (
            <HighchartsReact highcharts={Highcharts} options={donutOptions} />
          ) : (
            <div className="text-center text-sm text-gray-500 py-16">No funds under management data available for this date.</div>
          )}
        </div>

        {/* Summary table */}
        <div id="fum-summary" className="overflow-hidden rounded-md border border-[#bdd7ee]">
          <p className="text-[#1f6fbf] text-xs italic font-semibold px-2 pt-1 pb-0.5 bg-white">FUM – Summary</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: '#4472C4' }}>
                <th className="text-left text-white text-xs font-medium px-2 py-1.5">Category</th>
                <th className="text-right text-white text-xs font-medium px-2 py-1.5">Value</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((r) => (
                <tr key={r.label} className={r.isTotal ? 'font-semibold bg-slate-50' : 'border-b border-gray-100'}>
                  <td className="px-2 py-1.5">{r.label}</td>
                  <td className="px-2 py-1.5 text-right">{fmt(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail grid */}
      <div className="mt-6" id="fum-detail">
        <div className="card-divider2 text-xs font-semibold text-gray-500 uppercase mb-2">Funds Under Management Detailed</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="py-2 pr-4 font-medium">Counterparty</th>
                <th className="py-2 pr-4 font-medium text-right">MM Prescribed</th>
                <th className="py-2 pr-4 font-medium text-right">MM UnPrescribed</th>
                <th className="py-2 pr-4 font-medium text-right">Equity</th>
                <th className="py-2 pr-4 font-medium text-right">Property</th>
                <th className="py-2 pr-4 font-medium text-right">Bond Prescribed</th>
                <th className="py-2 pr-4 font-medium text-right">Bond UnPrescribed</th>
                <th className="py-2 pr-4 font-medium text-right">Cash</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-sm text-gray-500 py-10">No detail rows for this date.</td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-4 font-medium text-gray-800">{r.counterpartyName}</td>
                    <td className="py-2 pr-4 text-right">{fmt(r.moneyMarketPrescribedValue)}</td>
                    <td className="py-2 pr-4 text-right">{fmt(r.moneyMarketUnPrescribedValue)}</td>
                    <td className="py-2 pr-4 text-right">{fmt(r.equityValue)}</td>
                    <td className="py-2 pr-4 text-right">{fmt(r.propertyValue)}</td>
                    <td className="py-2 pr-4 text-right">{fmt(r.bondValuePrescribed)}</td>
                    <td className="py-2 pr-4 text-right">{fmt(r.bondValueUnprescribed)}</td>
                    <td className="py-2 pr-4 text-right">{fmt(r.cashValue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
