import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalCard } from '@/components/goals/GoalCard';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/use-theme';
import {
  useAddGoalContribution,
  useCreateGoal,
  useDeleteGoal,
  useDeleteGoalContribution,
  useGoals,
} from '@/hooks/useGoals';
import { useAuth } from '@/lib/auth/AuthContext';

export default function GoalsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const deleteGoal = useDeleteGoal();
  const addContribution = useAddGoalContribution();
  const deleteContribution = useDeleteGoalContribution();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const resetForm = () => {
    setName('');
    setTarget('');
    setTargetDate(null);
    setShowForm(false);
  };

  const submitGoal = async () => {
    if (!user || !name.trim() || !Number(target) || Number(target) <= 0) return;
    await createGoal.mutateAsync({ userId: user.id, name: name.trim(), targetAmount: Number(target), targetDate });
    resetForm();
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerTitleWrap}>
          <ThemedText type="subtitle">Goals</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Save toward something specific
          </ThemedText>
        </View>
        <Pressable onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: theme.backgroundSelected }]}>
          <Feather name="x" size={18} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {showForm ? (
          <Card style={styles.formCard}>
            <Input label="Goal name" placeholder="e.g. Buy a car" value={name} onChangeText={setName} />
            <Input
              label="Target amount (₹)"
              placeholder="0"
              keyboardType="numeric"
              value={target}
              onChangeText={setTarget}
              style={{ fontFamily: 'IBMPlexMono_400Regular' }}
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Target date (optional)
            </ThemedText>
            <Pressable onPress={() => setShowDatePicker(true)} style={[styles.dateButton, { backgroundColor: theme.backgroundSelected }]}>
              <Feather name="calendar" size={16} color={theme.text} />
              <ThemedText>{targetDate ? format(new Date(targetDate), 'd MMM yyyy') : 'No target date'}</ThemedText>
            </Pressable>
            {showDatePicker ? (
              <DateTimePicker
                value={targetDate ? new Date(targetDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                minimumDate={new Date()}
                onChange={(_event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setTargetDate(format(date, 'yyyy-MM-dd'));
                }}
              />
            ) : null}
            <View style={styles.formActions}>
              <View style={styles.formActionFlex}>
                <Button label="Cancel" variant="secondary" onPress={resetForm} />
              </View>
              <View style={styles.formActionFlex}>
                <Button label="Create goal" onPress={submitGoal} loading={createGoal.isPending} />
              </View>
            </View>
          </Card>
        ) : (
          <Pressable onPress={() => setShowForm(true)} style={[styles.newGoalBtn, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}>
            <Feather name="plus-circle" size={16} color={theme.primary} />
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              New goal
            </ThemedText>
          </Pressable>
        )}

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={theme.primary} />
        ) : goals && goals.length > 0 ? (
          goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onAddContribution={async (amount, note) => {
                if (!user) return;
                await addContribution.mutateAsync({ goalId: g.id, userId: user.id, amount, occurredOn: format(new Date(), 'yyyy-MM-dd'), note });
              }}
              onDeleteContribution={(id) => deleteContribution.mutate(id)}
              onDeleteGoal={() => deleteGoal.mutate(g.id)}
            />
          ))
        ) : (
          <EmptyState icon="target" title="No goals yet" message="Set a savings goal — like buying a car — and log contributions as you save toward it." />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitleWrap: { gap: 1 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  newGoalBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  formCard: { gap: 2 },
  label: { marginBottom: 8, marginTop: 4 },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, borderRadius: 14, paddingHorizontal: 14, marginBottom: 8 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  formActionFlex: { flex: 1 },
  loader: { marginTop: 30 },
});
