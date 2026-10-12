import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Dashboard scaffold (A §6): an ordered list of blocks (Attention → Today → domain sections → Shortcuts) in a pull-to-refresh scroll.
 * Each block owns its own states (see `Section`), so one failing source never blanks the screen.
 */
export default function DashboardScreen({ blocks, refreshing, onRefresh }: { blocks: { key: string; node: React.ReactNode }[]; refreshing: boolean; onRefresh: () => void }) {
  const { colors, spacing } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
    >
      {blocks.map((b) => (
        <React.Fragment key={b.key}>{b.node}</React.Fragment>
      ))}
    </ScrollView>
  );
}
