import { formatCurrency } from '@/lib/format/currency';

export type NoteVariant = 'default' | 'warn' | 'gold';

export interface InsightNote {
  tag: string;
  variant: NoteVariant;
  text: string;
}

export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  amount: number;
}

export interface BudgetInput {
  categoryId: string;
  categoryName: string;
  limitAmount: number;
}

export interface InsightsInput {
  currentMonthExpense: CategorySpend[];
  previousMonthExpense: CategorySpend[];
  budgets: BudgetInput[];
  totalIncome: number;
  totalExpense: number;
  daysRemainingInMonth: number | null;
}

/** Ported from the BudgetPro reference app's generateInsights() (js/app.js). */
export function generateInsights(input: InsightsInput): InsightNote[] {
  const notes: InsightNote[] = [];
  const spendByCategory = new Map(input.currentMonthExpense.map((c) => [c.categoryId, c]));
  const prevByCategory = new Map(input.previousMonthExpense.map((c) => [c.categoryId, c.amount]));

  for (const budget of input.budgets) {
    if (budget.limitAmount <= 0) continue;
    const spent = spendByCategory.get(budget.categoryId)?.amount ?? 0;
    const pct = Math.round((spent / budget.limitAmount) * 100);
    if (pct >= 100) {
      notes.push({
        tag: 'Over budget',
        variant: 'warn',
        text: `You've gone past your ${budget.categoryName} budget by ${formatCurrency(spent - budget.limitAmount)}. Might be worth a closer look before month-end.`,
      });
    } else if (pct >= 80) {
      const dayText = input.daysRemainingInMonth !== null ? ` with ${input.daysRemainingInMonth} day${input.daysRemainingInMonth === 1 ? '' : 's'} left` : '';
      notes.push({
        tag: 'Getting close',
        variant: 'warn',
        text: `${budget.categoryName} is already at ${pct}% of its ${formatCurrency(budget.limitAmount)} budget${dayText}.`,
      });
    }
  }

  const topCats = [...input.currentMonthExpense].sort((a, b) => b.amount - a.amount).slice(0, 2);
  for (const c of topCats) {
    const prevAmt = prevByCategory.get(c.categoryId) ?? 0;
    if (prevAmt > 0) {
      const change = Math.round(((c.amount - prevAmt) / prevAmt) * 100);
      if (Math.abs(change) >= 15) {
        notes.push({
          tag: change > 0 ? 'Trending up' : 'Trending down',
          variant: change > 0 ? 'warn' : 'default',
          text: `${c.categoryName} spending is ${change > 0 ? 'up' : 'down'} ${Math.abs(change)}% compared to last month.`,
        });
      }
    }
  }

  const net = input.totalIncome - input.totalExpense;
  if (input.totalIncome > 0) {
    const rate = Math.round((net / input.totalIncome) * 100);
    if (rate >= 20) {
      notes.push({ tag: 'Nicely done', variant: 'gold', text: `You're saving ${rate}% of your income this month — well above the 20% mark most planners aim for.` });
    } else if (rate >= 0) {
      notes.push({ tag: 'Room to grow', variant: 'default', text: `You're keeping ${rate}% of your income this month. Trimming your top category a little could push this higher.` });
    } else {
      notes.push({ tag: 'Spending more than earning', variant: 'warn', text: `Expenses are ${formatCurrency(Math.abs(net))} more than income this month. Worth pausing non-essential spending.` });
    }
  } else if (input.totalExpense > 0) {
    notes.push({ tag: 'No income logged', variant: 'warn', text: `You've logged ${formatCurrency(input.totalExpense)} in expenses but no income yet for this month.` });
  }

  if (input.budgets.length === 0) {
    notes.push({ tag: 'Tip', variant: 'gold', text: `You haven't set any budgets yet. Add a few and your diary will start flagging overspending automatically.` });
  }
  if (notes.length === 0) {
    notes.push({ tag: 'All quiet', variant: 'default', text: `Nothing to flag this month. Keep logging entries and I'll keep watching your numbers.` });
  }
  return notes;
}

/** Category-specific tips, keyed by category name — ported from TIP_LIBRARY. */
export const TIP_LIBRARY: Record<string, string> = {
  Groceries: 'Plan meals for the week and shop with a list — impulse buys often add 15–20% to grocery bills.',
  'Food & Dining': 'Try cooking at home a couple of extra days a week; eating out usually costs 3–5x more per meal.',
  'Bills & Utilities': 'Switch off standby appliances and compare utility plans once a year.',
  Shopping: 'Give non-essential purchases a 24-hour wait before buying.',
  Entertainment: 'Rotate subscriptions instead of running several at once.',
  Transport: 'Combine errands into one trip, or explore carpooling for regular commutes.',
  Subscriptions: 'Audit subscriptions every quarter — cancel anything unused in the last 30 days.',
  Health: 'Preventive check-ups can be cheaper than treatment later — compare routine costs across providers.',
  Rent: 'If rent is over 30% of income, it may be worth reviewing housing options at your next renewal.',
  Education: 'Look for annual plans or scholarships instead of paying monthly.',
  Miscellaneous: "Track 'miscellaneous' closely — vague categories often hide the most avoidable spending.",
};

export const GENERAL_TIPS: string[] = [
  "Automate a fixed transfer to savings right after you're paid, before spending starts.",
  'Review your top 3 spending categories every Sunday — five minutes is usually enough.',
  "Keep a small buffer for irregular costs (birthdays, repairs) so they don't derail your budget.",
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Builds the shuffled tip pool (relevant category tips + general tips), matching renderTips(). */
export function buildTipsPool(currentMonthExpense: CategorySpend[]): string[] {
  const spentCatsWithTips = [...currentMonthExpense]
    .sort((a, b) => b.amount - a.amount)
    .map((c) => c.categoryName)
    .filter((name) => TIP_LIBRARY[name]);
  return [...spentCatsWithTips.map((name) => TIP_LIBRARY[name]), ...GENERAL_TIPS];
}
