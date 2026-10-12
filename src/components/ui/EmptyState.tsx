import React from 'react';
import { Text, View } from 'react-native';
import IconInbox from '@tabler/icons-react-native/IconInbox';
import { useTheme } from '../../theme/ThemeProvider';
import Button from './Button';
import Icon, { type TablerIcon } from './Icon';

interface Props {
  title: string;
  message?: string;
  icon?: TablerIcon;
  actionLabel?: string;
  onAction?: () => void;
}

/** Says what is empty and, when possible, what to do next. */
export default function EmptyState({ title, message, icon = IconInbox, actionLabel, onAction }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, gap: spacing.sm }}>
      <View style={{ width: 64, height: 64, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs }}>
        <Icon icon={icon} size={30} color={colors.link} />
      </View>
      <Text accessibilityRole="header" style={[typography.heading, { color: colors.text, textAlign: 'center' }]}>
        {title}
      </Text>
      {message ? <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center', maxWidth: 360 }]}>{message}</Text> : null}
      {actionLabel && onAction ? <Button title={actionLabel} variant="secondary" onPress={onAction} style={{ marginTop: spacing.sm }} /> : null}
    </View>
  );
}
