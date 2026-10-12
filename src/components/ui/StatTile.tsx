import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { Tone } from './Badge';
import Icon, { type TablerIcon } from './Icon';
import Num from './Num';
import ProgressBar from './ProgressBar';

interface Props {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
  icon?: TablerIcon;
  /** 0–100: draws a progress bar under the value (rates). */
  progress?: number;
  /** Trend chip next to the value (e.g. a Badge with "+4%"). */
  delta?: React.ReactNode;
  onPress?: () => void;
}

/** Key figure with a plain-language label and hint (same role as the web uxBlocks StatTile). */
export default function StatTile({ label, value, hint, tone = 'neutral', icon, progress, delta, onPress }: Props) {
  const { colors, spacing, radius, typography, elevation } = useTheme();
  const accent = { primary: colors.link, success: colors.success, warning: colors.warning, danger: colors.danger, info: colors.info, neutral: colors.text }[tone];
  const soft = { primary: colors.primarySoft, success: colors.successSoft, warning: colors.warningSoft, danger: colors.dangerSoft, info: colors.infoSoft, neutral: colors.surfaceAlt }[tone];
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value}${hint ? `, ${hint}` : ''}`}
      onPress={onPress}
      android_ripple={onPress ? { color: colors.primarySoft } : undefined}
      style={({ pressed }) => [
        {
          flexGrow: 1,
          flexBasis: '45%',
          padding: spacing.lg,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
          gap: spacing.xs,
          overflow: 'hidden',
        },
        elevation.card,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {icon ? (
          <View style={{ width: 32, height: 32, borderRadius: radius.sm, backgroundColor: soft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={icon} size={18} color={accent} />
          </View>
        ) : null}
        <Text style={[typography.caption, typography.weights.medium, { color: colors.textMuted, flex: 1 }]}>{label}</Text>
      </View>
      {/* the value stays in the text colour: tone lives on the icon chip and the progress bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Text style={[typography.title, { color: colors.text, flexShrink: 1 }]} numberOfLines={1} adjustsFontSizeToFit>
          <Num>{value}</Num>
        </Text>
        {delta}
      </View>
      {progress !== undefined ? <ProgressBar value={progress} tone={tone} label={label} /> : null}
      {hint ? <Text style={[typography.caption, { color: colors.textMuted }]}>{hint}</Text> : null}
    </Pressable>
  );
}
