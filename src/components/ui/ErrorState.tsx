import React from 'react';
import { Text, View } from 'react-native';
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle';
import IconRefresh from '@tabler/icons-react-native/IconRefresh';
import { useTheme } from '../../theme/ThemeProvider';
import Button from './Button';
import Icon from './Icon';

interface Props {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** Inside a card/section: no outer margin. */
  inline?: boolean;
}

/** Inline error with Retry — used per section so one failing request never blanks the screen. */
export default function ErrorState({ message, onRetry, retryLabel = 'Retry', inline }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      accessibilityRole="alert"
      style={{ margin: inline ? 0 : spacing.lg, padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.dangerSoft, gap: spacing.md }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
        <Icon icon={IconAlertTriangle} size={20} color={colors.danger} />
        <Text style={[typography.body, typography.weights.semibold, { color: colors.danger, flex: 1 }]}>{message}</Text>
      </View>
      {onRetry ? <Button title={retryLabel} variant="outline" size="sm" icon={IconRefresh} onPress={onRetry} style={{ alignSelf: 'flex-start' }} /> : null}
    </View>
  );
}
