import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import BottomSheet from './BottomSheet';
import { FieldFrame, useFieldStyle, type FieldProps } from './TextField';
import IconChevronDown from '@tabler/icons-react-native/IconChevronDown';
import IconCheck from '@tabler/icons-react-native/IconCheck';
import Icon from './Icon';

export interface SelectOption<T extends string | number> {
  label: string;
  value: T;
}

interface Props<T extends string | number> extends FieldProps {
  value?: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
}

export default function Select<T extends string | number>({ value, options, onChange, placeholder = '—', ...field }: Props<T>) {
  const { colors, spacing, radius, typography } = useTheme();
  const [open, setOpen] = useState(false);
  const fieldStyle = useFieldStyle(field.error, open);
  const selected = options.find((o) => o.value === value);

  return (
    <FieldFrame {...field}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={field.label}
        accessibilityValue={{ text: selected?.label }}
        onPress={() => setOpen(true)}
        style={[fieldStyle, { flexDirection: 'row', alignItems: 'center' }]}
      >
        <Text
          style={[
            typography.body,
            { flex: 1, color: selected ? colors.text : colors.textMuted },
          ]}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Icon icon={IconChevronDown} size={20} color={colors.textMuted} />
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={field.label}>
        {options.map((item) => {
          const active = item.value === value;
          return (
            <Pressable
              key={String(item.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: spacing.md,
                borderRadius: radius.sm,
                backgroundColor: active || pressed ? colors.primarySoft : 'transparent',
              })}
            >
              <Text style={[typography.body, { color: active ? colors.primary : colors.text, ...(active ? typography.weights.semibold : typography.weights.regular) }]}>
                {item.label}
              </Text>
              {active ? <Icon icon={IconCheck} size={20} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </BottomSheet>
    </FieldFrame>
  );
}
