import React from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../auth/AuthContext';
import { canOpen } from '../../navigation/rbac';
import { loc, tr } from '../../i18n';
import ActionBar from '../../components/ui/ActionBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DetailHero from '../../components/ui/DetailHero';
import ErrorState from '../../components/ui/ErrorState';
import KeyValueList from '../../components/ui/KeyValueList';
import LoadingState from '../../components/ui/LoadingState';
import { statusTone } from './StudentsScreen';

interface Student {
  id: number;
  birthdate: string | null;
  gender: string | null;
  address: string | null;
  points: number;
  financeHold: boolean;
  user: { name: string; email: string; status: string };
  class?: { name: string; room?: string | null } | null;
  parent?: { user?: { name: string; email: string } | null; phone?: string | null } | null;
}

/** GET /api/students/:id: the backend enforces who may see which student. Hero + grouped details; staff get the student's timetable / results. */
export default function StudentDetailScreen() {
  const { colors, spacing } = useTheme();
  const { id } = useRoute().params as { id: number };
  const { user } = useAuth();
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => (await apiClient.get(`/students/${id}`)).data.data as Student,
  });

  if (isPending) return <LoadingState />;
  if (isError || !data) return <ErrorState message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={() => refetch()} />;

  const showTimetable = !!user && !!data.class && canOpen('StudentTimetable', user.role);
  const showResults = !!user && canOpen('StudentResults', user.role);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <DetailHero
          title={data.user.name}
          subtitle={data.class ? `${data.class.name}${data.class.room ? ` · ${data.class.room}` : ''}` : tr('No class')}
          badge={
            <View style={{ gap: spacing.xs, alignItems: 'flex-end' }}>
              <Badge label={tr(data.user.status.charAt(0).toUpperCase() + data.user.status.slice(1))} tone={statusTone(data.user.status)} />
              {data.financeHold ? <Badge label={tr('Finance hold')} tone="danger" /> : null}
            </View>
          }
          figure={{ label: tr('Points'), value: String(data.points) }}
        />
        <KeyValueList
          rows={[
            { label: tr('Email'), value: data.user.email },
            { label: tr('Date of Birth'), value: data.birthdate ? new Date(`${data.birthdate}T00:00:00`).toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' }) : null },
            { label: tr('Gender'), value: data.gender ? tr(data.gender.charAt(0).toUpperCase() + data.gender.slice(1)) : null },
            { label: tr('Address'), value: data.address },
            { label: tr('Parent'), value: data.parent?.user ? `${data.parent.user.name} · ${data.parent.user.email}` : tr('No linked parent') },
          ]}
        />
      </ScrollView>
      {showTimetable || showResults ? (
        <ActionBar>
          {showTimetable ? <Button title={tr('Timetable')} variant="outline" onPress={() => navigation.navigate('StudentTimetable', { studentId: id })} /> : null}
          {showResults ? <Button title={tr('Results')} variant="outline" onPress={() => navigation.navigate('StudentResults', { studentId: id })} /> : null}
        </ActionBar>
      ) : null}
    </View>
  );
}
