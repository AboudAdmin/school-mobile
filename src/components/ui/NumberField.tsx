import React, { useEffect, useState } from 'react';
import { Text, type NativeSyntheticEvent, type TargetedEvent } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import TextField, { type FieldProps } from './TextField';

interface Props extends FieldProps {
  value: number | null;
  onChange: (n: number | null) => void;
  onBlur?: (e: NativeSyntheticEvent<TargetedEvent>) => void;
  /** Allowed decimal places (0 = whole numbers, number-pad keyboard). */
  decimals?: number;
  /** Unit shown inside the field end (e.g. "DT", "%"). */
  suffix?: string;
  placeholder?: string;
}

/** Numeric input: numeric keyboard, accepts "," or "." as decimal separator, rejects other characters as they are typed. */
export default function NumberField({ value, onChange, onBlur, decimals = 0, suffix, ...field }: Props) {
  const { colors, typography } = useTheme();
  const [text, setText] = useState(value == null ? '' : String(value));
  // follow external changes (reset, prefill) without fighting the user's in-progress text
  useEffect(() => {
    if ((text === '' || text === '.' ? null : Number(text)) !== value) setText(value == null ? '' : String(value));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const allowed = decimals ? new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`) : /^\d*$/;
  return (
    <TextField
      {...field}
      value={text}
      keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
      onChangeText={(t) => {
        const clean = t.replace(',', '.');
        if (!allowed.test(clean)) return;
        setText(clean);
        onChange(clean === '' || clean === '.' ? null : Number(clean));
      }}
      onBlur={(e) => {
        if (value != null && decimals) setText(value.toFixed(decimals));
        onBlur?.(e);
      }}
      trailing={suffix ? <Text style={[typography.body, { color: colors.textMuted }]}>{suffix}</Text> : undefined}
    />
  );
}

/** Amount in dinars with 2 decimals, matching `money()`. */
export function MoneyField(props: Omit<Props, 'decimals' | 'suffix'>) {
  return <NumberField decimals={2} suffix="DT" {...props} />;
}
