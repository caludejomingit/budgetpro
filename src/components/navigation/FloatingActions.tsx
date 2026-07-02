import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

const TAB_BAR_HEIGHT = 64;

export function FloatingActions() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const base = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <>
      <Pressable
        onPress={() => router.push('/(tabs)/chat' as never)}
        style={[styles.btn, { bottom: base + 88, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.primary }]}>
        <Feather name="message-circle" size={22} color="#ffffff" />
      </Pressable>
      <Pressable
        onPress={() => router.push('/transaction/new')}
        style={[styles.btn, { bottom: base + 12, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.primary }]}>
        <Feather name="plus" size={24} color="#ffffff" />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
