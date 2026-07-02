import { Redirect, Tabs } from 'expo-router';
import { View } from 'react-native';

import { AppTopBar } from '@/components/navigation/AppTopBar';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthContext';

export default function TabsLayout() {
  const { session } = useAuth();
  const theme = useTheme();

  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppTopBar />
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="budgets" options={{ title: 'Budgets' }} />
        <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
        <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
        <Tabs.Screen name="chat" options={{ title: 'Budget Chat' }} />
      </Tabs>
    </View>
  );
}
