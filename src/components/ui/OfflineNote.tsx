import React from 'react';
import { Text } from 'react-native';
import { useOnline } from '../../api/network';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';

/** Why a submit button is disabled while offline. Pair with `disabled={!useOnline()}` on the button. */
export default function OfflineNote() {
  const online = useOnline();
  const { colors, typography } = useTheme();
  if (online) return null;
  return <Text accessibilityRole="alert" style={[typography.caption, { color: colors.warning, textAlign: 'center' }]}>{tr('You are offline. Reconnect to save changes.')}</Text>;
}
