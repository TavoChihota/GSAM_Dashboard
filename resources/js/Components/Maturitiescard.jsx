import { useMemo, useState } from 'react';
import { CalendarCheck2, Search, Inbox, CheckCircle2, Circle } from 'lucide-react';

const fmt = (n) => (n == null || n === '' ? '' : Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('en-GB');
};

export default function MaturitiesCard({ maturities = { assets: { rows: [], totals: {} }, liabilities: { rows: [], totals: {} } } }) {
  const [tab, setTab] = useState('assets');
  const [search, setSearch] = useState('');

  const { rows, totals } = maturities[tab] || { rows: [], totals: {} };

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      [r.counterpartyName, r.dealNo, r.accountNo, r.instrumentTypeName]
        .some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [rows, search]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" data-card>
      <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <CalendarCheck2 size={16} strokeWidth={2.2} />
          </div>
          <h3 className="font-semibold text-slate-900">Maturities</h3>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search counterparty, deal no..."
            className="border border-slate-300 rounded-lg text-sm pl-8 pr-3 py-1.5 text-slate-700 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4 pl-[42px]">Deals maturing from the start of the month to the value date.</p>

      <div className="flex gap-1 mb-4 border-b border-slate-200 pl-[42px]">
        {['assets', 'liabilities'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-200">
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 font-medium">Deal No</th>
              <th className="py-2.5 px-3 font-medium">Counterparty</th>
              <th className="py-2.5 px-3 font-medium">Instrument</th>
              <th className="py-2.5 px-3 font-medium">Currency</th>
              <th className="py-2.5 px-3 font-medium text-right">Nominal</th>
              <th className="py-2.5 px-3 font-medium text-right">Rate (%)</th>
              <th className="py-2.5 px-3 font-medium text-right">Interest</th>
              <th className="py-2.5 px-3 font-medium text-right">Maturity Value</th>
              <th className="py-2.5 px-3 font-medium text-right">Days to Run</th>
              <th className="py-2.5 px-3 font-medium">Maturity Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-sm text-slate-400 py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox size={24} strokeWidth={1.5} />
                    No {tab} maturities for this period.
                  </div>
                </td>
              </tr>
            ) : (
              filteredRows.map((r, i) => (
                <tr key={r.dealID ?? i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="py-2 px-3">
                    {r.confirmed ? (
                      <CheckCircle2 size={15} className="text-emerald-500" />
                    ) : (
                      <Circle size={15} className="text-slate-300" />
                    )}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-800">{r.dealNo}</td>
                  <td className="py-2 px-3 text-slate-600">{r.counterpartyName}</td>
                  <td className="py-2 px-3 text-slate-600">{r.instrumentTypeName}</td>
                  <td className="py-2 px-3 text-slate-500">{r.currCode}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-700">{fmt(r.nominal)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-600">{fmt(r.rate)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-600">{fmt(r.interest)}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-medium text-slate-800">{fmt(r.maturityValue)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-600">{r.daysToRun ?? ''}</td>
                  <td className="py-2 px-3 text-slate-600">{fmtDate(r.maturityDate)}</td>
                </tr>
              ))
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 font-semibold border-t border-slate-200">
                <td className="py-2.5 px-3" colSpan={2}>Total: {totals.count}</td>
                <td className="py-2.5 px-3" colSpan={3}></td>
                <td className="py-2.5 px-3 text-right tabular-nums">{fmt(totals.nominal)}</td>
                <td className="py-2.5 px-3"></td>
                <td className="py-2.5 px-3 text-right tabular-nums">{fmt(totals.interest)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{fmt(totals.maturityValue)}</td>
                <td className="py-2.5 px-3" colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}