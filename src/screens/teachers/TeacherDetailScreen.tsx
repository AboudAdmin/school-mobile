import React from 'react';
import { ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../theme/ThemeProvider';
import { loc, tr } from '../../i18n';
import DetailHero from '../../components/ui/DetailHero';
import ErrorState from '../../components/ui/ErrorState';
import KeyValueList from '../../components/ui/KeyValueList';
import LoadingState from '../../components/ui/LoadingState';
import type { TeacherRow } from './TeachersScreen';

interface Teacher extends TeacherRow {
  phone: string | null;
  qualification: string | null;
  contractType: string | null;
  hireDate: string | null;
}

/** GET /api/teachers/:id: identity hero + grouped details. */
export default function TeacherDetailScreen() {
  const { colors, spacing } = useTheme();
  const { id } = useRoute().params as { id: number };
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['teacher', id],
    queryFn: async () => (await apiClient.get(`/teachers/${id}`)).data.data as Teacher,
  });

  if (isPending) return <LoadingState />;
  if (isError || !data) return <ErrorState message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={() => refetch()} />;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
      <DetailHero title={data.user.name} subtitle={data.user.email} />
      <KeyValueList
        rows={[
          { label: tr('Teacher ID'), value: data.teacherId },
          { label: tr('Phone'), value: data.phone },
          { label: tr('Subjects'), value: data.subjects?.map((s) => s.title).join(', ') || data.specialization },
          { label: tr('Qualification'), value: data.qualification },
          { label: tr('Contract Type'), value: data.contractType ? tr(data.contractType.charAt(0).toUpperCase() + data.contractType.slice(1)) : null },
          { label: tr('Hire Date'), value: data.hireDate ? new Date(data.hireDate).toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' }) : null },
        ]}
      />
    </ScrollView>
  );
}
