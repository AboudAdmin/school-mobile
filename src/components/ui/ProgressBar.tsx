import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { Tone } from './Badge';

/** Determinate progress (0–100). Exposes its value to screen readers. */
export default function ProgressBar({ value, tone = 'primary', label, height = 6 }: { value: number; tone?: Tone; label?: string; height?: number }) {
  const { colors, radius } = useTheme();
  const v = Math.min(100, Math.max(0, value));
  const fill = { primary: colors.primary, success: colors.successSolid, warning: colors.warningSolid, danger: colors.dangerSolid, info: colors.infoSolid, neutral: colors.textMuted }[tone];
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v) }}
      style={{ height, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' }}
    >
      <View style={{ height, width: `${v}%`, borderRadius: radius.pill, backgroundColor: fill }} />
    </View>
  );
}
