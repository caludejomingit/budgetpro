export type TipSeverity = 'info' | 'warning' | 'critical';

export interface Tip {
  id: string;
  severity: TipSeverity;
  message: string;
  categoryId?: string;
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

export interface TipInput {
  currentMonthExpense: CategorySpend[];
  previousMonthExpense: CategorySpend[];
  budgets: BudgetInput[];
  totalIncome: number;
  totalExpense: number;
  daysRemainingInMonth: number;
}

const DISCRETIONARY_CATEGORY_NAMES = new Set(['Food', 'Shopping', 'Entertainment']);

function pct(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}

export function generateSavingsTips(input: TipInput): Tip[] {
  const tips: Tip[] = [];
  const previousByCategory = new Map(input.previousMonthExpense.map((c) => [c.categoryId, c]));
  const budgetByCategory = new Map(input.budgets.map((b) => [b.categoryId, b]));

  // 1. Negative net month — most urgent, surfaced first.
  if (input.totalExpense > input.totalIncome && input.totalIncome > 0) {
    tips.push({
      id: 'negative-net',
      severity: 'critical',
      message: `You've spent more than you earned this month — expenses are ₹${Math.round(
        input.totalExpense - input.totalIncome
      ).toLocaleString('en-IN')} over income so far.`,
    });
  }

  // 2. Over-budget categories.
  for (const spend of input.currentMonthExpense) {
    const budget = budgetByCategory.get(spend.categoryId);
    if (!budget || budget.limitAmount <= 0) continue;
    const ratio = spend.amount / budget.limitAmount;
    if (ratio > 1) {
      tips.push({
        id: `over-budget-${spend.categoryId}`,
        severity: 'critical',
        message: `${spend.categoryName} is over budget by ₹${Math.round(spend.amount - budget.limitAmount).toLocaleString(
          'en-IN'
        )} this month.`,
        categoryId: spend.categoryId,
      });
    } else if (ratio >= 0.8) {
      tips.push({
        id: `approaching-budget-${spend.categoryId}`,
        severity: 'warning',
        message: `You've used ${Math.round(ratio * 100)}% of your ${spend.categoryName} budget${
          input.daysRemainingInMonth > 0 ? ` with ${input.daysRemainingInMonth} days left in the month` : ''
        }.`,
        categoryId: spend.categoryId,
      });
    }
  }

  // 3. Category month-over-month spikes.
  for (const spend of input.currentMonthExpense) {
    const previous = previousByCategory.get(spend.categoryId);
    if (!previous || previous.amount <= 0) continue;
    const change = pct(previous.amount, spend.amount);
    if (change > 25) {
      tips.push({
        id: `spike-${spend.categoryId}`,
        severity: 'warning',
        message: `${spend.categoryName} spending is up ${Math.round(change)}% vs last month (₹${Math.round(
          previous.amount
        ).toLocaleString('en-IN')} → ₹${Math.round(spend.amount).toLocaleString('en-IN')}).`,
        categoryId: spend.categoryId,
      });
    }
  }

  // 4. High discretionary spend share.
  if (input.totalExpense > 0) {
    const discretionaryTotal = input.currentMonthExpense
      .filter((c) => DISCRETIONARY_CATEGORY_NAMES.has(c.categoryName))
      .reduce((sum, c) => sum + c.amount, 0);
    const share = discretionaryTotal / input.totalExpense;
    if (share > 0.3) {
      tips.push({
        id: 'high-discretionary-share',
        severity: 'info',
        message: `${Math.round(share * 100)}% of your spending this month is on food, shopping, and entertainment — small cuts here go furthest.`,
      });
    }
  }

  // 5. Fallback when no budgets are set — rules 2/3 need budget data to be most useful.
  if (input.budgets.length === 0) {
    tips.push({
      id: 'no-budgets-set',
      severity: 'info',
      message: 'Set a monthly budget for your top spending categories to get over-budget warnings here.',
    });
  }

  const severityRank: Record<TipSeverity, number> = { critical: 0, warning: 1, info: 2 };
  return tips.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}
