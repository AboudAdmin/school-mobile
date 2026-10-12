import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import IconSearch from '@tabler/icons-react-native/IconSearch';
import IconX from '@tabler/icons-react-native/IconX';
import { useTheme } from '../../theme/ThemeProvider';
import { isRTL, tr } from '../../i18n';
import Icon from './Icon';

/** Search field with a leading search icon and a clear button. */
export default function SearchBar({ value, onChangeText, placeholder }: { value: string; onChangeText: (v: string) => void; placeholder: string }) {
  const { colors, spacing, radius, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: 48,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        borderWidth: focused ? 2 : 1,
        borderColor: focused ? colors.primary : colors.borderStrong,
        backgroundColor: colors.surface,
      }}
    >
      <Icon icon={IconSearch} size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={placeholder}
        accessibilityRole="search"
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[typography.input, { flex: 1, color: colors.text, paddingVertical: spacing.sm, textAlign: isRTL() ? 'right' : 'left' }]}
      />
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel={tr('Clear search')} onPress={() => onChangeText('')} hitSlop={12}>
          <Icon icon={IconX} size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
