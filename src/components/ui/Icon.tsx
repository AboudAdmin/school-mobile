import React from 'react';
import { Text, View, type TextStyle } from 'react-native';
import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { isRTL } from '../../i18n';

// Tabler icons (same set as the web's `ti ti-*`), imported one per file: `import IconX from '@tabler/icons-react-native/IconX'`.
export type TablerIcon = ComponentType<SvgProps & { size?: number | string; strokeWidth?: number | string; color?: string }>;

interface Props {
  icon: TablerIcon;
  size?: number;
  color?: string;
  /** Chevrons, arrows, send…: flipped in RTL so they keep pointing "forward". Status icons never set this. */
  directional?: boolean;
  /** Give a label only when the icon carries meaning on its own; otherwise it's hidden from screen readers. */
  accessibilityLabel?: string;
}

export default function Icon({ icon: C, size = 24, color, directional, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
      accessibilityElementsHidden={!accessibilityLabel}
      style={directional && isRTL() ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      <C size={size} color={color ?? colors.text} strokeWidth={1.75} />
    </View>
  );
}

/** Icon + message on one line (e.g. a success/empty confirmation). The text carries the meaning, the icon reinforces it. */
export function IconText({ icon, color, children, textStyle, alert, center }: { icon: TablerIcon; color: string; children: React.ReactNode; textStyle?: TextStyle; /** announce as a status/alert (live region) */ alert?: boolean; center?: boolean }) {
  const { spacing, typography } = useTheme();
  return (
    <View
      accessibilityRole={alert ? 'alert' : undefined}
      accessibilityLiveRegion={alert ? 'polite' : undefined}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: center ? 'center' : undefined }}
    >
      <Icon icon={icon} size={20} color={color} />
      <Text style={[typography.body, { color, flexShrink: 1 }, textStyle]}>{children}</Text>
    </View>
  );
}
