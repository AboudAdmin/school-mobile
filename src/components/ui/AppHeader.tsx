import React, { type ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import IconArrowLeft from '@tabler/icons-react-native/IconArrowLeft';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import Icon, { type TablerIcon } from './Icon';
import Avatar from './Avatar';

interface Action {
  icon: TablerIcon;
  label: string;
  onPress: () => void;
}

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Up to 2 icon actions; each needs a label for screen readers. */
  actions?: Action[];
  /** Root-tab header: show the school crest before the title. */
  crest?: boolean;
  /** Root-tab header: the signed-in user's avatar, opening the account sheet. */
  account?: { name: string; onPress: () => void };
  /** Reserved slot under the title row (parent child switcher). */
  below?: ReactNode;
  /** Status-bar inset when used as the navigator's `header`. */
  topInset?: number;
}

/** Page header: back or school crest, title + subtitle, ≤ 2 contextual icon actions, account avatar. */
export default function AppHeader({ title, subtitle, onBack, actions = [], crest, account, below, topInset = 0 }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const iconButton = (a: Action, directional = false) => (
    <Pressable
      key={a.label}
      accessibilityRole="button"
      accessibilityLabel={a.label}
      onPress={a.onPress}
      hitSlop={4}
      android_ripple={{ color: colors.primarySoft, borderless: true }}
      style={{ width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon icon={a.icon} color={colors.text} directional={directional} />
    </Pressable>
  );
  return (
    <View style={{ paddingTop: topInset, backgroundColor: colors.surface }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }}>
        {onBack ? (
          iconButton({ icon: IconArrowLeft, label: tr('Back'), onPress: onBack }, true)
        ) : crest ? (
          <Image source={require('../../../assets/icon.png')} accessibilityIgnoresInvertColors style={{ width: 36, height: 36, borderRadius: radius.md, marginStart: spacing.xs }} />
        ) : (
          <View style={{ width: spacing.sm }} />
        )}
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" numberOfLines={2} style={[typography.title, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle ? <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
        {actions.slice(0, 2).map((a) => iconButton(a))}
        {account ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr('Account')}
            onPress={account.onPress}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginEnd: spacing.xs }}
          >
            <Avatar name={account.name} size={34} />
          </Pressable>
        ) : null}
      </View>
      {below}
    </View>
  );
}
