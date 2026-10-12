import React, { forwardRef, useState } from 'react';
import { AccessibilityInfo, KeyboardAvoidingView, ScrollView, Text, View, type ScrollViewProps } from 'react-native';
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle';
import { useTheme } from '../../theme/ThemeProvider';
import { tr, trn } from '../../i18n';
import ActionBar from './ActionBar';
import Icon from './Icon';

type Errors<V> = Partial<Record<keyof V, string>>;

/**
 * Form state with the standard validation timing: a field shows its error after its first blur (or pick),
 * then re-validates on every input; a submit reveals every error. Values are never cleared on a failed submit.
 */
export function useForm<V extends Record<string, unknown>>(initial: V, validate: (v: V) => Errors<V>) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<keyof V, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const all = validate(values);
  const errors: Errors<V> = {};
  for (const k in all) if (submitted || touched[k]) errors[k] = all[k];

  const set = <K extends keyof V>(k: K) => (v: V[K]) => setValues((p) => ({ ...p, [k]: v }));
  const touch = (k: keyof V) => () => setTouched((p) => (p[k] ? p : { ...p, [k]: true }));

  return {
    values,
    errors,
    set,
    /** Props for TextField-like inputs. */
    text: <K extends keyof V>(k: K) => ({ value: values[k] as string, onChangeText: set(k) as (v: string) => void, onBlur: touch(k), error: errors[k] }),
    /** Props for typed inputs with a value/onChange API (NumberField, MoneyField). */
    input: <K extends keyof V>(k: K) => ({ value: values[k], onChange: set(k), onBlur: touch(k), error: errors[k] }),
    /** Props for pickers (Select, DatePickerField, …): picking counts as leaving the field. */
    pick: <K extends keyof V>(k: K) => ({ value: values[k], onChange: (v: V[K]) => (set(k)(v), touch(k)()), error: errors[k] }),
    /** Errors to list in <ErrorSummary> — only after a submit attempt, and live while the user fixes them. */
    summary: submitted ? (Object.entries(all).filter(([, m]) => m) as [keyof V & string, string][]) : [],
    /** Runs onValid when there are no errors; otherwise reveals all errors, announces the count and returns false. */
    submit: (onValid: (v: V) => void) => {
      setSubmitted(true);
      const n = Object.values(all).filter(Boolean).length;
      if (n === 0) return onValid(values), true;
      AccessibilityInfo.announceForAccessibility(trn('{{count}} field needs attention', n));
      return false;
    },
    reset: () => (setValues(initial), setTouched({}), setSubmitted(false)),
  };
}

/** Error summary shown at the top of a form after a failed submit. `labels` maps field keys to their visible labels. */
export function ErrorSummary({ items, labels }: { items: [string, string][]; labels: Record<string, string> }) {
  const { colors, spacing, radius, typography } = useTheme();
  if (items.length === 0) return null;
  return (
    <View
      accessibilityRole="alert"
      style={{ backgroundColor: colors.dangerSoft, borderRadius: radius.md, borderStartWidth: 4, borderStartColor: colors.danger, padding: spacing.md, gap: spacing.xs, marginBottom: spacing.lg }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon icon={IconAlertTriangle} size={18} color={colors.danger} />
        <Text accessibilityRole="header" style={[typography.label, { color: colors.danger, flexShrink: 1 }]}>
          {trn('{{count}} field needs attention', items.length)}
        </Text>
      </View>
      {items.map(([k, msg]) => (
        <Text key={k} style={[typography.caption, { color: colors.text }]}>
          • {labels[k] ?? k}: {msg}
        </Text>
      ))}
    </View>
  );
}

/** Scrollable form body that keeps the focused field above the keyboard. `actions` (the submit Button) is pinned below it in an ActionBar. */
export const FormScroll = forwardRef<ScrollView, ScrollViewProps & { keyboardOffset?: number; actions?: React.ReactNode }>(function FormScroll({ keyboardOffset = 0, actions, contentContainerStyle, ...rest }, ref) {
  const { spacing } = useTheme();
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={keyboardOffset}>
      <ScrollView ref={ref} keyboardShouldPersistTaps="handled" contentContainerStyle={[{ padding: spacing.lg, paddingBottom: spacing.xxxl }, contentContainerStyle]} {...rest} />
      {actions ? <ActionBar>{actions}</ActionBar> : null}
    </KeyboardAvoidingView>
  );
});
