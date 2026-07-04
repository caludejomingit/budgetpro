import { Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/lib/format/currency';
import { confirmAction } from '@/lib/utils/confirm';
import type { GoalWithProgress } from '@/types/database';

interface Props {
  goal: GoalWithProgress;
  onAddContribution: (amount: number, note: string) => Promise<void>;
  onDeleteContribution: (id: string) => void;
  onDeleteGoal: () => void;
}

export function GoalCard({ goal, onAddContribution, onDeleteContribution, onDeleteGoal }: Props) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ratio = goal.target_amount > 0 ? goal.savedAmount / goal.target_amount : 0;
  const remaining = Math.max(0, goal.target_amount - goal.savedAmount);
  const achieved = goal.savedAmount >= goal.target_amount;

  const submit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    setSubmitting(true);
    try {
      await onAddContribution(value, note);
      setAmount('');
      setNote('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headRow}>
        <View style={styles.flexShrink}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {goal.name}
          </ThemedText>
          {goal.target_date ? (
            <ThemedText type="small" themeColor="textMuted">
              Target: {format(parseISO(goal.target_date), 'd MMM yyyy')}
            </ThemedText>
          ) : null}
        </View>
        <Pressable
          onPress={() => confirmAction('Delete goal', `Delete "${goal.name}" and all its contributions? This can't be undone.`, 'Delete', onDeleteGoal, true)}
          style={styles.deleteBtn}>
          <Feather name="trash-2" size={14} color={theme.textMuted} />
        </Pressable>
      </View>

      <ProgressBar ratio={ratio} height={10} />

      <View style={styles.amountsRow}>
        <ThemedText type="amountSmall" style={{ color: theme.primary }}>
          {formatCurrency(goal.savedAmount)}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          of {formatCurrency(goal.target_amount)}
        </ThemedText>
      </View>

      {achieved ? (
        <View style={[styles.achievedPill, { backgroundColor: theme.primaryLight }]}>
          <Feather name="check-circle" size={13} color={theme.primary} />
          <ThemedText type="small" style={{ color: theme.primary, fontWeight: '700' }}>
            Goal reached!
          </ThemedText>
        </View>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          {formatCurrency(remaining)} to go · {Math.round(ratio * 100)}%
        </ThemedText>
      )}

      <Pressable onPress={() => setExpanded((v) => !v)} style={styles.toggleRow}>
        <ThemedText type="small" style={{ color: theme.primary, fontWeight: '700' }}>
          {expanded ? 'Hide' : goal.contributions.length ? `${goal.contributions.length} contribution(s)` : 'Add a contribution'}
        </ThemedText>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={theme.primary} />
      </Pressable>

      {expanded ? (
        <View style={styles.expandedWrap}>
          <View style={styles.addRow}>
            <View style={styles.amountInput}>
              <Input placeholder="Amount (₹)" keyboardType="numeric" value={amount} onChangeText={setAmount} style={{ fontFamily: 'IBMPlexMono_400Regular' }} />
            </View>
            <View style={styles.noteInput}>
              <Input placeholder="Note (optional)" value={note} onChangeText={setNote} />
            </View>
          </View>
          <Button label="Add contribution" onPress={submit} loading={submitting} />

          {goal.contributions.length > 0 ? (
            <View style={styles.historyList}>
              {goal.contributions.map((c) => (
                <View key={c.id} style={[styles.historyRow, { borderColor: theme.border }]}>
                  <View style={styles.flexShrink}>
                    <ThemedText type="small">{formatCurrency(c.amount)}</ThemedText>
                    <ThemedText type="small" themeColor="textMuted" numberOfLines={1}>
                      {format(parseISO(c.occurred_on), 'd MMM yyyy')}{c.note ? ` · ${c.note}` : ''}
                    </ThemedText>
                  </View>
                  <Pressable onPress={() => onDeleteContribution(c.id)} hitSlop={8}>
                    <Feather name="x" size={14} color={theme.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  flexShrink: { flexShrink: 1, gap: 2 },
  deleteBtn: { padding: 4 },
  amountsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  achievedPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  expandedWrap: { gap: 10, marginTop: 4 },
  addRow: { flexDirection: 'row', gap: 8 },
  amountInput: { width: 130 },
  noteInput: { flex: 1 },
  historyList: { gap: 8, marginTop: 4 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, borderTopWidth: 1, paddingTop: 8, borderRadius: Radius.sm },
});
