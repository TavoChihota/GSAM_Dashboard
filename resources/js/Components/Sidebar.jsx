import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, FileBarChart, LineChart, Settings, ChevronRight } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
  { label: 'Analytics', href: '/analytics', icon: LineChart },
];

export default function Sidebar() {
  const { url } = usePage();

  return (
    <aside className="w-60 bg-[#0B1220] text-slate-300 flex flex-col shrink-0 min-h-screen">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-blue-900/40">
          G
        </div>
        <div>
          <div className="font-semibold text-sm leading-tight text-white tracking-tight">GSAM Portal</div>
          <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Executive Dashboard</div>
        </div>
      </div>

      <nav className="mt-4 flex flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          const active = url.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative ${
                active
                  ? 'bg-white/[0.07] text-white font-medium'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-blue-500" />
              )}
              <Icon size={17} strokeWidth={2} className={active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-slate-600" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-5 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Connected to MIPF
        </div>
      </div>
    </aside>
  );
}