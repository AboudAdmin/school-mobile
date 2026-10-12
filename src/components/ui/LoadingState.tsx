import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import Skeleton from './Skeleton';

/** List-shaped skeleton while a screen/section loads (avatar + two text lines per row). */
export default function LoadingState({ rows = 4 }: { rows?: number }) {
  const { spacing } = useTheme();
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={tr('Loading…')} style={{ padding: spacing.lg, gap: spacing.lg }}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Skeleton width={40} height={40} round />
          <View style={{ flex: 1, gap: spacing.sm }}>
            <Skeleton width="60%" height={12} />
            <Skeleton width="35%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}
