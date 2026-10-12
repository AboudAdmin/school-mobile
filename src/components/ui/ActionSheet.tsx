import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import BottomSheet from './BottomSheet';
import Icon, { type TablerIcon } from './Icon';

export interface SheetAction {
  label: string;
  icon?: TablerIcon;
  destructive?: boolean;
  onPress: () => void;
}

/** A short list of actions on one item (e.g. row long-press). Picking an action closes the sheet first. */
export default function ActionSheet({ visible, title, actions, onClose }: { visible: boolean; title?: string; actions: SheetAction[]; onClose: () => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {actions.map((a) => {
        const color = a.destructive ? colors.danger : colors.text;
        return (
          <Pressable
            key={a.label}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            onPress={() => {
              onClose();
              a.onPress();
            }}
            android_ripple={{ color: colors.primarySoft }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              minHeight: 52,
              paddingHorizontal: spacing.sm,
              borderRadius: radius.md,
              backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
            })}
          >
            {a.icon ? <Icon icon={a.icon} color={color} /> : null}
            <Text style={[typography.body, { color }]}>{a.label}</Text>
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}
