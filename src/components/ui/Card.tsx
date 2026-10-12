import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export default function Card({ style, ...rest }: ViewProps) {
  const { colors, radius, spacing, elevation } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        elevation.card,
        style,
      ]}
      {...rest}
    />
  );
}
