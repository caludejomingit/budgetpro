import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

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
  onSave: (limit: number) => void;
}

export function BudgetRow({ category, spent, limit, onSave }: Props) {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(limit > 0 ? String(limit) : '');

  const commit = () => {
    const value = Number(draft) || 0;
    onSave(value);
    setEditing(false);
  };

  return (
    <View style={styles.row}>
      <View style={styles.topLine}>
        <View style={styles.nameWrap}>
          <View style={[styles.iconWrap, { backgroundColor: theme.backgroundSelected }]}>
            <CategoryGlyph name={category.name} size={15} color={theme.primaryDark} />
          </View>
          <ThemedText type="smallBold">{category.name}</ThemedText>
        </View>
        {editing ? (
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            onBlur={commit}
            onSubmitEditing={commit}
            keyboardType="numeric"
            style={[styles.input, { color: theme.text, borderColor: theme.border, fontFamily: 'IBMPlexMono_400Regular' }]}
          />
        ) : (
          <Pressable onPress={() => setEditing(true)}>
            <ThemedText type="amountSmall" themeColor="textSecondary">
              {limit > 0 ? `${formatCurrency(limit)}` : 'Set budget'}
            </ThemedText>
          </Pressable>
        )}
      </View>
      {limit > 0 ? (
        <>
          <ProgressBar ratio={spent / limit} />
          <ThemedText type="amountSmall" themeColor="textSecondary">
            {formatCurrency(spent)} / {formatCurrency(limit)}
          </ThemedText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6, paddingVertical: 10 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nameWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: { width: 28, height: 28, borderRadius: Radius.sm - 1, alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, width: 90, textAlign: 'right' },
});
