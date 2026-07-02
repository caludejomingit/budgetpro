import { Redirect, Tabs } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppTopBar } from '@/components/navigation/AppTopBar';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { FloatingActions } from '@/components/navigation/FloatingActions';
import { SideDrawer } from '@/components/navigation/SideDrawer';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthContext';

export default function TabsLayout() {
  const { session } = useAuth();
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppTopBar onMenuPress={() => setDrawerOpen(true)} />
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="budgets" options={{ title: 'Budgets' }} />
        <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
        <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        <Tabs.Screen name="chat" options={{ title: 'Budget Chat', href: null }} />
      </Tabs>
      <FloatingActions />
      <SideDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}
