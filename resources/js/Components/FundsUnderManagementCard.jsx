import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import { Wallet, Calendar, Inbox } from 'lucide-react';
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
  EQUITIES: '#2563EB',
  'MM Prescribed': '#F97316',
  'MM UnPrescribed': '#FDBA74',
  'Bond Prescribed': '#94A3B8',
  'Bond UnPrescribed': '#CBD5E1',
  PROPERTY: '#EAB308',
  'UNIT TRUSTS': '#38BDF8',
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

  const hasSums = sums && donutData.some((d) => d.y > 0);

  const donutOptions = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 280, spacing: [4, 4, 4, 4] },
    title: { text: undefined },
    tooltip: {
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:,.2f}</b> ({point.percentage:.1f}%)<br/>',
    },
    plotOptions: {
      pie: {
        innerSize: '58%',
        borderWidth: 2,
        borderColor: '#ffffff',
        startAngle: 0,
        dataLabels: {
          enabled: true,
          formatter() {
            if (!this.y || (this.percentage ?? 0) < 1) return null;
            const pct = Math.round(this.percentage ?? 0);
            return `<div style="background:#0F172A;color:#ffffff;padding:2px 6px;border-radius:4px;font-weight:700;font-size:11px;line-height:1.4;text-align:center;">${pct}%</div>`;
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
      itemStyle: { fontWeight: '600', fontSize: '11.5px', color: '#334155' },
      itemHoverStyle: { color: '#0F172A' },
      itemMarginBottom: 9,
      symbolRadius: 3,
      symbolWidth: 12,
      symbolHeight: 12,
    },
    credits: { enabled: false },
    series: [{ type: 'pie', name: 'Valuation', data: donutData }],
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" data-card>
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Wallet size={16} strokeWidth={2.2} />
          </div>
          <h3 className="font-semibold text-slate-900">Funds Under Management</h3>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Value Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={filters.value_date || ''}
              onChange={handleChange('value_date')}
              className="border border-slate-300 rounded-lg text-sm pl-8 pr-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-5 pl-[42px]">Valuation chart, summary, and detailed rows.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="fum-valuation">
          {hasSums ? (
            <HighchartsReact highcharts={Highcharts} options={donutOptions} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400 h-[280px]">
              <Inbox size={28} strokeWidth={1.5} />
              <span className="text-sm text-center">No funds under management data available for this date.</span>
            </div>
          )}
        </div>

        <div id="fum-summary" className="overflow-hidden rounded-xl border border-slate-200">
          <p className="text-blue-700 text-[11px] font-semibold uppercase tracking-wide px-3 pt-2.5 pb-1.5 bg-slate-50 border-b border-slate-200">
            FUM &ndash; Summary
          </p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#0F172A]">
                <th className="text-left text-white text-xs font-medium px-3 py-2">Category</th>
                <th className="text-right text-white text-xs font-medium px-3 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((r) => (
                <tr key={r.label} className={r.isTotal ? 'font-semibold bg-slate-50' : 'border-b border-slate-100 hover:bg-slate-50/60'}>
                  <td className="px-3 py-2 text-slate-700">{r.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-800">{fmt(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6" id="fum-detail">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Funds Under Management &ndash; Detail</div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-200">
                <th className="py-2.5 px-3 font-medium">Counterparty</th>
                <th className="py-2.5 px-3 font-medium text-right">MM Prescribed</th>
                <th className="py-2.5 px-3 font-medium text-right">MM UnPrescribed</th>
                <th className="py-2.5 px-3 font-medium text-right">Equity</th>
                <th className="py-2.5 px-3 font-medium text-right">Property</th>
                <th className="py-2.5 px-3 font-medium text-right">Bond Prescribed</th>
                <th className="py-2.5 px-3 font-medium text-right">Bond UnPrescribed</th>
                <th className="py-2.5 px-3 font-medium text-right">Cash</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-sm text-slate-400 py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox size={24} strokeWidth={1.5} />
                      No detail rows for this date.
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{r.counterpartyName}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{fmt(r.moneyMarketPrescribedValue)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{fmt(r.moneyMarketUnPrescribedValue)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{fmt(r.equityValue)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{fmt(r.propertyValue)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{fmt(r.bondValuePrescribed)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{fmt(r.bondValueUnprescribed)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{fmt(r.cashValue)}</td>
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