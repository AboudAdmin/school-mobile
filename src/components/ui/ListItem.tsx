import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight';
import Icon from './Icon';
import Num from './Num';

export { default as Avatar } from './Avatar';

interface Props {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Right-aligned figure (amount, score), LTR-isolated; `meta` is its muted line (date, status). Use for money/score rows only. */
  value?: string;
  meta?: string;
  onPress?: () => void;
  /** Hide the divider on the last row of a group. */
  last?: boolean;
}

/** One row: optional leading (avatar/icon), title + subtitle, optional trailing (badge/amount), chevron when tappable. */
export default function ListItem({ title, subtitle, leading, trailing, value, meta, onPress, last }: Props) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      android_ripple={onPress ? { color: colors.primarySoft } : undefined}
      style={({ pressed }) => ({ backgroundColor: pressed ? colors.surfaceAlt : colors.surface })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: subtitle || meta ? 64 : 52 }}>
        {leading}
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[typography.body, typography.weights.semibold, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {value || meta ? (
          <View style={{ alignItems: 'flex-end', maxWidth: '40%' }}>
            {value ? (
              <Text numberOfLines={1} style={[typography.body, typography.weights.semibold, { color: colors.text }]}>
                <Num>{value}</Num>
              </Text>
            ) : null}
            {meta ? (
              <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                {meta}
              </Text>
            ) : null}
          </View>
        ) : null}
        {trailing}
        {onPress ? <Icon icon={IconChevronRight} size={20} color={colors.textMuted} directional /> : null}
      </View>
      {/* inset divider: starts under the text, like native lists */}
      {last ? null : <View style={{ height: 1, backgroundColor: colors.border, marginStart: leading ? spacing.lg + 40 + spacing.md : spacing.lg }} />}
    </Pressable>
  );
}
