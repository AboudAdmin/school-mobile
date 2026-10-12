import React from 'react';
import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Icon, { type TablerIcon } from './Icon';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface Props {
  title: string;
  onPress?: () => void;
  /** One primary per view; secondary = soft tint; outline/ghost for low emphasis; danger for destructive confirms. */
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: TablerIcon;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export default function Button({ title, onPress, variant = 'primary', size = 'md', icon, loading, disabled, style, accessibilityHint }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const inactive = disabled || loading;
  const filled = variant === 'primary' || variant === 'danger';
  const bg = { primary: colors.primary, danger: colors.dangerSolid, secondary: colors.primarySoft, outline: 'transparent', ghost: 'transparent' }[variant];
  const pressedBg = { primary: colors.primaryPressed, danger: colors.danger, secondary: colors.primarySoft, outline: colors.primarySoft, ghost: colors.primarySoft }[variant];
  const fg = filled ? colors.onPrimary : colors.link;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      android_ripple={{ color: filled ? 'rgba(255,255,255,0.18)' : colors.primarySoft, borderless: false }}
      style={({ pressed }) => [
        {
          minHeight: size === 'sm' ? 40 : 48,
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.lg,
          borderRadius: radius.md,
          backgroundColor: pressed ? pressedBg : bg,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.link },
        pressed && { transform: [{ scale: 0.98 }] },
        inactive && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} accessibilityLabel={title} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {icon ? <Icon icon={icon} size={size === 'sm' ? 18 : 20} color={fg} /> : null}
          <Text style={[size === 'sm' ? typography.label : { ...typography.body, ...typography.weights.semibold }, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
