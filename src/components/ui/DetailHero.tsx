import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Card from './Card';
import Num from './Num';
import ProgressBar from './ProgressBar';

interface Props {
  title: string;
  subtitle?: string;
  /** Status badge(s). */
  badge?: React.ReactNode;
  /** The key figure of the record (e.g. the balance), with its label above. Omit for records without one (people, requests). */
  figure?: { label: string; value: string };
  progress?: { value: number; label: string; caption?: string };
}

/** Detail header: identity + status, then the one figure that matters, with its progress (UX P2: never "value as title"). */
export default function DetailHero({ title, subtitle, badge, figure, progress }: Props) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle ? <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{subtitle}</Text> : null}
        </View>
        {badge}
      </View>
      {figure ? (
        <View accessible accessibilityLabel={`${figure.label}: ${figure.value}`}>
          <Text style={[typography.overline, { color: colors.textMuted }]}>{figure.label}</Text>
          <Text style={[typography.displayNumeric, { color: colors.text }]}>
            <Num>{figure.value}</Num>
          </Text>
        </View>
      ) : null}
      {progress ? (
        <View style={{ gap: spacing.xs }}>
          <ProgressBar value={progress.value} tone="success" label={progress.label} />
          {progress.caption ? <Text style={[typography.caption, { color: colors.textMuted }]}>{progress.caption}</Text> : null}
        </View>
      ) : null}
    </Card>
  );
}
