/**
 * Category icon paths and lists, ported verbatim from the BudgetPro reference
 * app (github.com/caludejomingit/bugetprofinal, js/app.js) for exact visual
 * fidelity. Each entry is raw SVG path/shape markup in a 24x24 viewBox,
 * rendered via react-native-svg (see CategoryGlyph.tsx).
 */

export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Bills & Utilities',
  'Food & Dining',
  'Transport',
  'Fuel',
  'Shopping',
  'Entertainment',
  'Health',
  'Fitness',
  'Personal Care',
  'Rent',
  'Home & Maintenance',
  'Subscriptions',
  'Insurance',
  'Education',
  'Travel',
  'Pets',
  'Childcare',
  'Gifts & Donations',
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
  '#1E6B4E', '#C97452', '#C9A03D', '#4C7A94', '#8B6BB0', '#3E8E7E', '#B0574F', '#6E8C4A',
  '#A88B3F', '#4E6E8C', '#7A6E5E', '#5C8A72', '#B0894A', '#6B5B95', '#4F8FA6', '#A65D57',
  '#598C6E', '#8C7548', '#7E6BA6', '#4E7A8C',
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

/** Raw shape data per category — mirrors the reference's ICONS object. */
export const CATEGORY_ICON_SHAPES: Record<string, IconShape[]> = {
  Groceries: [
    { circles: [{ cx: 9, cy: 20, r: 1.3 }, { cx: 17, cy: 20, r: 1.3 }] },
    { path: 'M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L20 7H6' },
  ],
  'Bills & Utilities': [{ polygon: '12,2 4,14 11,14 10,22 20,9 13,9' }],
  'Food & Dining': [{ path: 'M6 2v7a2 2 0 0 0 4 0V2M8 2v20M16 2c-1.2 1.5-2 3-2 5s.8 3.5 2 5v10' }],
  Transport: [
    { path: 'M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13' },
    { rect: { x: 2, y: 13, width: 20, height: 6, rx: 1.5 } },
    { circles: [{ cx: 7, cy: 19, r: 1.4 }, { cx: 17, cy: 19, r: 1.4 }] },
  ],
  Fuel: [
    { path: 'M5 21V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15' },
    { path: 'M4 21h11' },
    { path: 'M14 9h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3' },
  ],
  Shopping: [{ path: 'M6 8h12l-1 12H7L6 8z' }, { path: 'M9 8V6a3 3 0 0 1 6 0v2' }],
  Entertainment: [{ circles: [{ cx: 12, cy: 12, r: 9 }] }, { polygon: '10,8.5 16,12 10,15.5' }],
  Health: [{ path: 'M12 20s-7-4.6-9.3-9.1C1.2 7.9 2.9 4.7 6 4.2c2-.3 3.6.9 6 3.5 2.4-2.6 4-3.8 6-3.5 3.1.5 4.8 3.7 3.3 6.7C19 15.4 12 20 12 20z' }],
  Fitness: [{ path: 'M4 9v6M20 9v6M2 12h2M20 12h2M7 7v10M17 7v10M7 12h10' }],
  'Personal Care': [{ path: 'M12 3v4M12 17v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M3 12h4M17 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8' }],
  Rent: [{ path: 'M4 11l8-7 8 7' }, { path: 'M6 10v10h12V10' }],
  'Home & Maintenance': [{ path: 'M14.7 6.3a4 4 0 1 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2 2.3-2.3z' }],
  Subscriptions: [{ path: 'M4 4v5h5M20 20v-5h-5' }, { path: 'M20 9a8 8 0 0 0-14.3-4.3M4 15a8 8 0 0 0 14.3 4.3' }],
  Insurance: [{ path: 'M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z' }, { path: 'M9 12l2 2 4-4' }],
  Education: [
    { path: 'M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 1-2-2z' },
    { path: 'M20 5a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 0 2-2z' },
  ],
  Travel: [
    { rect: { x: 4, y: 8, width: 16, height: 12, rx: 2 } },
    { path: 'M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' },
    { path: 'M4 13h16' },
  ],
  Pets: [
    { circles: [{ cx: 7, cy: 8, r: 1.6 }, { cx: 12, cy: 6, r: 1.6 }, { cx: 17, cy: 8, r: 1.6 }] },
    {
      path: 'M12 21c-3 0-5-1.6-5-4 0-2 1.7-3 3.2-3.6.6-.2 1-.8 1-1.4 0-.5.3-1 .8-1 .5 0 .8.5.8 1 0 .6.4 1.2 1 1.4C15.3 14 17 15 17 17c0 2.4-2 4-5 4z',
    },
  ],
  Childcare: [{ circles: [{ cx: 12, cy: 7, r: 3 }] }, { path: 'M7 21v-2a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2' }],
  'Gifts & Donations': [
    { rect: { x: 3, y: 8, width: 18, height: 13 } },
    { path: 'M3 8h18M12 8v13' },
    { path: 'M12 8c-1.5-4-6-4-6 0M12 8c1.5-4 6-4 6 0' },
  ],
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
