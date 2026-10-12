import React from 'react';
import { Pressable, Text, View } from 'react-native';
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle';
import IconInfoCircle from '@tabler/icons-react-native/IconInfoCircle';
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import Icon, { IconText } from './Icon';

export interface Attention {
  tone: 'danger' | 'warning' | 'info';
  text: string;
  onPress?: () => void;
}

/**
 * "Needs attention" list (web dashboard rule): one row per real exception with its next step,
 * or a single "nothing needs attention" line. Callers must not render the empty line while a source failed to load.
 */
export default function AttentionStrip({ items, emptyText = tr('Nothing needs attention right now.') }: { items: Attention[]; emptyText?: string }) {
  const { colors, spacing, radius, typography } = useTheme();
  if (!items.length) return <IconText icon={IconCircleCheck} color={colors.success}>{emptyText}</IconText>;
  return (
    <View style={{ gap: spacing.sm }}>
      {items.map((a) => {
        const fg = colors[a.tone];
        const bg = colors[`${a.tone}Soft`];
        return (
          <Pressable
            key={a.text}
            disabled={!a.onPress}
            accessibilityRole={a.onPress ? 'button' : 'text'}
            accessibilityLabel={`${a.tone === 'danger' ? tr('Urgent') : tr('Check')}: ${a.text}`}
            onPress={a.onPress}
            android_ripple={a.onPress ? { color: colors.primarySoft } : undefined}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: bg,
              opacity: pressed ? 0.85 : 1,
              overflow: 'hidden',
            })}
          >
            <Icon icon={a.tone === 'info' ? IconInfoCircle : IconAlertTriangle} size={20} color={fg} />
            <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{a.text}</Text>
            {a.onPress ? <Icon icon={IconChevronRight} size={20} color={fg} directional /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
