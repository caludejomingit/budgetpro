import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirm dialog. RN's Alert.alert with multiple buttons is a
 * no-op on web (react-native-web has no real implementation for it), so any
 * confirm-before-action flow silently does nothing there — this falls back
 * to window.confirm on web and Alert.alert everywhere else.
 */
export function confirmAction(title: string, message: string, confirmLabel: string, onConfirm: () => void, destructive = false): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}
