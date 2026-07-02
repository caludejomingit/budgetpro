import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const displayName = (user?.user_metadata?.display_name as string | undefined) || user?.email?.split('@')[0] || 'User';

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.profile}>
          <Avatar name={displayName} size={72} />
          <ThemedText type="title" style={styles.name}>
            {displayName}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{user?.email}</ThemedText>
        </View>

        <Card style={styles.infoCard}>
          <ThemedText type="small" themeColor="textSecondary">
            Currency
          </ThemedText>
          <ThemedText type="smallBold">Indian Rupee (₹)</ThemedText>
        </Card>

        <Button label="Log out" variant="secondary" onPress={signOut} />

        <ThemedText type="small" themeColor="textMuted" style={styles.version}>
          Version {Constants.expoConfig?.version ?? '1.0.0'}
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, padding: 20, gap: 20 },
  profile: { alignItems: 'center', gap: 8, marginVertical: 24 },
  name: { fontSize: 22 },
  infoCard: { gap: 4 },
  version: { textAlign: 'center', marginTop: 'auto' },
});
