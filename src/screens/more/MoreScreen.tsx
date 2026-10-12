import React, { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconSearch from '@tabler/icons-react-native/IconSearch';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import { control } from '../../theme/spacing';
import { tr } from '../../i18n';
import { hubForRole, SCREEN_LABELS } from '../../navigation/rbac';
import { iconFor } from '../../navigation/screenIcons';
import { useSchoolName } from '../../navigation/useSchoolName';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import ListItem from '../../components/ui/ListItem';
import SearchBar from '../../components/ui/SearchBar';

/** More hub: school card, then every screen the role can open that isn't a tab, grouped like the web sidebar, with in-hub search. */
export default function MoreScreen() {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const { user } = useAuth();
  const { colors, spacing, radius, typography } = useTheme();
  const [query, setQuery] = useState('');
  const schoolName = useSchoolName();
  const q = query.trim().toLowerCase();
  const groups = (user ? hubForRole(user.role) : [])
    .map((g) => ({ ...g, screens: g.screens.filter((s) => !q || tr(SCREEN_LABELS[s]).toLowerCase().includes(q)) }))
    .filter((g) => g.screens.length);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.gutter, gap: spacing.xl }} keyboardShouldPersistTaps="handled">
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Image source={require('../../../assets/icon.png')} accessibilityIgnoresInvertColors style={{ width: control.brand, height: control.brand, borderRadius: radius.md }} />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text accessibilityRole="header" numberOfLines={2} style={[typography.heading, { color: colors.text }]}>
            {schoolName}
          </Text>
          <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted }]}>
            {user?.name}
          </Text>
          {user ? <Badge tone="primary" label={tr(user.role.charAt(0).toUpperCase() + user.role.slice(1))} /> : null}
        </View>
      </Card>
      <SearchBar value={query} onChangeText={setQuery} placeholder={tr('Search')} />
      {groups.length ? (
        groups.map(({ group, screens }) => (
          <View key={group} style={{ gap: spacing.sm }}>
            <Text accessibilityRole="header" style={[typography.label, { color: colors.textMuted, paddingHorizontal: spacing.xs }]}>
              {tr(group)}
            </Text>
            <Card style={{ padding: spacing.none, overflow: 'hidden' }}>
              {screens.map((s, i) => (
                <ListItem
                  key={s}
                  title={tr(SCREEN_LABELS[s])}
                  onPress={() => navigation.navigate(s)}
                  last={i === screens.length - 1}
                  leading={
                    <View style={{ width: control.chip, height: control.chip, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon icon={iconFor(s)} size={22} color={colors.primary} />
                    </View>
                  }
                />
              ))}
            </Card>
          </View>
        ))
      ) : (
        <EmptyState icon={IconSearch} title={tr('Nothing matches your search')} actionLabel={tr('Clear')} onAction={() => setQuery('')} />
      )}
    </ScrollView>
  );
}
