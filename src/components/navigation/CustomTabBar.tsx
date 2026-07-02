import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const LEFT_ROUTES = ['index', 'budgets'];
const RIGHT_ROUTES = ['transactions', 'insights', 'chat'];

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'grid',
  budgets: 'credit-card',
  transactions: 'book-open',
  insights: 'pie-chart',
  chat: 'message-circle',
};

const LABELS: Record<string, string> = {
  index: 'Home',
  budgets: 'Budgets',
  transactions: 'Entries',
  insights: 'Insights',
  chat: 'Chat',
};

interface TabRoute {
  key: string;
  name: string;
}
interface CustomTabBarProps {
  state: { routes: TabRoute[]; index: number };
  navigation: { navigate: (name: string) => void };
}

function TabButton({ route, active, onPress }: { route: TabRoute; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  const color = active ? theme.primary : theme.textMuted;
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Feather name={ICONS[route.name] ?? 'circle'} size={20} color={color} />
      <ThemedText type="small" style={[styles.label, { color }]}>
        {LABELS[route.name] ?? route.name}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const byName = (name: string) => state.routes.find((r) => r.name === name);
  const activeName = state.routes[state.index]?.name;

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: theme.backgroundElement, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 8) },
      ]}>
      <View style={styles.group}>
        {LEFT_ROUTES.map((name) => {
          const route = byName(name);
          if (!route) return null;
          return <TabButton key={route.key} route={route} active={activeName === name} onPress={() => navigation.navigate(name)} />;
        })}
      </View>

      <Pressable onPress={() => router.push('/transaction/new')} style={[styles.fab, { backgroundColor: theme.primary, borderColor: theme.background }]}>
        <Feather name="plus" size={23} color="#ffffff" />
      </Pressable>

      <View style={styles.group}>
        {RIGHT_ROUTES.map((name) => {
          const route = byName(name);
          if (!route) return null;
          return <TabButton key={route.key} route={route} active={activeName === name} onPress={() => navigation.navigate(name)} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  group: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  item: { alignItems: 'center', gap: 3, paddingVertical: 4, paddingHorizontal: 2, minWidth: 56 },
  label: { fontSize: 10 },
  fab: {
    position: 'absolute',
    left: '50%',
    top: -24,
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E6B4E',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
