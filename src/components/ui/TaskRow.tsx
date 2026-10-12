import React from 'react';
import { Pressable, Text, View } from 'react-native';
import IconBook from '@tabler/icons-react-native/IconBook';
import IconClock from '@tabler/icons-react-native/IconClock';
import { useTheme } from '../../theme/ThemeProvider';
import { loc, tr } from '../../i18n';
import Badge, { type Tone } from './Badge';
import Icon from './Icon';

interface Props {
  title: string;
  /** Subject + class line. */
  subtitle?: string;
  /** ISO date the work is due. */
  dueDate: string;
  status: { label: string; tone: Tone };
  /** Past or imminent deadlines are emphasised only while the work is still open (`open`). */
  open?: boolean;
  onPress?: () => void;
}

const DAY = 24 * 60 * 60 * 1000;

/** Homework / exam row: subject icon, title, deadline with emphasis (overdue, within a day), status badge. */
export default function TaskRow({ title, subtitle, dueDate, status, open = true, onPress }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const due = new Date(dueDate);
  const daysLeft = Math.ceil((due.getTime() - Date.now()) / DAY);
  const tone: 'danger' | 'warning' | 'muted' = !open ? 'muted' : daysLeft < 0 ? 'danger' : daysLeft <= 1 ? 'warning' : 'muted';
  const dueColor = { danger: colors.danger, warning: colors.warning, muted: colors.textMuted }[tone];
  const dueText = `${tr('Due')} ${due.toLocaleDateString(loc(), { day: 'numeric', month: 'short' })}`;
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={[title, subtitle, dueText, status.label].filter(Boolean).join(', ')}
      onPress={onPress}
      android_ripple={onPress ? { color: colors.primarySoft } : undefined}
      style={({ pressed }) => ({ backgroundColor: pressed ? colors.surfaceAlt : colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
        <View style={{ width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon icon={IconBook} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text style={[typography.body, typography.weights.semibold, { color: colors.text }]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Icon icon={IconClock} size={14} color={dueColor} />
            <Text style={[typography.caption, tone !== 'muted' ? typography.weights.semibold : null, { color: dueColor }]}>{dueText}</Text>
          </View>
        </View>
        <Badge label={status.label} tone={status.tone} />
      </View>
    </Pressable>
  );
}
