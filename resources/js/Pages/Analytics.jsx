import { Head, router } from '@inertiajs/react';
import { Calendar, Activity, User } from 'lucide-react';
import Sidebar from '@/Components/Sidebar';
import DashboardStats from '@/Components/DashboardStats';
import CashMovementCard from '@/Components/CashMovementCard';
import TopGainsLossesCard from '@/Components/TopGainsLossesCard';
import CashFlowForecastCard from '@/Components/CashFlowForecastCard';
import MaturitiesCard from '@/Components/MaturitiesCard';
import FundsUnderManagementCard from '@/Components/FundsUnderManagementCard';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function Analytics({
  filters = {
    value_date: todayIso(),
    currency_id: 9,
    fum_date: todayIso(),
    share_movement_date: todayIso(),
    cash_movement_date: todayIso(),
    cash_flow_forecast_date: todayIso(),
    maturity_assets_date: todayIso(),
    maturity_liabilities_date: todayIso(),
  },
  currencyOptions = [],
  fundsUnderManagement = { rows: [], sums: null },
  cashMovement = { items: [], total: 0 },
  topGainsLosses = { gains: [], losses: [] },
  cashFlowForecast = { rows: [], totals: {} },
  maturities = { assets: { rows: [], totals: {} }, liabilities: { rows: [], totals: {} } },
}) {
  const updateFilter = (key, value) => {
    router.get('/analytics', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
  };

  const handleTopFilterChange = (key) => (e) => updateFilter(key, e.target.value);

  return (
    <div className="min-h-screen bg-slate-50">
      <Head title="Analytics Dashboard" />
      <Sidebar />

      <div className="ml-60 flex flex-col min-w-0 min-h-screen">
        <header className="flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200 gap-3 flex-wrap">
          <div className="text-sm text-slate-500 font-medium">Analytics insights and portfolio trends</div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-3 py-1">
              <Activity size={12} strokeWidth={2.5} />
              Analytics Mode
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <User size={15} />
            </div>
          </div>
        </header>

        <main className="p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">GSAM Analytics Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Explore analytics-focused KPIs, cash flows, maturities, and FUM trends.
              </p>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
                Value Date
              </label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={filters.value_date}
                  onChange={handleTopFilterChange('value_date')}
                  className="border border-slate-300 rounded-lg text-sm pl-9 pr-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          <DashboardStats
            cashMovement={cashMovement}
            cashFlowForecast={cashFlowForecast}
            maturities={maturities}
            fundsUnderManagement={fundsUnderManagement}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <TopGainsLossesCard topGainsLosses={topGainsLosses} />
            <CashMovementCard cashMovement={cashMovement} filters={filters} onDateChange={updateFilter} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <CashFlowForecastCard cashFlowForecast={cashFlowForecast} filters={filters} onDateChange={updateFilter} />
            <MaturitiesCard maturities={maturities} filters={filters} onDateChange={updateFilter} />
          </div>

          <FundsUnderManagementCard
            fundsUnderManagement={fundsUnderManagement}
            filters={filters}
            currencyOptions={currencyOptions}
            onDateChange={updateFilter}
          />
        </main>
      </div>
    </div>
  );
}
