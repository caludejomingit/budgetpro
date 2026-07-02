import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProgressBar } from '@/components/ui/ProgressBar';
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
          <Feather name={(category.icon as any) ?? 'circle'} size={16} color={category.color ?? theme.text} />
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
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          />
        ) : (
          <Pressable onPress={() => setEditing(true)}>
            <ThemedText type="small" themeColor="textSecondary">
              {limit > 0 ? `Budget ${formatCurrency(limit)}` : 'Set budget'}
            </ThemedText>
          </Pressable>
        )}
      </View>
      {limit > 0 ? (
        <>
          <ProgressBar ratio={spent / limit} />
          <ThemedText type="small" themeColor="textSecondary">
            {formatCurrency(spent)} of {formatCurrency(limit)}
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
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, width: 90, textAlign: 'right' },
});
