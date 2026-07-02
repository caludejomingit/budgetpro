import { addMonths, endOfMonth, format, parseISO, startOfMonth, subMonths } from 'date-fns';

/** A month is identified by its first-of-month date, e.g. "2026-07-01". */
export type MonthKey = string;

export function monthKeyFromDate(date: Date): MonthKey {
  return format(startOfMonth(date), 'yyyy-MM-dd');
}

export function currentMonthKey(): MonthKey {
  return monthKeyFromDate(new Date());
}

export function previousMonthKey(monthKey: MonthKey): MonthKey {
  return monthKeyFromDate(subMonths(parseISO(monthKey), 1));
}

export function nextMonthKey(monthKey: MonthKey): MonthKey {
  return monthKeyFromDate(addMonths(parseISO(monthKey), 1));
}

export function monthRange(monthKey: MonthKey): { start: string; end: string } {
  const date = parseISO(monthKey);
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  };
}

export function formatMonthLabel(monthKey: MonthKey): string {
  return format(parseISO(monthKey), 'MMMM yyyy');
}

export function formatMonthShort(monthKey: MonthKey): string {
  return format(parseISO(monthKey), 'MMM yyyy');
}

export function formatDayLabel(isoDate: string): string {
  return format(parseISO(isoDate), 'd MMM yyyy');
}

export function daysRemainingInMonth(monthKey: MonthKey): number {
  const { end } = monthRange(monthKey);
  const today = new Date();
  const endDate = parseISO(end);
  if (monthKey !== currentMonthKey()) return 0;
  const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}
