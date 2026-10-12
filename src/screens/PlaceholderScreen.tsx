import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { tr } from '../i18n';
import EmptyState from '../components/ui/EmptyState';

/** Empty screen used by the navigation shell until each role's real screens are built (RN-TASK-010+). */
export default function PlaceholderScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
      {/* The header already names the screen (A §9: no duplicate titles) */}
      <EmptyState title={tr('This section is coming soon.')} />
    </View>
  );
}
