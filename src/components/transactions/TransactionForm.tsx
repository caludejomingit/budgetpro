import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChartColors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useTheme } from '@/hooks/use-theme';
import type { CategoryType, TransactionWithCategory } from '@/types/database';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, 'Enter an amount').refine((v) => Number(v) > 0, 'Amount must be greater than 0'),
  categoryId: z.string().min(1, 'Choose a category'),
  occurredOn: z.string().min(1),
  note: z.string().optional(),
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
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    },
  });

  const type = watch('type');
  const occurredOn = watch('occurredOn');
  const categoryId = watch('categoryId');
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
          const color = t === 'income' ? ChartColors.light.income : ChartColors.light.expense;
          return (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[styles.typeButton, { backgroundColor: active ? color : theme.backgroundElement }]}>
              <ThemedText style={{ color: active ? '#ffffff' : theme.text, fontWeight: '600' }}>
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
              style={[styles.categoryChip, { backgroundColor: active ? `${c.color}22` : theme.backgroundElement, borderColor: active ? c.color ?? theme.border : 'transparent' }]}>
              <Feather name={(c.icon as any) ?? 'circle'} size={16} color={c.color ?? theme.text} />
              <ThemedText type="small">{c.name}</ThemedText>
            </Pressable>
          );
        })}
      </View>
      {errors.categoryId ? (
        <ThemedText type="small" style={{ color: ChartColors.light.expense, marginTop: 4 }}>
          {errors.categoryId.message}
        </ThemedText>
      ) : null}

      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        Date
      </ThemedText>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={[styles.dateButton, { backgroundColor: theme.backgroundElement }]}>
        <Feather name="calendar" size={16} color={theme.text} />
        <ThemedText>{format(parseISO(occurredOn), 'd MMM yyyy')}</ThemedText>
      </Pressable>
      {showDatePicker ? (
        <DateTimePicker
          value={parseISO(occurredOn)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          onChange={(_event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) setValue('occurredOn', format(date, 'yyyy-MM-dd'));
          }}
        />
      ) : null}

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
  typeButton: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
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
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, borderRadius: 12, paddingHorizontal: 14, marginBottom: 16 },
  spacer: { height: 8 },
});
