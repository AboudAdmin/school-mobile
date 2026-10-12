import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import Card from './Card';
import ErrorState from './ErrorState';
import Skeleton from './Skeleton';

interface Props {
  title: string;
  hint?: string;
  /** Optional header link (e.g. "See all"). */
  action?: { label: string; onPress: () => void };
  /** The section's own query: it shows its own spinner / error + Retry, so one failing endpoint never blanks the screen. */
  state?: { isPending: boolean; isError: boolean; refetch: () => unknown };
  /** `plain`: header + content directly on the page, no card (use inside a screen that already groups content). */
  variant?: 'card' | 'plain';
  children?: React.ReactNode;
}

export default function Section({ title, hint, action, state, variant = 'card', children }: Props) {
  const { colors, spacing, typography } = useTheme();
  const Wrap = variant === 'plain' ? View : Card;
  return (
    <Wrap style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
            {title}
          </Text>
          {hint ? <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{hint}</Text> : null}
        </View>
        {action ? (
          <Pressable accessibilityRole="link" onPress={action.onPress} hitSlop={12}>
            <Text style={[typography.label, { color: colors.link }]}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
      {state?.isPending ? (
        <View accessible accessibilityRole="progressbar" accessibilityState={{ busy: true }} accessibilityLabel={tr('Loading…')} style={{ gap: spacing.md, paddingVertical: spacing.sm }}>
          <Skeleton height={14} />
          <Skeleton width="80%" height={14} />
          <Skeleton width="55%" height={14} />
        </View>
      ) : state?.isError ? (
        <ErrorState inline message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={() => state.refetch()} />
      ) : (
        children
      )}
    </Wrap>
  );
}
