import { Colors } from '@/constants/theme';

/** BudgetPro is light-only, matching the reference app (no dark mode variant exists there). */
export function useTheme() {
  return Colors.light;
}
