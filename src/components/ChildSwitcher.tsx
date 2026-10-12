import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import IconChevronDown from '@tabler/icons-react-native/IconChevronDown';
import IconCheck from '@tabler/icons-react-native/IconCheck';
import { useActiveChild } from '../api/children';
import { useTheme } from '../theme/ThemeProvider';
import { tr } from '../i18n';
import BottomSheet from './ui/BottomSheet';
import Icon from './ui/Icon';

/** Header chip (name + class) that opens the list of children. Hidden with fewer than 2 children (Web rule). */
export default function ChildSwitcher() {
  const ctx = useActiveChild();
  const { colors, spacing, radius, typography } = useTheme();
  const [open, setOpen] = useState(false);
  if (!ctx || ctx.children.length < 2 || !ctx.active) return null;
  const label = (c: { user?: { name: string } | null; class?: { name: string } | null }) => [c.user?.name, c.class?.name].filter(Boolean).join(' · ');
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${tr('Child')}: ${label(ctx.active)}`}
        accessibilityHint={tr('Switch child')}
        onPress={() => setOpen(true)}
        style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.sm, minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.primarySoft }}
      >
        <Text numberOfLines={1} style={[typography.label, { color: colors.link, flexShrink: 1 }]}>
          {label(ctx.active)}
        </Text>
        <Icon icon={IconChevronDown} size={16} color={colors.link} />
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={tr('Switch child')}>
        {ctx.children.map((c) => {
          const on = c.id === ctx.active?.id;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => (ctx.select(c.id), setOpen(false))}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56 }}
            >
              <Text style={[typography.body, on ? typography.weights.semibold : null, { color: colors.text, flex: 1 }]}>{label(c)}</Text>
              {on ? <Icon icon={IconCheck} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </BottomSheet>
    </View>
  );
}
