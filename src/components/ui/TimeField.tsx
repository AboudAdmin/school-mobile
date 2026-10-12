import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import IconClock from '@tabler/icons-react-native/IconClock';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import BottomSheet from './BottomSheet';
import Button from './Button';
import Icon from './Icon';
import { FieldFrame, useFieldStyle, type FieldProps } from './TextField';

// Value is "HH:MM" (24 h), the format the backend uses for timetable slots.
const pad = (n: number) => String(n).padStart(2, '0');
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

interface Props extends FieldProps {
  value?: string | null;
  onChange: (hhmm: string) => void;
  placeholder?: string;
}

export default function TimeField({ value, onChange, placeholder = 'HH:MM', ...field }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const [open, setOpen] = useState(false);
  const fieldStyle = useFieldStyle(field.error, open);
  const [h, m] = value ? value.split(':') : [null, null];

  const grid = (title: string, items: string[], selected: string | null, pick: (v: string) => void) => (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.sm }]}>{title}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={title} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {items.map((v) => {
          const active = v === selected;
          return (
            <Pressable
              key={v}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => pick(v)}
              style={({ pressed }) => ({
                width: 52,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : pressed ? colors.surfaceAlt : colors.surface,
              })}
            >
              <Text style={[typography.numeric, { color: active ? colors.onPrimary : colors.text }]}>{v}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <FieldFrame {...field}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={field.label}
        accessibilityValue={{ text: value ?? undefined }}
        onPress={() => setOpen(true)}
        style={[fieldStyle, { flexDirection: 'row', alignItems: 'center' }]}
      >
        <Text style={[typography.body, { flex: 1, color: value ? colors.text : colors.textMuted }]}>{value || placeholder}</Text>
        <Icon icon={IconClock} size={20} color={colors.textMuted} />
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={field.label} footer={<Button title={tr('Done')} onPress={() => setOpen(false)} style={{ flex: 1 }} />}>
        {grid(tr('Hour'), HOURS, h, (v) => onChange(`${v}:${m ?? '00'}`))}
        {grid(tr('Minute'), MINUTES, m, (v) => onChange(`${h ?? '08'}:${v}`))}
      </BottomSheet>
    </FieldFrame>
  );
}
