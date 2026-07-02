/**
 * Category lists tuned to the user's actual real-life spending categories
 * (grocery runs, petrol, rent, EMIs, etc.) rather than a generic reference
 * taxonomy. Icons are raw SVG path/shape markup in a 24x24 viewBox, rendered
 * via react-native-svg (see CategoryGlyph.tsx).
 */

export const EXPENSE_CATEGORIES = [
  'Grocery',
  'Food',
  'Petrol',
  'Travel Expense',
  'Rent',
  'Bills',
  'Medical Bills',
  'Shopping',
  'EMI',
  'Savings',
  'Miscellaneous',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Rental Income',
  'Interest & Dividends',
  'Refunds & Cashback',
  'Gifts',
  'Other Income',
] as const;

/** One distinct color per expense category, in EXPENSE_CATEGORIES order. */
export const CAT_COLORS: string[] = [
  '#1E6B4E', // Grocery
  '#C97452', // Food
  '#8B6BB0', // Petrol
  '#A65D57', // Travel Expense
  '#7A6E5E', // Rent
  '#4C7A94', // Bills
  '#8E5B4A', // Medical Bills
  '#3E8E7E', // Shopping
  '#5B7A6E', // EMI
  '#C9A03D', // Savings
  '#6E7C73', // Miscellaneous (catch-all — muted)
];

export function categoryColor(name: string): string {
  const i = EXPENSE_CATEGORIES.indexOf(name as (typeof EXPENSE_CATEGORIES)[number]);
  if (i >= 0) return CAT_COLORS[i];
  return '#1E6B4E';
}

interface IconShape {
  circles?: { cx: number; cy: number; r: number }[];
  path?: string;
  rect?: { x: number; y: number; width: number; height: number; rx?: number };
  polygon?: string;
}

/** Raw shape data per category, rendered by CategoryGlyph.tsx. */
export const CATEGORY_ICON_SHAPES: Record<string, IconShape[]> = {
  Grocery: [
    { circles: [{ cx: 9, cy: 20, r: 1.3 }, { cx: 17, cy: 20, r: 1.3 }] },
    { path: 'M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L20 7H6' },
  ],
  Food: [{ path: 'M6 2v7a2 2 0 0 0 4 0V2M8 2v20M16 2c-1.2 1.5-2 3-2 5s.8 3.5 2 5v10' }],
  Petrol: [
    { path: 'M5 21V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15' },
    { path: 'M4 21h11' },
    { path: 'M14 9h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3' },
  ],
  'Travel Expense': [
    { rect: { x: 4, y: 8, width: 16, height: 12, rx: 2 } },
    { path: 'M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' },
    { path: 'M4 13h16' },
  ],
  Rent: [{ path: 'M4 11l8-7 8 7' }, { path: 'M6 10v10h12V10' }],
  Bills: [{ polygon: '12,2 4,14 11,14 10,22 20,9 13,9' }],
  'Medical Bills': [
    { rect: { x: 3, y: 3, width: 18, height: 18, rx: 5 } },
    { path: 'M12 8v8M8 12h8' },
  ],
  Shopping: [{ path: 'M6 8h12l-1 12H7L6 8z' }, { path: 'M9 8V6a3 3 0 0 1 6 0v2' }],
  EMI: [
    { rect: { x: 5, y: 3, width: 14, height: 18, rx: 2 } },
    { path: 'M8 8h8M8 12h8M8 16h5' },
  ],
  Savings: [{ path: 'M4 17l5-5 4 4 7-7' }, { path: 'M15 9h5v5' }],
  Miscellaneous: [
    {
      circles: [
        { cx: 6, cy: 6, r: 1.5 }, { cx: 12, cy: 6, r: 1.5 }, { cx: 18, cy: 6, r: 1.5 },
        { cx: 6, cy: 12, r: 1.5 }, { cx: 12, cy: 12, r: 1.5 }, { cx: 18, cy: 12, r: 1.5 },
        { cx: 6, cy: 18, r: 1.5 }, { cx: 12, cy: 18, r: 1.5 }, { cx: 18, cy: 18, r: 1.5 },
      ],
    },
  ],
  Salary: [{ rect: { x: 3, y: 8, width: 18, height: 12, rx: 2 } }, { path: 'M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }],
  Freelance: [{ rect: { x: 4, y: 4, width: 16, height: 10, rx: 1 } }, { path: 'M2 20h20l-2-4H4l-2 4z' }],
  Business: [{ rect: { x: 4, y: 3, width: 16, height: 18 } }, { path: 'M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2' }],
  'Rental Income': [{ path: 'M4 11l8-7 8 7' }, { path: 'M6 10v10h12V10' }, { circles: [{ cx: 12, cy: 14, r: 1.2 }] }],
  'Interest & Dividends': [{ circles: [{ cx: 7, cy: 7, r: 3 }, { cx: 17, cy: 17, r: 3 }] }, { path: 'M4 20L20 4' }],
  'Refunds & Cashback': [
    { path: 'M3 12a9 9 0 0 1 15-6.7L21 8' },
    { path: 'M21 3v5h-5' },
    { path: 'M21 12a9 9 0 0 1-15 6.7L3 16' },
    { path: 'M3 21v-5h5' },
  ],
  Gifts: [
    { rect: { x: 3, y: 8, width: 18, height: 13 } },
    { path: 'M3 8h18M12 8v13' },
    { path: 'M12 8c-1.5-4-6-4-6 0M12 8c1.5-4 6-4 6 0' },
  ],
  'Other Income': [{ polygon: '12,2 14.9,8.6 22,9.3 16.7,14 18.2,21 12,17.3 5.8,21 7.3,14 2,9.3 9.1,8.6' }],
};
