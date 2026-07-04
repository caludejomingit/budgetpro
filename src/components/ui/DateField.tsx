import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  value: string; // yyyy-MM-dd
  onChange: (next: string) => void;
  maximumDate?: Date;
  minimumDate?: Date;
}

/**
 * @react-native-community/datetimepicker has no usable web implementation
 * (it renders nothing interactive there), so on web this renders a native
 * HTML date input instead — built with createElement rather than JSX
 * because React Native's JSX.IntrinsicElements doesn't include DOM tags.
 */
export function DateField({ value, onChange, maximumDate, minimumDate }: Props) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webWrap, { backgroundColor: theme.backgroundSelected }]}>
        <Feather name="calendar" size={16} color={theme.text} />
        {createElement('input', {
          type: 'date',
          value,
          max: maximumDate ? format(maximumDate, 'yyyy-MM-dd') : undefined,
          min: minimumDate ? format(minimumDate, 'yyyy-MM-dd') : undefined,
          onChange: (e: { target: { value: string } }) => e.target.value && onChange(e.target.value),
          style: {
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: theme.text,
            fontSize: 15,
            fontFamily: 'PublicSans_400Regular',
            flex: 1,
          },
        })}
      </View>
    );
  }

  return (
    <>
      <Pressable onPress={() => setShowPicker(true)} style={[styles.dateButton, { backgroundColor: theme.backgroundSelected }]}>
        <Feather name="calendar" size={16} color={theme.text} />
        <ThemedText>{format(parseISO(value), 'd MMM yyyy')}</ThemedText>
      </Pressable>
      {showPicker ? (
        <DateTimePicker
          value={parseISO(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(_event, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (date) onChange(format(date, 'yyyy-MM-dd'));
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, borderRadius: Radius.md, paddingHorizontal: 14 },
  webWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 50, borderRadius: Radius.md, paddingHorizontal: 14 },
});
