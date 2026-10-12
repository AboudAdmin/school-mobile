import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { isRTL, tr } from '../../i18n';
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle';
import Icon from './Icon';

export interface FieldProps {
  label?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  /** Marks the field "(optional)" — use on the minority side of a form (see Form.tsx). */
  optional?: boolean;
}

/** Label above, inline error/hint below — shared by TextField, Select and DatePickerField. */
export function FieldFrame({ label, error, hint, required, optional, children }: FieldProps & { children: React.ReactNode }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {label ? (
        <Text style={[typography.label, { color: colors.text, marginBottom: spacing.xs }]}>
          {label}
          {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
          {optional ? <Text style={[typography.weights.regular, { color: colors.textMuted }]}> ({tr('optional')})</Text> : null}
        </Text>
      ) : null}
      {children}
      {error ? (
        <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
          <Icon icon={IconAlertCircle} size={14} color={colors.danger} />
          <Text style={[typography.caption, typography.weights.medium, { color: colors.danger, flexShrink: 1 }]}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

/** Field box (border/background/focus/error); text styling is applied by each field. */
export function useFieldStyle(error?: string | null, focused?: boolean): ViewStyle {
  const { colors, radius, spacing } = useTheme();
  return {
    ...styles.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    // focus/error get a 2-dp ring: visible state without relying on colour alone
    borderWidth: focused || error ? 2 : 1,
    borderColor: error ? colors.danger : focused ? colors.primary : colors.borderStrong,
  };
}

export default function TextField({ label, error, hint, required, optional, onFocus, onBlur, style, trailing, ...rest }: FieldProps & TextInputProps & { /** Inline action inside the field box (e.g. show/hide password) */ trailing?: React.ReactNode }) {
  const { colors, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const fieldStyle = useFieldStyle(error, focused);
  const input = (
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[trailing ? { flex: 1, paddingVertical: spacing.sm } : fieldStyle, typography.input, { color: colors.text, textAlign: isRTL() ? 'right' : 'left' }, style]}
        {...rest}
      />
  );
  return (
    <FieldFrame label={label} error={error} hint={hint} required={required} optional={optional}>
      {trailing ? (
        // the box styles move to a row so the action stays vertically centred at any font size
        <View style={[fieldStyle, { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }]}>
          {input}
          {trailing}
        </View>
      ) : (
        input
      )}
    </FieldFrame>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 48 },
});

/** Phone number: phone keypad and autofill; kept left-to-right so "+216 …" reads correctly in Arabic. */
export function PhoneField(props: FieldProps & TextInputProps) {
  return <TextField keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" {...props} />;
}
