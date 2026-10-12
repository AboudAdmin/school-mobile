import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight';
import Icon from './Icon';
import Num from './Num';

interface Props {
  /** Start time, e.g. "08:30": the row is led by it. */
  time: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
}

/** Time-led row for a class session or any dated event (Web: session / timetable row). */
export default function EventRow({ time, title, subtitle, trailing, onPress, last }: Props) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${time}, ${title}${subtitle ? `, ${subtitle}` : ''}`}
      onPress={onPress}
      android_ripple={onPress ? { color: colors.primarySoft } : undefined}
      style={({ pressed }) => ({ backgroundColor: pressed ? colors.surfaceAlt : 'transparent' })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, minHeight: 56 }}>
        <Text style={[typography.label, { color: colors.textMuted, minWidth: 48 }]}>
          <Num>{time}</Num>
        </Text>
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
        {trailing}
        {onPress ? <Icon icon={IconChevronRight} size={20} color={colors.textMuted} directional /> : null}
      </View>
      {last ? null : <View style={{ height: 1, backgroundColor: colors.border }} />}
    </Pressable>
  );
}
