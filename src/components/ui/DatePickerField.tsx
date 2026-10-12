import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import BottomSheet from './BottomSheet';
import { FieldFrame, useFieldStyle, type FieldProps } from './TextField';
import IconChevronLeft from '@tabler/icons-react-native/IconChevronLeft';
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight';
import Icon from './Icon';

// Dependency-free month-grid picker. Value is an ISO date string (YYYY-MM-DD), the format the backend uses.
const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

interface Props extends FieldProps {
  value?: string | null;
  onChange: (iso: string) => void;
  placeholder?: string;
}

export default function DatePickerField({ value, onChange, placeholder = 'YYYY-MM-DD', ...field }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const base = value ? new Date(`${value}T00:00:00`) : new Date();
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });
  const fieldStyle = useFieldStyle(field.error, open);

  const first = new Date(view.y, view.m, 1);
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const shift = (delta: number) => setView(({ y, m }) => ({ y: m + delta < 0 ? y - 1 : m + delta > 11 ? y + 1 : y, m: (m + delta + 12) % 12 }));
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i).toLocaleDateString(i18n.language, { weekday: 'narrow' }));

  return (
    <FieldFrame {...field}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={field.label}
        accessibilityValue={{ text: value ?? undefined }}
        onPress={() => setOpen(true)}
        style={[fieldStyle, { justifyContent: 'center' }]}
      >
        <Text style={[typography.body, { color: value ? colors.text : colors.textMuted }]}>
          {value || placeholder}
        </Text>
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={field.label}>
        <View style={[styles.row, { justifyContent: 'space-between', marginBottom: spacing.sm }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => shift(-1)} hitSlop={12} style={styles.nav}>
            <Icon icon={IconChevronLeft} color={colors.primary} directional />
          </Pressable>
          <Text style={[typography.label, { color: colors.text, fontSize: 15 }]}>
            {first.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => shift(1)} hitSlop={12} style={styles.nav}>
            <Icon icon={IconChevronRight} color={colors.primary} directional />
          </Pressable>
        </View>
        <View style={styles.row}>
          {weekdays.map((d, i) => (
            <Text key={i} style={[styles.cell, typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
              {d}
            </Text>
          ))}
        </View>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          {cells.map((d, i) => {
            if (!d) return <View key={i} style={styles.cell} />;
            const iso = toISO(view.y, view.m, d);
            const active = iso === value;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={iso}
                accessibilityState={{ selected: active }}
                onPress={() => {
                  onChange(iso);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.cell,
                  styles.day,
                  { borderRadius: radius.pill, backgroundColor: active ? colors.primary : pressed ? colors.primarySoft : 'transparent' },
                ]}
              >
                <Text style={[typography.body, { color: active ? colors.onPrimary : colors.text }]}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </FieldFrame>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  nav: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, maxHeight: 44 },
  day: { alignItems: 'center', justifyContent: 'center' },
});
