import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

const fmt = (value) =>
  (value == null ? 0 : Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

const ACCENTS = {
  emerald: {
    bar: 'bg-emerald-500',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    ring: 'ring-emerald-100',
  },
  blue: {
    bar: 'bg-blue-500',
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    ring: 'ring-blue-100',
  },
  amber: {
    bar: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    ring: 'ring-amber-100',
  },
  sky: {
    bar: 'bg-sky-500',
    iconBg: 'bg-sky-50',
    iconText: 'text-sky-600',
    ring: 'ring-sky-100',
  },
};

function StatCard({ title, value, subtitle, icon: Icon, accent }) {
  const a = ACCENTS[accent];

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className={`absolute top-0 left-0 right-0 h-1 ${a.bar}`} />

      <div className="p-6 pt-7">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.iconBg} ring-1 ${a.ring}`}>
            <Icon size={18} strokeWidth={2.25} className={a.iconText} />
          </div>
        </div>

        <p className="mt-4 text-[28px] leading-none font-semibold text-slate-900 tabular-nums tracking-tight break-words">
          {value}
        </p>

        {subtitle && (
          <p className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DashboardStats({ cashMovement, cashFlowForecast, maturities, fundsUnderManagement }) {
  const cashFlowIn = cashFlowForecast?.totals?.cashFlowIn ?? 0;
  const cashFlowOut = cashFlowForecast?.totals?.cashFlowOut ?? 0;
  const cashMovementTotal = cashMovement?.total ?? 0;

  const totalMaturities =
    (maturities?.assets?.totals?.maturityValue ?? 0) +
    (maturities?.liabilities?.totals?.maturityValue ?? 0);

  const fumTotal = fundsUnderManagement?.sums
    ? [
        fundsUnderManagement.sums.equityTotal,
        fundsUnderManagement.sums.moneyMarketPrescribedTotal,
        fundsUnderManagement.sums.moneyMarketUnPrescribedTotal,
        fundsUnderManagement.sums.bondPrescribedTotal,
        fundsUnderManagement.sums.bondUnprescribedTotal,
        fundsUnderManagement.sums.propertyTotal,
        fundsUnderManagement.sums.cashTotal,
      ].reduce((sum, n) => sum + (n || 0), 0)
    : 0;

  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Cash Movement"
        value={`$${fmt(cashMovementTotal)}`}
        subtitle="Deposits, withdrawals and liquidity flow"
        icon={TrendingUp}
        accent="emerald"
      />
      <StatCard
        title="Forecast Cash In"
        value={`$${fmt(cashFlowIn)}`}
        subtitle="Projected inflows to the portfolio"
        icon={DollarSign}
        accent="blue"
      />
      <StatCard
        title="Forecast Cash Out"
        value={`$${fmt(cashFlowOut)}`}
        subtitle="Projected outflows for the period"
        icon={TrendingDown}
        accent="amber"
      />
      <StatCard
        title="Total FUM"
        value={`$${fmt(fumTotal)}`}
        subtitle="Total funds under management"
        icon={PieChart}
        accent="sky"
      />
    </div>
  );
}