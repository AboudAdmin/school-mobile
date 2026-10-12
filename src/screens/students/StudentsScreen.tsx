import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/apiClient';
import { tr } from '../../i18n';
import Badge from '../../components/ui/Badge';
import ListItem, { Avatar } from '../../components/ui/ListItem';
import RecordList from '../../components/ui/RecordList';
import FilterChips from '../../components/ui/FilterChips';

export interface StudentRow {
  id: number;
  user: { name: string; email: string; status: string };
  class?: { name: string } | null;
}

export const statusTone = (s: string) => (s === 'active' ? 'success' : s === 'suspended' ? 'danger' : 'warning');
const STATUSES = ['', 'active', 'inactive', 'suspended'] as const;

/** GET /api/students (admin, secretary, teacher): paginated, server-side status filter. */
export default function StudentsScreen() {
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('');

  return (
    <RecordList<StudentRow>
      queryKey={['students', { status }]}
      fetchPage={async (page) => {
        const res = await apiClient.get('/students', { params: { page, pageSize: 20, status: status || undefined } });
        return { items: res.data.data, hasNextPage: res.data.pagination.hasNextPage };
      }}
      keyExtractor={(s) => String(s.id)}
      search={{ placeholder: tr('Search by name or email'), match: (s, q) => s.user.name.toLowerCase().includes(q) || s.user.email.toLowerCase().includes(q) }}
      filters={
        <FilterChips
          value={status}
          onChange={setStatus}
          options={STATUSES.map((v) => ({ value: v, label: v ? tr(v.charAt(0).toUpperCase() + v.slice(1)) : tr('All') }))}
        />
      }
      renderItem={({ item }) => (
        <ListItem
          title={item.user.name}
          subtitle={`${item.class?.name ?? tr('No class')} · ${item.user.email}`}
          leading={<Avatar name={item.user.name} />}
          trailing={<Badge label={tr(item.user.status.charAt(0).toUpperCase() + item.user.status.slice(1))} tone={statusTone(item.user.status)} />}
          onPress={() => navigation.navigate('StudentDetail', { id: item.id })}
        />
      )}
      filtersActive={!!status}
      onClearFilters={() => setStatus('')}
      emptyTitle={tr('No students found')}
      emptyMessage={tr('Try another filter.')}
    />
  );
}
