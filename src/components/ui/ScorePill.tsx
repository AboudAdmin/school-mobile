import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Score with semantic colour, same rule as the web (docs/DESIGN_SYSTEM.md): success ≥ 75 %, warning ≥ 50 %, danger below.
 * The number is always shown, so colour is never the only signal. Default scale /20 (Tunisian grades).
 */
export default function ScorePill({ score, max = 20, label }: { score: number | null | undefined; max?: number; label?: string }) {
  const { colors, radius, spacing, typography } = useTheme();
  const ratio = score == null ? null : score / max;
  const [fg, bg] = ratio == null ? [colors.textMuted, colors.surfaceAlt] : ratio >= 0.75 ? [colors.success, colors.successSoft] : ratio >= 0.5 ? [colors.warning, colors.warningSoft] : [colors.danger, colors.dangerSoft];
  const text = score == null ? '—' : `${Number.isInteger(score) ? score : score.toFixed(2)}/${max}`;
  return (
    <View
      accessible
      accessibilityLabel={`${label ? `${label}: ` : ''}${text}`}
      style={{ alignSelf: 'flex-start', minWidth: 56, alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: bg }}
    >
      <Text style={[typography.label, typography.numeric, { color: fg }]}>{text}</Text>
    </View>
  );
}
