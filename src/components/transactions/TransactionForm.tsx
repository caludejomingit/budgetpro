import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { CategoryGlyph } from '@/components/ui/CategoryGlyph';
import { DateField } from '@/components/ui/DateField';
import { Input } from '@/components/ui/Input';
import { Radius } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useTheme } from '@/hooks/use-theme';
import { PERSON_PRESETS } from '@/lib/constants/categories';
import type { CategoryType, TransactionWithCategory } from '@/types/database';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, 'Enter an amount').refine((v) => Number(v) > 0, 'Amount must be greater than 0'),
  categoryId: z.string().min(1, 'Choose a category'),
  occurredOn: z.string().min(1),
  note: z.string().optional(),
  person: z.string().min(1),
});

export type TransactionFormValues = z.infer<typeof schema>;

interface Props {
  initialValues?: TransactionWithCategory;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  submitLabel: string;
}

export function TransactionForm({ initialValues, onSubmit, submitLabel }: Props) {
  const theme = useTheme();
  const { data: categories } = useCategories();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initialValues?.type ?? 'expense',
      amount: initialValues ? String(initialValues.amount) : '',
      categoryId: initialValues?.category_id ?? '',
      occurredOn: initialValues?.occurred_on ?? format(new Date(), 'yyyy-MM-dd'),
      note: initialValues?.note ?? '',
      person: initialValues?.person ?? 'Shared',
    },
  });

  const type = watch('type');
  const occurredOn = watch('occurredOn');
  const categoryId = watch('categoryId');
  const person = watch('person');
  const filteredCategories = (categories ?? []).filter((c) => c.type === type);

  const setType = (next: CategoryType) => {
    setValue('type', next);
    if (!filteredCategories.some((c) => c.id === categoryId)) setValue('categoryId', '');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.typeToggle}>
        {(['expense', 'income'] as const).map((t) => {
          const active = type === t;
          const color = t === 'income' ? theme.primary : theme.clay;
          return (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[styles.typeButton, { backgroundColor: active ? color : theme.backgroundSelected }]}>
              <ThemedText type="smallBold" style={{ color: active ? '#ffffff' : theme.text }}>
                {t === 'income' ? 'Income' : 'Expense'}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Amount (₹)"
            placeholder="0"
            keyboardType="numeric"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.amount?.message}
            style={{ fontFamily: 'IBMPlexMono_400Regular' }}
          />
        )}
      />

      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        Category
      </ThemedText>
      <View style={styles.categoryGrid}>
        {filteredCategories.map((c) => {
          const active = categoryId === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setValue('categoryId', c.id, { shouldValidate: true })}
              style={[styles.categoryChip, { backgroundColor: active ? `${c.color}22` : theme.backgroundSelected, borderColor: active ? c.color ?? theme.border : 'transparent' }]}>
              <CategoryGlyph name={c.name} size={15} />
              <ThemedText type="small">{c.name}</ThemedText>
            </Pressable>
          );
        })}
      </View>
      {errors.categoryId ? (
        <ThemedText type="small" style={{ color: theme.danger, marginTop: 4 }}>
          {errors.categoryId.message}
        </ThemedText>
      ) : null}

      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        Date
      </ThemedText>
      <View style={styles.dateWrap}>
        <DateField value={occurredOn} onChange={(v) => setValue('occurredOn', v)} maximumDate={new Date()} />
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        Paid by
      </ThemedText>
      <View style={styles.personRow}>
        {PERSON_PRESETS.map((p) => {
          const active = person === p;
          return (
            <Pressable
              key={p}
              onPress={() => setValue('person', p)}
              style={[styles.personChip, { backgroundColor: active ? theme.primary : theme.backgroundSelected }]}>
              <ThemedText type="smallBold" style={{ color: active ? '#ffffff' : theme.text }}>
                {p}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Note (optional)" placeholder="What was this for?" onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />

      <View style={styles.spacer} />
      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  typeToggle: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeButton: { flex: 1, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  label: { marginBottom: 8, marginTop: 4 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  dateWrap: { marginBottom: 16 },
  personRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  personChip: { paddingHorizontal: 16, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  spacer: { height: 8 },
});
