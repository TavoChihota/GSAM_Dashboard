import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { CalendarClock, Calendar, Search, Inbox, Download, ExpandIcon } from 'lucide-react';
import CardIconButton from '@/Components/CardIconButton';
import CardExpandModal from '@/Components/CardExpandModal';
import DataTable from '@/Components/DataTable/DataTable';
import { downloadCardAsPdf } from '@/lib/exportCardPdf';

const fmt = (n) => (n == null || n === '' ? '' : Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
};

const FORECAST_COLUMNS = [
  {
    key: 'counterparty',
    label: 'Counterparty',
    hideable: false,
    render: (r) => <span className="font-medium text-slate-800">{r.counterparty}</span>,
    footer: (t) => `Total: ${t.count}`,
  },
  { key: 'instrumentType', label: 'Instrument', render: (r) => r.instrumentType },
  { key: 'investmentIndustry', label: 'Industry', render: (r) => r.investmentIndustry },
  { key: 'price', label: 'Price', align: 'right', render: (r) => fmt(r.price), footer: (t) => fmt(t.price) },
  { key: 'interest', label: 'Interest', align: 'right', render: (r) => fmt(r.interest), footer: (t) => fmt(t.interest) },
  {
    key: 'cashFlowIn',
    label: 'Cash Flow In',
    align: 'right',
    render: (r) => <span className="text-emerald-600">{fmt(r.cashFlowIn)}</span>,
    footer: (t) => <span className="text-emerald-700">{fmt(t.cashFlowIn)}</span>,
  },
  {
    key: 'cashFlowOut',
    label: 'Cash Flow Out',
    align: 'right',
    render: (r) => <span className="text-red-500">{fmt(r.cashFlowOut)}</span>,
    footer: (t) => <span className="text-red-600">{fmt(t.cashFlowOut)}</span>,
  },
  { key: 'daysBeforeMaturity', label: 'Days to Maturity', align: 'right', render: (r) => r.daysBeforeMaturity ?? '' },
  { key: 'cashFlowDate', label: 'Cash Flow Date', render: (r) => fmtDate(r.cashFlowDate) },
];

function ForecastTable({ rows, totals }) {
  return (
    <DataTable
      storageKey="cashflow-forecast-table"
      columns={FORECAST_COLUMNS}
      rows={rows}
      totals={totals}
      emptyMessage="No cash flow forecast data for this period."
      emptyIcon={Inbox}
    />
  );
}

export default function CashFlowForecastCard({ cashFlowForecast = { rows: [], totals: {} }, filters = {}, onDateChange }) {
  const { rows, totals } = cashFlowForecast;
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleDateChange = (e) => {
    if (onDateChange) {
      onDateChange('cash_flow_forecast_date', e.target.value);
    } else {
      router.get('/dashboard', { ...filters, cash_flow_forecast_date: e.target.value }, { preserveState: true, preserveScroll: true });
    }
  };

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
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Value Date</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={filters.cash_flow_forecast_date || ''}
                onChange={handleDateChange}
                className="border border-slate-300 rounded-lg text-sm pl-8 pr-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
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
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => downloadCardAsPdf(e, 'Cash Flow Forecast')}
              title="Export Cash Flow Forecast as PDF"
              className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
            >
              <Download size={13} />
              Export
            </button>
            <CardIconButton onClick={() => setExpanded(true)} title="Expand Cash Flow Forecast">
              <ExpandIcon size={16} />
            </CardIconButton>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4 pl-[42px]">
        Per-instrument cash flow projections from the start of the month to the value date.
      </p>

      <ForecastTable rows={filteredRows} totals={totals} />

      <CardExpandModal open={expanded} onClose={() => setExpanded(false)} title="Cash Flow Forecast">
        <ForecastTable rows={filteredRows} totals={totals} />
      </CardExpandModal>
    </div>
  );
}