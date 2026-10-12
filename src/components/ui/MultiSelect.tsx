import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import IconSelector from '@tabler/icons-react-native/IconSelector';
import IconSquare from '@tabler/icons-react-native/IconSquare';
import IconSquareCheckFilled from '@tabler/icons-react-native/IconSquareCheckFilled';
import { useTheme } from '../../theme/ThemeProvider';
import { tr, trn } from '../../i18n';
import BottomSheet from './BottomSheet';
import Button from './Button';
import Icon from './Icon';
import SearchBar from './SearchBar';
import type { SelectOption } from './Select';
import { FieldFrame, useFieldStyle, type FieldProps } from './TextField';

interface Props<T extends string | number> extends FieldProps {
  value: T[];
  options: SelectOption<T>[];
  onChange: (value: T[]) => void;
  placeholder?: string;
}

/** Several choices from a long list: searchable sheet with checkboxes; the field summarises the selection. */
export default function MultiSelect<T extends string | number>({ value, options, onChange, placeholder = '—', ...field }: Props<T>) {
  const { colors, spacing, radius, typography } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const fieldStyle = useFieldStyle(field.error, open);
  const picked = options.filter((o) => value.includes(o.value));
  const summary = picked.length === 0 ? null : picked.length <= 2 ? picked.map((o) => o.label).join(', ') : trn('{{count}} selected', picked.length);
  const q = query.trim().toLowerCase();
  const shown = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <FieldFrame {...field}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={field.label}
        accessibilityValue={{ text: picked.map((o) => o.label).join(', ') || undefined }}
        onPress={() => setOpen(true)}
        style={[fieldStyle, { flexDirection: 'row', alignItems: 'center' }]}
      >
        <Text numberOfLines={1} style={[typography.body, { flex: 1, color: summary ? colors.text : colors.textMuted }]}>
          {summary ?? placeholder}
        </Text>
        <Icon icon={IconSelector} size={20} color={colors.textMuted} />
      </Pressable>
      <BottomSheet
        visible={open}
        onClose={() => (setOpen(false), setQuery(''))}
        title={field.label}
        footer={
          <>
            <Button title={tr('Clear')} variant="outline" onPress={() => onChange([])} disabled={value.length === 0} style={{ flex: 1 }} />
            <Button title={tr('Done')} onPress={() => (setOpen(false), setQuery(''))} style={{ flex: 1 }} />
          </>
        }
      >
        <SearchBar value={query} onChangeText={setQuery} placeholder={tr('Search')} />
        {shown.length === 0 ? <Text style={[typography.body, { color: colors.textMuted, padding: spacing.md }]}>{tr('No matches')}</Text> : null}
        {shown.map((o) => {
          const active = value.includes(o.value);
          return (
            <Pressable
              key={String(o.value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              onPress={() => toggle(o.value)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                minHeight: 48,
                paddingHorizontal: spacing.sm,
                borderRadius: radius.sm,
                backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
              })}
            >
              <Icon icon={active ? IconSquareCheckFilled : IconSquare} color={active ? colors.primary : colors.borderStrong} />
              <Text style={[typography.body, { flex: 1, color: colors.text }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </BottomSheet>
    </FieldFrame>
  );
}
