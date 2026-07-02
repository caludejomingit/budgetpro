import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/Input';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBudgets, useUpsertBudget } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions, useTransactionsRange } from '@/hooks/useTransactions';
import { useAuth } from '@/lib/auth/AuthContext';
import { handleChatIntent, type ChatData, type MonthExpenseSnapshot } from '@/lib/chat/chatIntent';
import { formatMonthLabel, monthKeyFromDate } from '@/lib/format/date';
import { useMonth } from '@/lib/state/MonthContext';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

const HISTORY_KEY = 'budgetpro:chatHistory';
const QUICK_REPLIES = ['How am I doing this month?', 'Suggest a budget', 'Where can I save money?'];

export default function ChatScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { viewMonth } = useMonth();
  const listRef = useRef<FlatList>(null);

  const { data: transactions } = useTransactions(viewMonth);
  const { data: budgets } = useBudgets(viewMonth);
  const { data: categories } = useCategories();
  const { data: rangeTransactions } = useTransactionsRange(3);
  const upsertBudget = useUpsertBudget();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [lastSuggestion, setLastSuggestion] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((saved) => {
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch {
          // ignore corrupt history
        }
      }
    });
  }, []);

  const persist = (next: ChatMessage[]) => {
    setMessages(next);
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(-40)));
  };

  const categoryByName = useMemo(() => new Map((categories ?? []).map((c) => [c.name, c])), [categories]);

  const chatData: ChatData = useMemo(() => {
    const currentExpenseByCategory: Record<string, number> = {};
    let income = 0;
    let expense = 0;
    for (const t of transactions ?? []) {
      if (t.type === 'income') income += t.amount;
      else {
        expense += t.amount;
        const name = t.category?.name ?? 'Miscellaneous';
        currentExpenseByCategory[name] = (currentExpenseByCategory[name] || 0) + t.amount;
      }
    }
    const budgetsByCategory: Record<string, number> = {};
    for (const b of budgets ?? []) {
      if (b.category?.name) budgetsByCategory[b.category.name] = b.limit_amount;
    }

    const byMonth = new Map<string, MonthExpenseSnapshot>();
    for (let i = 0; i < 3; i++) {
      const d = new Date(new Date(viewMonth).getFullYear(), new Date(viewMonth).getMonth() - i, 1);
      byMonth.set(monthKeyFromDate(d), { hasTransactions: false, income: 0, expenseByCategory: {} });
    }
    for (const t of rangeTransactions ?? []) {
      const key = monthKeyFromDate(new Date(t.occurred_on));
      const snap = byMonth.get(key);
      if (!snap) continue;
      snap.hasTransactions = true;
      if (t.type === 'income') snap.income += t.amount;
      else {
        const name = t.category?.name ?? 'Miscellaneous';
        snap.expenseByCategory[name] = (snap.expenseByCategory[name] || 0) + t.amount;
      }
    }

    return {
      monthLabel: formatMonthLabel(viewMonth),
      currentExpenseByCategory,
      totals: { income, expense },
      budgetsByCategory,
      recentMonths: Array.from(byMonth.values()),
    };
  }, [transactions, budgets, rangeTransactions, viewMonth]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text };
    const thinking: ChatMessage = { role: 'bot', text: '…thinking' };
    const withThinking = [...messages, userMsg, thinking];
    persist(withThinking);
    setInput('');

    let result;
    try {
      result = handleChatIntent(text, chatData, lastSuggestion);
    } catch {
      result = { reply: `Something went wrong answering that — try rephrasing, or ask about your spending, budgets, or saving tips.` };
    }

    if (result.action?.type === 'setBudget' && user) {
      const category = categoryByName.get(result.action.category);
      if (category) {
        await upsertBudget.mutateAsync({ userId: user.id, categoryId: category.id, month: viewMonth, limitAmount: result.action.amount });
      }
    } else if (result.action?.type === 'applySuggestion' && user) {
      for (const [name, amount] of Object.entries(result.action.suggestion)) {
        const category = categoryByName.get(name);
        if (category) {
          await upsertBudget.mutateAsync({ userId: user.id, categoryId: category.id, month: viewMonth, limitAmount: amount });
        }
      }
    }
    if (result.suggestion !== undefined) setLastSuggestion(result.suggestion);

    const finalMessages = [...withThinking];
    finalMessages[finalMessages.length - 1] = { role: 'bot', text: result.reply };
    persist(finalMessages);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const clearChat = () => persist([]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={[]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <ScreenHeader eyebrow="Talk it through" title="Plan your budget, together" accent="budget" />
              <View style={styles.headRow}>
                <View style={styles.flexShrink}>
                  <ThemedText type="smallBold">BudgetPro assistant</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Ask about your spending, get a suggested budget, or update one right here
                  </ThemedText>
                </View>
                <Pressable onPress={clearChat}>
                  <ThemedText type="small" themeColor="textMuted">
                    Clear chat
                  </ThemedText>
                </Pressable>
              </View>
              {messages.length === 0 ? (
                <ThemedText type="small" themeColor="textMuted" style={styles.emptyHint}>
                  Ask me things like &quot;how am I doing this month?&quot; or &quot;set budget for Rent to 15000&quot;.
                </ThemedText>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.msgRow, item.role === 'user' ? styles.msgRowUser : styles.msgRowBot]}>
              <View
                style={[
                  styles.bubble,
                  item.role === 'user' ? { backgroundColor: theme.primary } : { backgroundColor: theme.backgroundSelected },
                ]}>
                <ThemedText type="small" style={item.role === 'user' ? { color: '#ffffff' } : undefined}>
                  {item.text}
                </ThemedText>
              </View>
            </View>
          )}
        />

        <View style={styles.quickRow}>
          {QUICK_REPLIES.map((q) => (
            <Pressable key={q} onPress={() => send(q)} style={[styles.quickChip, { backgroundColor: theme.primaryLight }]}>
              <ThemedText type="small" style={{ color: theme.primaryDark, fontWeight: '600' }}>
                {q}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputFlex}>
            <Input placeholder="Ask about your budget…" value={input} onChangeText={setInput} onSubmitEditing={() => send(input)} returnKeyType="send" />
          </View>
          <Pressable onPress={() => send(input)} style={[styles.sendBtn, { backgroundColor: theme.primary }]}>
            <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
              Send
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 20, paddingBottom: 12, gap: 10 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 },
  flexShrink: { flexShrink: 1 },
  emptyHint: { textAlign: 'center', paddingVertical: 24 },
  msgRow: { flexDirection: 'row' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowBot: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.md },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingBottom: 10 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  inputRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingBottom: 16 },
  inputFlex: { flex: 1 },
  sendBtn: { height: 48, paddingHorizontal: 18, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
});
