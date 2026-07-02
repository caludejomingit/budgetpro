import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const ROUTES = ['index', 'budgets', 'transactions', 'insights', 'profile'];

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'grid',
  budgets: 'credit-card',
  transactions: 'book-open',
  insights: 'pie-chart',
  profile: 'user',
};

const LABELS: Record<string, string> = {
  index: 'Home',
  budgets: 'Budgets',
  transactions: 'Entries',
  insights: 'Insights',
  profile: 'Profile',
};

interface TabRoute {
  key: string;
  name: string;
}
interface CustomTabBarProps {
  state: { routes: TabRoute[]; index: number };
  navigation: { navigate: (name: string) => void };
}

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: theme.backgroundElement, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 8) },
      ]}>
      {ROUTES.map((name) => {
        const route = state.routes.find((r) => r.name === name);
        if (!route) return null;
        const active = activeName === name;
        const color = active ? theme.primary : theme.textMuted;
        return (
          <Pressable key={route.key} style={styles.item} onPress={() => navigation.navigate(name)}>
            <Feather name={ICONS[name]} size={20} color={color} />
            <ThemedText type="small" style={[styles.label, { color }]}>
              {LABELS[name]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  label: { fontSize: 10 },
});
