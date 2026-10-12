import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import type { SubjectStudent } from '../../api/students';

/** "Viewing <child · class>" line for pushed screens opened for someone else's data (a parent's child, or a student staff opened). */
export default function ViewingBar({ me }: { me: Pick<SubjectStudent, 'mode' | 'name' | 'className'> }) {
  const { colors, spacing, typography } = useTheme();
  if (me.mode === 'self' || !me.name) return null;
  return (
    <Text accessibilityRole="header" style={[typography.caption, { color: colors.textMuted, paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
      {tr('Viewing {{name}}', { name: [me.name, me.className].filter(Boolean).join(' · ') })}
    </Text>
  );
}
