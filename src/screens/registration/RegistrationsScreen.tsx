import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/apiClient';
import { loc } from '../../i18n';
import { useTheme } from '../../theme/ThemeProvider';
import Badge, { type Tone } from '../../components/ui/Badge';
import FilterChips from '../../components/ui/FilterChips';
import DataCard from '../../components/ui/DataCard';
import RecordList from '../../components/ui/RecordList';

export type RegStatus = 'pending' | 'approved' | 'rejected';
export const REG_TONE: Record<RegStatus, Tone> = { pending: 'warning', approved: 'success', rejected: 'danger' };

interface Row {
  id: number;
  status: RegStatus;
  createdAt: string;
  parentName: string;
  studentName: string;
}

/** GET /api/registration-requests (secretary, admin): review queue, pending first by default. */
export default function RegistrationsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const [status, setStatus] = useState<RegStatus | ''>('pending');
  const { spacing } = useTheme();

  return (
    <RecordList<Row>
      queryKey={['registration-requests', { status }]}
      fetchPage={async (page) => {
        const { data } = (await apiClient.get('/registration-requests', { params: { status: status || undefined, page, pageSize: 20 } })).data;
        return { items: data.items, hasNextPage: data.page * data.pageSize < data.total };
      }}
      keyExtractor={(r) => String(r.id)}
      filters={
        <FilterChips
          value={status}
          onChange={setStatus}
          options={(['pending', 'approved', 'rejected', ''] as const).map((v) => ({ value: v, label: t(`registration.review.${v || 'all'}`) }))}
        />
      }
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
          <DataCard
            title={item.parentName}
            subtitle={`${t('registration.review.child')}: ${item.studentName}`}
            trailing={<Badge label={t(`registration.review.${item.status}`)} tone={REG_TONE[item.status]} />}
            meta={[{ label: t('registration.review.submitted', { defaultValue: 'Submitted' }), value: new Date(item.createdAt).toLocaleDateString(loc(), { day: 'numeric', month: 'short', year: 'numeric' }) }]}
            onPress={() => navigation.navigate('RegistrationDetail', { id: item.id })}
          />
        </View>
      )}
      filtersActive={status !== ''}
      onClearFilters={() => setStatus('')}
      emptyTitle={t('registration.review.emptyTitle')}
      emptyMessage={t('registration.review.emptyHint')}
    />
  );
}
