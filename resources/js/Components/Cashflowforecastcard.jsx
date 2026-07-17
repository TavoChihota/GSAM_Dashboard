import { useMemo, useState } from 'react';
import { CalendarClock, Search, Inbox } from 'lucide-react';

const fmt = (n) => (n == null || n === '' ? '' : Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
};

export default function CashFlowForecastCard({ cashFlowForecast = { rows: [], totals: {} } }) {
  const { rows, totals } = cashFlowForecast;
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      [r.counterparty, r.instrumentType, r.investmentIndustry, r.investmentType]
        .some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [rows, search]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" data-card>
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <CalendarClock size={16} strokeWidth={2.2} />
          </div>
          <h3 className="font-semibold text-slate-900">Cash Flow Forecast</h3>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search counterparty, instrument..."
            className="border border-slate-300 rounded-lg text-sm pl-8 pr-3 py-1.5 text-slate-700 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4 pl-[42px]">
        Per-instrument cash flow projections from the start of the month to the value date.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-200">
              <th className="py-2.5 px-3 font-medium">Counterparty</th>
              <th className="py-2.5 px-3 font-medium">Instrument</th>
              <th className="py-2.5 px-3 font-medium">Industry</th>
              <th className="py-2.5 px-3 font-medium text-right">Price</th>
              <th className="py-2.5 px-3 font-medium text-right">Interest</th>
              <th className="py-2.5 px-3 font-medium text-right">Cash Flow In</th>
              <th className="py-2.5 px-3 font-medium text-right">Cash Flow Out</th>
              <th className="py-2.5 px-3 font-medium text-right">Days to Maturity</th>
              <th className="py-2.5 px-3 font-medium">Cash Flow Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-sm text-slate-400 py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox size={24} strokeWidth={1.5} />
                    No cash flow forecast data for this period.
                  </div>
                </td>
              </tr>
            ) : (
              filteredRows.map((r, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="py-2 px-3 font-medium text-slate-800">{r.counterparty}</td>
                  <td className="py-2 px-3 text-slate-600">{r.instrumentType}</td>
                  <td className="py-2 px-3 text-slate-600">{r.investmentIndustry}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-600">{fmt(r.price)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-600">{fmt(r.interest)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-emerald-600">{fmt(r.cashFlowIn)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-red-500">{fmt(r.cashFlowOut)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-600">{r.daysBeforeMaturity ?? ''}</td>
                  <td className="py-2 px-3 text-slate-600">{fmtDate(r.cashFlowDate)}</td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 font-semibold border-t border-slate-200">
                <td className="py-2.5 px-3">Total: {totals.count}</td>
                <td className="py-2.5 px-3" colSpan={2}></td>
                <td className="py-2.5 px-3 text-right tabular-nums">{fmt(totals.price)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{fmt(totals.interest)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700">{fmt(totals.cashFlowIn)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums text-red-600">{fmt(totals.cashFlowOut)}</td>
                <td className="py-2.5 px-3" colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}