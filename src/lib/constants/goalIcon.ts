import type { Feather } from '@expo/vector-icons';

interface GoalTheme {
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

const KEYWORD_ICONS: { keywords: string[]; icon: keyof typeof Feather.glyphMap }[] = [
  { keywords: ['car', 'bike', 'vehicle', 'scooter'], icon: 'truck' },
  { keywords: ['home', 'house', 'flat', 'apartment', 'rent deposit'], icon: 'home' },
  { keywords: ['trip', 'travel', 'vacation', 'holiday', 'tour'], icon: 'map-pin' },
  { keywords: ['phone', 'laptop', 'gadget', 'computer', 'camera'], icon: 'smartphone' },
  { keywords: ['wedding', 'marriage', 'ring'], icon: 'heart' },
  { keywords: ['education', 'course', 'study', 'college', 'school'], icon: 'book-open' },
  { keywords: ['emergency', 'fund', 'safety'], icon: 'shield' },
  { keywords: ['gift', 'present'], icon: 'gift' },
  { keywords: ['health', 'medical', 'surgery'], icon: 'plus-square' },
  { keywords: ['gold', 'jewel', 'jewellery', 'jewelry'], icon: 'star' },
];

/** Brand-palette colors, cycled deterministically per goal so each card reads distinctly. */
const GOAL_COLORS = ['#1E6B4E', '#C97452', '#C9A03D', '#8B6BB0', '#4C7A94', '#8E5B4A', '#3E8E7E'];

export function goalTheme(name: string): GoalTheme {
  const lower = name.toLowerCase();
  const match = KEYWORD_ICONS.find((k) => k.keywords.some((kw) => lower.includes(kw)));
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return { icon: match?.icon ?? 'target', color: GOAL_COLORS[hash % GOAL_COLORS.length] };
}
