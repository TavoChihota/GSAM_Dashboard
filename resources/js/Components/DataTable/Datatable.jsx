import { Inbox } from 'lucide-react';
import ColumnChooser from './ColumnChooser';
import useColumnVisibility from './useColumnVisibility';

/**
 * Generic reusable table with a built-in column chooser.
 *
 * Column shape:
 *   {
 *     key: 'counterparty',        // unique id, also used as the data field unless `render` is given
 *     label: 'Counterparty',      // header text + column-chooser label
 *     align: 'left' | 'right',    // defaults to 'left'
 *     defaultVisible: true,       // whether shown by default (default: true)
 *     hideable: true,             // false = always shown, can't be hidden (default: true)
 *     render: (row) => node,      // optional custom cell renderer, defaults to row[key]
 *     footer: (totals) => node,   // optional footer/summary cell renderer
 *     headerClassName / cellClassName: extra classes
 *   }
 *
 * @param {Array} columns
 * @param {Array} rows
 * @param {Object} [totals]            passed to each column's `footer` renderer
 * @param {string} storageKey          unique id used to persist column visibility (required)
 * @param {(row, index) => string|number} [getRowKey]
 * @param {string} [emptyMessage]
 * @param {React.ComponentType} [emptyIcon]
 * @param {React.ReactNode} [toolbarExtra]  extra controls rendered left of the Columns button
 */
export default function DataTable({
  columns,
  rows = [],
  totals,
  storageKey,
  getRowKey = (row, i) => row.id ?? i,
  emptyMessage = 'No data available.',
  emptyIcon: EmptyIcon = Inbox,
  toolbarExtra = null,
  className = '',
}) {
  if (!storageKey) {
    // Column visibility can't persist without a key - fail loudly in dev rather than
    // silently colliding with another table's saved state.
    console.warn('DataTable: a unique `storageKey` prop is required for the column chooser to work correctly.');
  }

  const { visibility, toggleColumn, showAll, resetToDefault, visibleColumns } = useColumnVisibility(
    columns,
    storageKey || 'default'
  );

  const hasFooter = totals && columns.some((c) => typeof c.footer === 'function');

  return (
    <div className={className}>
      <div className="flex items-center justify-end gap-2 mb-2">
        {toolbarExtra}
        <ColumnChooser
          columns={columns}
          visibility={visibility}
          onToggle={toggleColumn}
          onShowAll={showAll}
          onReset={resetToDefault}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-200">
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2.5 px-3 font-medium ${col.align === 'right' ? 'text-right' : ''} ${
                    col.headerClassName || ''
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length || 1} className="text-center text-sm text-slate-400 py-12">
                  <div className="flex flex-col items-center gap-2">
                    <EmptyIcon size={24} strokeWidth={1.5} />
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={getRowKey(row, i)}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                >
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-2 px-3 text-slate-600 ${col.align === 'right' ? 'text-right tabular-nums' : ''} ${
                        col.cellClassName || ''
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {hasFooter && rows.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 font-semibold border-t border-slate-200">
                {visibleColumns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2.5 px-3 ${col.align === 'right' ? 'text-right tabular-nums' : ''}`}
                  >
                    {col.footer ? col.footer(totals) : null}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}