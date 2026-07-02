import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface AuthShellProps {
  mode: 'login' | 'signup';
  children: React.ReactNode;
}

export function AuthShell({ mode, children }: AuthShellProps) {
  const theme = useTheme();

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.shell, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border, ...Shadow }]}>
          <View style={styles.brand}>
            <View style={[styles.mark, { backgroundColor: theme.primaryDark }]}>
              <Feather name="trending-up" size={26} color="#ffffff" />
            </View>
            <ThemedText type="subtitle">BudgetPro</ThemedText>
            <ThemedText type="tagline" themeColor="textMuted">
              Plan. Track. Grow.
            </ThemedText>
          </View>

          <View style={[styles.tabs, { backgroundColor: theme.backgroundSelected }]}>
            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              style={[styles.tab, mode === 'login' && { backgroundColor: theme.primary }]}>
              <ThemedText type="smallBold" style={{ color: mode === 'login' ? '#ffffff' : theme.textMuted }}>
                Log in
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.replace('/(auth)/signup')}
              style={[styles.tab, mode === 'signup' && { backgroundColor: theme.primary }]}>
              <ThemedText type="smallBold" style={{ color: mode === 'signup' ? '#ffffff' : theme.textMuted }}>
                Create account
              </ThemedText>
            </Pressable>
          </View>

          {children}

          <ThemedText type="small" themeColor="textMuted" style={styles.footer}>
            Your data is private to your account and stored securely in your own Supabase project.
          </ThemedText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shell: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, borderRadius: Radius.lg, borderWidth: 1, padding: 28 },
  brand: { alignItems: 'center', gap: 6, marginBottom: 24 },
  mark: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  tabs: { flexDirection: 'row', borderRadius: Radius.sm + 1, padding: 4, marginBottom: 20, gap: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Radius.sm - 1, alignItems: 'center' },
  footer: { textAlign: 'center', marginTop: 20, lineHeight: 16 },
});
