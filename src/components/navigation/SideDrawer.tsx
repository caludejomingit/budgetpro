import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { formatMonthLabel } from '@/lib/format/date';
import { useMonth } from '@/lib/state/MonthContext';

const DRAWER_WIDTH = Math.min(280, Dimensions.get('window').width * 0.8);

const NAV_ITEMS: { name: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { name: 'index', label: 'Dashboard', icon: 'grid' },
  { name: 'budgets', label: 'Budgets', icon: 'credit-card' },
  { name: 'transactions', label: 'Transactions', icon: 'book-open' },
  { name: 'insights', label: 'Insights', icon: 'pie-chart' },
  { name: 'chat', label: 'Budget Chat', icon: 'message-circle' },
  { name: 'profile', label: 'Profile', icon: 'user' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SideDrawer({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { viewMonth, shiftMonth } = useMonth();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, translateX]);

  const go = (name: string) => {
    onClose();
    router.push(`/(tabs)/${name === 'index' ? '' : name}` as never);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <Animated.View
          style={[
            styles.drawer,
            { width: DRAWER_WIDTH, backgroundColor: '#164F3A', paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, transform: [{ translateX }] },
          ]}>
          <View style={styles.brand}>
            <View style={styles.mark}>
              <Feather name="trending-up" size={20} color="#EAF4EE" />
            </View>
            <View>
              <ThemedText type="smallBold" style={styles.brandT1}>
                BudgetPro
              </ThemedText>
              <ThemedText type="tagline" style={styles.brandT2}>
                Plan. Track. Grow.
              </ThemedText>
            </View>
          </View>

          <View style={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <Pressable key={item.name} style={styles.navItem} onPress={() => go(item.name)}>
                <Feather name={item.icon} size={17} color="#CFE4D8" />
                <ThemedText type="smallBold" style={styles.navLabel}>
                  {item.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.spacer} />

          <View style={styles.monthNav}>
            <ThemedText type="small" style={styles.monthLabel}>
              VIEWING
            </ThemedText>
            <View style={styles.monthRow}>
              <Pressable onPress={() => shiftMonth(-1)} style={styles.monthBtn}>
                <Feather name="chevron-left" size={14} color="#EAF4EE" />
              </Pressable>
              <ThemedText type="subtitle" style={styles.monthValue}>
                {formatMonthLabel(viewMonth)}
              </ThemedText>
              <Pressable onPress={() => shiftMonth(1)} style={styles.monthBtn}>
                <Feather name="chevron-right" size={14} color="#EAF4EE" />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => {
              onClose();
              router.push('/transaction/new');
            }}
            style={styles.addBtn}>
            <Feather name="plus" size={16} color="#164F3A" />
            <ThemedText type="smallBold" style={{ color: '#164F3A' }}>
              Add entry
            </ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  overlay: { flex: 1, backgroundColor: 'rgba(20,30,24,0.4)' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, paddingHorizontal: 18, gap: 28 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  mark: { width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  brandT1: { color: '#EAF4EE', fontSize: 15.5 },
  brandT2: { color: '#B9D6C4', fontSize: 12 },
  nav: { gap: 4, marginTop: -8 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  navLabel: { color: '#CFE4D8' },
  spacer: { flex: 1 },
  monthNav: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 14 },
  monthLabel: { color: '#9FC4AF', fontSize: 10.5, fontWeight: '700', letterSpacing: 0.9, marginBottom: 6 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthValue: { color: '#EAF4EE', fontSize: 15 },
  monthBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 12, backgroundColor: '#EAF4EE' },
});
