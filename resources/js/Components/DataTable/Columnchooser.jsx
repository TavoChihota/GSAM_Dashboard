import { useEffect, useRef, useState } from 'react';
import { Transition } from '@headlessui/react';
import { Columns3 } from 'lucide-react';

/**
 * "Columns" button + dropdown checkbox list for showing/hiding table columns.
 * Mirrors the look of the app's existing Dropdown.jsx (slate palette, ring shadow).
 *
 * @param {Array<{ key: string, label: string, hideable?: boolean }>} columns
 * @param {Record<string, boolean>} visibility
 * @param {(key: string) => void} onToggle
 * @param {() => void} onShowAll
 * @param {() => void} onReset
 */
export default function ColumnChooser({ columns, visibility, onToggle, onShowAll, onReset }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleCount = columns.filter((c) => visibility[c.key] !== false).length;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title="Choose columns"
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
      >
        <Columns3 size={14} strokeWidth={1.75} />
        Columns
        <span className="text-slate-400">
          {visibleCount}/{columns.length}
        </span>
      </button>

      <Transition
        show={open}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 bg-white">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Show columns
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onShowAll}
                className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700"
              >
                All
              </button>
              <button
                type="button"
                onClick={onReset}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-600"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {columns.map((col) => {
              const checked = visibility[col.key] !== false;
              const locked = col.hideable === false;
              return (
                <label
                  key={col.key}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm ${
                    locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={locked}
                    onChange={() => !locked && onToggle(col.key)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700">{col.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </Transition>
    </div>
  );
}