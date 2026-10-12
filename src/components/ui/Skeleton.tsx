import React, { useEffect, useRef } from 'react';
import { Animated, type DimensionValue } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../theme/motion';

/** Placeholder block shown while content loads. Pulses gently; static when the OS asks to reduce motion. */
export default function Skeleton({ width = '100%', height = 12, round }: { width?: DimensionValue; height?: number; round?: boolean }) {
  const { colors, radius } = useTheme();
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, opacity]);

  return (
    <Animated.View
      importantForAccessibility="no-hide-descendants"
      style={{ width, height, opacity, borderRadius: round ? radius.pill : radius.sm, backgroundColor: colors.border }}
    />
  );
}
