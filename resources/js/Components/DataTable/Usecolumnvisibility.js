import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Manages show/hide state for a set of table columns and persists the
 * choice to localStorage so it survives page reloads / future visits.
 *
 * @param {Array<{ key: string, defaultVisible?: boolean, hideable?: boolean }>} columns
 * @param {string} storageKey  Unique id for this table, e.g. "cashflow-forecast-table"
 */
export default function useColumnVisibility(columns, storageKey) {
  const defaultVisibility = useMemo(() => {
    const map = {};
    columns.forEach((col) => {
      // hideable: false columns are always shown and can't be toggled off
      map[col.key] = col.hideable === false ? true : col.defaultVisible !== false;
    });
    return map;
  }, [columns]);

  const [visibility, setVisibility] = useState(() => {
    if (typeof window === 'undefined') return defaultVisibility;
    try {
      const saved = window.localStorage.getItem(`datatable:${storageKey}`);
      if (!saved) return defaultVisibility;
      const parsed = JSON.parse(saved);
      // Merge saved state with defaults so newly-added columns show up
      return { ...defaultVisibility, ...parsed };
    } catch (e) {
      return defaultVisibility;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`datatable:${storageKey}`, JSON.stringify(visibility));
    } catch (e) {
      // localStorage unavailable (private mode, quota, etc) - fail silently
    }
  }, [visibility, storageKey]);

  const toggleColumn = useCallback((key) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const showAll = useCallback(() => {
    setVisibility((prev) => {
      const next = { ...prev };
      columns.forEach((col) => {
        next[col.key] = true;
      });
      return next;
    });
  }, [columns]);

  const resetToDefault = useCallback(() => {
    setVisibility(defaultVisibility);
  }, [defaultVisibility]);

  const visibleColumns = useMemo(
    () => columns.filter((col) => visibility[col.key] !== false),
    [columns, visibility]
  );

  return { visibility, toggleColumn, showAll, resetToDefault, visibleColumns };
}