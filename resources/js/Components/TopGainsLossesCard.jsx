import { useState } from 'react';
import { TrendingUp, TrendingDown, Inbox, Download, ExpandIcon } from 'lucide-react';
import CardIconButton from '@/Components/CardIconButton';
import CardExpandModal from '@/Components/CardExpandModal';
import { downloadCardAsPdf } from '@/lib/exportCardPdf';

const fmt = (n) => (n == null ? '' : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const fmtPct = (n) => (n == null ? '' : n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }));

function GainsLossesTable({ title, rows, tone }) {
  const isGainTone = tone === 'gain';
  const Icon = isGainTone ? TrendingUp : TrendingDown;
  const iconWrap = isGainTone ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600';

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${iconWrap}`}>
          <Icon size={13} strokeWidth={2.5} />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-200">
              <th className="py-2 px-3 font-medium">Counter</th>
              <th className="py-2 px-3 font-medium text-right">Prev.</th>
              <th className="py-2 px-3 font-medium text-right">Current</th>
              <th className="py-2 px-3 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-slate-400 py-8">
                  <div className="flex flex-col items-center gap-1.5">
                    <Inbox size={20} strokeWidth={1.5} />
                    <span className="text-xs">No {title.toLowerCase()} data found.</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((item, idx) => {
                const isGain = (item.percentageDifference ?? 0) >= 0;
                const colorClass = isGain ? 'text-emerald-600' : 'text-red-500';
                return (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-medium text-slate-800">{item.name || item.id}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-500">{fmt(item.previousPrice)}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-700">{fmt(item.price)}</td>
                    <td className={`py-2 px-3 text-right font-semibold ${colorClass}`}>
                      <div className="flex items-center justify-end gap-1">
                        {isGain ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span className="tabular-nums">{fmtPct(item.percentageDifference)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TopGainsLossesCard({ topGainsLosses = { gains: [], losses: [] } }) {
  const { gains, losses } = topGainsLosses;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" data-card>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
            <TrendingUp size={16} strokeWidth={2.2} />
          </div>
          <h3 className="font-semibold text-slate-900">Top 5 Gains &amp; Losses</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => downloadCardAsPdf(e, 'Top 5 Gains and Losses')}
            title="Export Top 5 Gains and Losses as PDF"
            className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
          >
            <Download size={13} />
            Export
          </button>
          <CardIconButton onClick={() => setExpanded(true)} title="Expand Top 5 Gains and Losses">
            <ExpandIcon size={16} />
          </CardIconButton>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4 pl-[42px]">
        Biggest equity movers by percentage change on the exchange.
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        <GainsLossesTable title="Top Gains" rows={gains} tone="gain" />
        <GainsLossesTable title="Top Losses" rows={losses} tone="loss" />
      </div>

      <CardExpandModal open={expanded} onClose={() => setExpanded(false)} title="Top 5 Gains & Losses">
        <div className="flex flex-col lg:flex-row gap-6">
          <GainsLossesTable title="Top Gains" rows={gains} tone="gain" />
          <GainsLossesTable title="Top Losses" rows={losses} tone="loss" />
        </div>
      </CardExpandModal>
    </div>
  );
}