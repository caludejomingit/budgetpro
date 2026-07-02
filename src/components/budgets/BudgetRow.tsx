import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CategoryGlyph } from '@/components/ui/CategoryGlyph';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format/currency';
import type { Category } from '@/types/database';

interface Props {
  category: Category;
  spent: number;
  limit: number;
}

export function BudgetRow({ category, spent, limit }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.topLine}>
        <View style={styles.nameWrap}>
          <View style={[styles.iconWrap, { backgroundColor: theme.backgroundSelected }]}>
            <CategoryGlyph name={category.name} size={15} color={theme.primaryDark} />
          </View>
          <ThemedText type="smallBold">{category.name}</ThemedText>
        </View>
        <ThemedText type="amountSmall" themeColor="textSecondary">
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </ThemedText>
      </View>
      <ProgressBar ratio={limit > 0 ? spent / limit : 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6, paddingVertical: 10 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nameWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: { width: 28, height: 28, borderRadius: Radius.sm - 1, alignItems: 'center', justifyContent: 'center' },
});
