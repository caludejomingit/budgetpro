import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { CategoryGlyph } from '@/components/ui/CategoryGlyph';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Category } from '@/types/database';

interface Props {
  visible: boolean;
  categories: Category[];
  limitByCategoryId: Map<string, number>;
  saving: boolean;
  onClose: () => void;
  onSave: (values: Map<string, number>) => void;
}

export function EditBudgetsModal({ visible, categories, limitByCategoryId, saving, onClose, onSave }: Props) {
  const theme = useTheme();
  const [drafts, setDrafts] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (visible) {
      setDrafts(new Map(categories.map((c) => [c.id, String(limitByCategoryId.get(c.id) ?? 0)])));
    }
  }, [visible, categories, limitByCategoryId]);

  const setDraft = (id: string, value: string) => {
    setDrafts((prev) => new Map(prev).set(id, value));
  };

  const save = () => {
    const values = new Map<string, number>();
    for (const [id, v] of drafts) {
      const n = Number(v) || 0;
      if (n > 0) values.set(id, n);
    }
    onSave(values);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.sheet, { backgroundColor: theme.backgroundElement }]} edges={['bottom']}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Set monthly budgets</ThemedText>
          </View>
          <ScrollView contentContainerStyle={styles.list}>
            {categories.map((c) => (
              <View key={c.id} style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: theme.backgroundSelected }]}>
                  <CategoryGlyph name={c.name} size={15} color={theme.primaryDark} />
                </View>
                <ThemedText type="small" style={styles.name} numberOfLines={1}>
                  {c.name}
                </ThemedText>
                <TextInput
                  keyboardType="numeric"
                  value={drafts.get(c.id) ?? '0'}
                  onChangeText={(v) => setDraft(c.id, v)}
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundSelected }]}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.actions}>
            <View style={styles.actionFlex}>
              <Button label="Cancel" variant="secondary" onPress={onClose} />
            </View>
            <View style={styles.actionFlex}>
              <Button label="Save budgets" onPress={save} loading={saving} />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(20,30,24,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, maxHeight: '88%', paddingTop: 20 },
  header: { paddingHorizontal: 22, marginBottom: 12 },
  list: { paddingHorizontal: 22, gap: 12, paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 30, height: 30, borderRadius: Radius.sm - 1, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontWeight: '600' },
  input: {
    width: 108,
    borderWidth: 1,
    borderRadius: Radius.sm - 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontFamily: 'IBMPlexMono_600SemiBold',
    fontSize: 16,
    textAlign: 'right',
  },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 18 },
  actionFlex: { flex: 1 },
});
