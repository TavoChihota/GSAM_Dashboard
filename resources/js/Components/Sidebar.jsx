import { Link, usePage } from '@inertiajs/react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Reports', href: '/reports' },
  { label: 'Analytics', href: '/analytics' },
];

export default function Sidebar() {
  const { url } = usePage();

  return (
    <aside className="w-56 bg-black text-white flex flex-col shrink-0">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
          G
        </div>
        <div>
          <div className="font-semibold text-sm leading-tight">GSAM Portal</div>
          <div className="text-xs text-gray-400 leading-tight">Executive dashboard</div>
        </div>
      </div>

      <nav className="mt-2 flex flex-col">
        {navItems.map((item) => {
          const active = url.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-5 py-2.5 text-sm ${
                active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
