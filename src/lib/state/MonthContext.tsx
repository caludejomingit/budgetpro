import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { currentMonthKey, monthKeyFromDate, nextMonthKey, previousMonthKey, type MonthKey } from '@/lib/format/date';
import { parseISO } from 'date-fns';

const STORAGE_KEY = 'budgetpro:viewMonth';

interface MonthContextValue {
  viewMonth: MonthKey;
  setViewMonth: (month: MonthKey) => void;
  shiftMonth: (delta: 1 | -1) => void;
}

const MonthContext = createContext<MonthContextValue | undefined>(undefined);

/** The month currently being viewed across all tabs — mirrors the reference app's
 * shared `viewMonth`, persisted locally so it survives app restarts. */
export function MonthProvider({ children }: { children: ReactNode }) {
  const [viewMonth, setViewMonthState] = useState<MonthKey>(currentMonthKey());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setViewMonthState(monthKeyFromDate(parseISO(saved)));
    });
  }, []);

  const setViewMonth = (month: MonthKey) => {
    setViewMonthState(month);
    AsyncStorage.setItem(STORAGE_KEY, month);
  };

  const value = useMemo<MonthContextValue>(
    () => ({
      viewMonth,
      setViewMonth,
      shiftMonth: (delta) => setViewMonth(delta > 0 ? nextMonthKey(viewMonth) : previousMonthKey(viewMonth)),
    }),
    [viewMonth]
  );

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
}

export function useMonth(): MonthContextValue {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error('useMonth must be used within a MonthProvider');
  return ctx;
}
