import React from 'react';
import { Pressable, Text, View } from 'react-native';
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight';
import { useTheme } from '../../theme/ThemeProvider';
import Button from './Button';
import Icon from './Icon';
import Num from './Num';
import ProgressBar from './ProgressBar';

interface Props {
  title: string;
  subtitle?: string;
  /** Hero amount under the title (money, score), LTR-isolated. */
  figure?: string;
  /** Progress under the meta (e.g. paid share of an invoice); `label` is what a screen reader hears. */
  progress?: { value: number; label: string };
  /** Card footer action (e.g. "Record payment"). */
  footer?: { label: string; onPress: () => void };
  /** Key columns of the web table row, shown as label/value pairs (2–4). */
  meta?: { label: string; value: string }[];
  leading?: React.ReactNode;
  /** Status badge or amount. */
  trailing?: React.ReactNode;
  onPress?: () => void;
}

/** Web table row → mobile card (docs/MOBILE_MASTER_PLAN.md §3.8): primary column as title, key columns as meta, status trailing. */
export default function DataCard({ title, subtitle, figure, progress, footer, meta = [], leading, trailing, onPress }: Props) {
  const { colors, spacing, radius, typography, elevation } = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      android_ripple={onPress ? { color: colors.primarySoft } : undefined}
      style={({ pressed }) => [
        { padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: pressed ? colors.surfaceAlt : colors.surface, overflow: 'hidden' },
        elevation.card,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {leading}
        <View style={{ flex: 1 }}>
          <Text style={[typography.body, typography.weights.semibold, { color: colors.text }]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
        {trailing}
        {onPress ? <Icon icon={IconChevronRight} size={20} color={colors.textMuted} directional /> : null}
      </View>
      {figure ? (
        <Text style={[typography.title, { color: colors.text }]}>
          <Num>{figure}</Num>
        </Text>
      ) : null}
      {meta.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm, columnGap: spacing.lg }}>
          {meta.map((m) => (
            <View key={m.label} style={{ minWidth: '40%', flexGrow: 1 }}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>{m.label}</Text>
              <Text style={[typography.label, typography.numeric, { color: colors.text }]}>{m.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {progress ? <ProgressBar value={progress.value} tone="success" label={progress.label} /> : null}
      {footer ? <Button title={footer.label} variant="secondary" size="sm" onPress={footer.onPress} /> : null}
    </Pressable>
  );
}
