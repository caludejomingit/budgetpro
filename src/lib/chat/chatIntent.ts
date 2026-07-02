import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/constants/categories';
import { formatCurrency } from '@/lib/format/currency';

export interface MonthExpenseSnapshot {
  hasTransactions: boolean;
  income: number;
  expenseByCategory: Record<string, number>;
}

export interface ChatData {
  monthLabel: string;
  currentExpenseByCategory: Record<string, number>;
  totals: { income: number; expense: number };
  budgetsByCategory: Record<string, number>;
  /** Current month first, then previous months — used for the 3-month budget suggestion. */
  recentMonths: MonthExpenseSnapshot[];
}

export type ChatAction =
  | { type: 'setBudget'; category: string; amount: number }
  | { type: 'applySuggestion'; suggestion: Record<string, number> };

export interface ChatResult {
  reply: string;
  action?: ChatAction;
  suggestion?: Record<string, number> | null;
}

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

function findCategory(lower: string): string | undefined {
  return (
    ALL_CATEGORIES.find((c) => lower.includes(c.toLowerCase())) ??
    ALL_CATEGORIES.find((c) => lower.includes(c.toLowerCase().split(' ')[0]))
  );
}

function extractAmount(lower: string): number | null {
  const m = lower.replace(/,/g, '').match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function monthStatusReply(data: ChatData): string {
  const net = data.totals.income - data.totals.expense;
  const rate = data.totals.income > 0 ? Math.round((net / data.totals.income) * 100) : null;
  const totalBudget = EXPENSE_CATEGORIES.reduce((s, c) => s + (data.budgetsByCategory[c] || 0), 0);
  const remaining = totalBudget - data.totals.expense;
  let msg = `For ${data.monthLabel}: you've earned ${formatCurrency(data.totals.income)} and spent ${formatCurrency(data.totals.expense)}, leaving ${formatCurrency(Math.abs(net))} ${net < 0 ? 'in the red' : 'in savings'}.`;
  if (rate !== null) msg += ` That's roughly a ${rate}% savings rate.`;
  if (totalBudget > 0) msg += ` You have ${formatCurrency(Math.max(0, remaining))} left across your budgets${remaining < 0 ? " — you're over overall" : ''}.`;
  else msg += ` You haven't set any budgets yet — ask me to "suggest a budget" and I'll put one together from your spending.`;
  return msg;
}

function whereCanISave(data: ChatData): string {
  const spend = data.currentExpenseByCategory;
  const over = Object.keys(data.budgetsByCategory).filter((c) => spend[c] && spend[c] > data.budgetsByCategory[c]);
  const top = Object.entries(spend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  let msg = '';
  if (over.length) msg += `You're over budget on ${over.join(' and ')}. `;
  if (top.length) {
    msg += `Your biggest categories this month are ${top.map(([c, a]) => `${c} (${formatCurrency(a)})`).join(' and ')}. `;
  } else {
    msg += `No expenses logged yet this month, so there's nothing to trim just yet.`;
  }
  return msg.trim();
}

function suggestBudgetPlan(data: ChatData): ChatResult {
  const monthsWithTx = data.recentMonths.filter((m) => m.hasTransactions);
  const activeMonths = Math.max(1, monthsWithTx.length);
  const perCat: Record<string, number> = {};
  monthsWithTx.forEach((m) => {
    for (const [cat, amt] of Object.entries(m.expenseByCategory)) {
      perCat[cat] = (perCat[cat] || 0) + amt;
    }
  });
  const avgIncome = monthsWithTx.length ? monthsWithTx.reduce((s, m) => s + m.income, 0) / activeMonths : 0;

  const suggestion: Record<string, number> = {};
  EXPENSE_CATEGORIES.forEach((c) => {
    if (perCat[c]) suggestion[c] = Math.max(0, Math.round(((perCat[c] / activeMonths) * 0.95) / 10) * 10);
  });

  if (Object.keys(suggestion).length === 0) {
    return { reply: `I don't have enough transaction history yet to suggest budgets — log a few weeks of entries and ask me again.`, suggestion: null };
  }
  const lines = Object.entries(suggestion)
    .map(([c, a]) => `${c}: ${formatCurrency(a)}`)
    .join(', ');
  const incomeNote = avgIncome > 0 ? ` Based on your average income of ${formatCurrency(Math.round(avgIncome))}, this leaves roughly a 20% savings rate.` : '';
  return {
    reply: `Here's a suggested monthly budget based on your recent spending (slightly below your 3-month average, to nudge you toward saving) — ${lines}.${incomeNote} Say "apply suggestion" if you'd like me to save these to your Budgets page.`,
    suggestion,
  };
}

export function handleChatIntent(raw: string, data: ChatData, lastSuggestion: Record<string, number> | null): ChatResult {
  const text = raw.trim();
  const lower = text.toLowerCase();

  if (/^(hi|hello|hey)\b/.test(lower)) {
    return {
      reply: `Hi! I'm your BudgetPro assistant. Ask me things like "how am I doing this month?", "suggest a budget", "where can I save money?", or "set budget for Rent to 15000".`,
    };
  }

  if (/apply/.test(lower) && lastSuggestion) {
    return { reply: `Applied — I've saved those suggested budgets to your Budgets page.`, action: { type: 'applySuggestion', suggestion: lastSuggestion }, suggestion: null };
  }

  if (/(set|update|change)\b.*budget/.test(lower) || /budget\b.*(to|at|=)\s*\d/.test(lower)) {
    const cat = findCategory(lower);
    const amount = extractAmount(lower);
    if (cat && (EXPENSE_CATEGORIES as readonly string[]).includes(cat) && amount) {
      return { reply: `Done — I've set your ${cat} budget to ${formatCurrency(amount)} for this month.`, action: { type: 'setBudget', category: cat, amount } };
    }
    return { reply: `Tell me the category and amount, like "set budget for Grocery to 6000".` };
  }

  if (/(suggest|plan|help).*(budget|save|savings)|budget.*(plan|suggest)/.test(lower)) {
    return suggestBudgetPlan(data);
  }

  if (/(save money|cut|reduce|overspend|too much|spending less)/.test(lower)) {
    return { reply: whereCanISave(data) };
  }

  if (/(how am i doing|status|summary|overview|this month)/.test(lower)) {
    return { reply: monthStatusReply(data) };
  }

  const cat = findCategory(lower);
  if (cat) {
    const spent = data.currentExpenseByCategory[cat] || 0;
    const b = data.budgetsByCategory[cat];
    if (/(spend|spent|spending|cost)/.test(lower) && b) {
      return { reply: `You've spent ${formatCurrency(spent)} on ${cat} this month, out of a ${formatCurrency(b)} budget (${Math.round((spent / b) * 100)}%).` };
    }
    return {
      reply: b
        ? `${cat}: ${formatCurrency(spent)} logged this month, against a ${formatCurrency(b)} budget.`
        : `${cat}: ${formatCurrency(spent)} logged this month. You don't have a budget set for it yet — want me to set one? Just say e.g. "set budget for ${cat} to 5000".`,
    };
  }

  return { reply: `I can help you plan your budget. Try asking: "how am I doing this month?", "where can I save money?", "suggest a budget", or "set budget for Grocery to 5000".` };
}
