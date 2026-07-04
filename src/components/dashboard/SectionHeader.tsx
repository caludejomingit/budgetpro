import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ icon, title, subtitle }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: theme.primaryLight }]}>
        <Feather name={icon} size={14} color={theme.primary} />
      </View>
      <View style={styles.textWrap}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1, gap: 1 },
});
