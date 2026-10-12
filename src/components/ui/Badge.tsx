import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Icon, { type TablerIcon } from './Icon';

export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** Status pill. Always carries a text label so colour is never the only signal. */
export default function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: Tone; icon?: TablerIcon }) {
  const { colors, radius, spacing, typography } = useTheme();
  const [fg, bg] = {
    primary: [colors.link, colors.primarySoft],
    success: [colors.success, colors.successSoft],
    warning: [colors.warning, colors.warningSoft],
    danger: [colors.danger, colors.dangerSoft],
    info: [colors.info, colors.infoSoft],
    neutral: [colors.textMuted, colors.surfaceAlt],
  }[tone];
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: bg,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
      }}
    >
      {icon ? <Icon icon={icon} size={14} color={fg} /> : null}
      <Text style={[typography.caption, typography.weights.semibold, { color: fg }]}>{label}</Text>
    </View>
  );
}
