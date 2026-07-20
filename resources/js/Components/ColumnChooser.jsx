import { useEffect, useRef, useState } from 'react';
import { Check, Columns3 } from 'lucide-react';

export default function ColumnChooser({ options = [], visibleColumns = {}, onToggle, label = 'Columns' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-medium border border-slate-300 rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
      >
        <Columns3 size={13} />
        {label}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Visible columns
          </div>
          <div className="mt-1 space-y-1">
            {options.map((option) => {
              const isVisible = visibleColumns[option.key] !== false;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onToggle?.(option.key)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                      isVisible ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    {isVisible ? <Check size={12} strokeWidth={3} /> : null}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
