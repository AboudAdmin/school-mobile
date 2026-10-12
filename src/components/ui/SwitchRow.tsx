import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/** On/off setting: the whole row toggles and is announced as one switch. */
export default function SwitchRow({ label, description, value, onChange, disabled }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56, marginBottom: spacing.md, opacity: disabled ? 0.5 : 1 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { color: colors.text }]}>{label}</Text>
        {description ? <Text style={[typography.caption, { color: colors.textMuted }]}>{description}</Text> : null}
      </View>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Switch
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{ true: colors.primary, false: colors.borderStrong }}
          thumbColor={colors.surface}
        />
      </View>
    </Pressable>
  );
}
