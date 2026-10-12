// "My children" (Web: peoples/parent/my-children): the switcher list. Picking a child makes it the active one and opens its profile.
import React from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useActiveChild } from '../../api/children';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ListItem, { Avatar } from '../../components/ui/ListItem';
import LoadingState from '../../components/ui/LoadingState';

export default function MyChildrenScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const ctx = useActiveChild();
  if (!ctx || ctx.isPending) return <LoadingState />;
  if (ctx.isError) return <ErrorState message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={ctx.refetch} />;
  if (!ctx.children.length) return <EmptyState title={tr('No linked children')} message={tr('Ask the school office to link your children to your account.')} />;
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <Card style={{ padding: spacing.none, overflow: 'hidden' }}>
        {ctx.children.map((c, i) => {
          const name = c.user?.name ?? '—';
          return (
            <ListItem
              key={c.id}
              title={name}
              subtitle={c.class?.name ?? tr('No class')}
              leading={<Avatar name={name} />}
              trailing={c.id === ctx.active?.id ? <Badge tone="primary" label={tr('Viewing')} /> : undefined}
              last={i === ctx.children.length - 1}
              onPress={() => (ctx.select(c.id), navigation.navigate('StudentDetail', { id: c.id }))}
            />
          );
        })}
      </Card>
    </ScrollView>
  );
}
