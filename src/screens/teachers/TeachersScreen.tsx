import React from 'react';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/apiClient';
import { tr } from '../../i18n';
import Badge from '../../components/ui/Badge';
import ListItem, { Avatar } from '../../components/ui/ListItem';
import RecordList from '../../components/ui/RecordList';

export interface TeacherRow {
  id: number;
  teacherId: string | null;
  specialization: string | null;
  status: string | null;
  user: { name: string; email: string };
  subjects?: { title: string }[];
}

/** GET /api/teachers: paginated list. */
export default function TeachersScreen() {
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  return (
    <RecordList<TeacherRow>
      queryKey={['teachers']}
      fetchPage={async (page) => {
        const res = await apiClient.get('/teachers', { params: { page, pageSize: 20 } });
        return { items: res.data.data, hasNextPage: res.data.pagination.hasNextPage };
      }}
      keyExtractor={(t) => String(t.id)}
      search={{ placeholder: tr('Search by name or email'), match: (t, q) => t.user.name.toLowerCase().includes(q) || t.user.email.toLowerCase().includes(q) }}
      renderItem={({ item }) => (
        <ListItem
          title={item.user.name}
          subtitle={[item.teacherId, item.subjects?.map((s) => s.title).join(', ') || item.specialization || item.user.email].filter(Boolean).join(' · ')}
          leading={<Avatar name={item.user.name} />}
          trailing={item.status && item.status !== 'active' ? <Badge label={tr(item.status.charAt(0).toUpperCase() + item.status.slice(1))} tone="warning" /> : undefined}
          onPress={() => navigation.navigate('TeacherDetail', { id: item.id })}
        />
      )}
      emptyTitle={tr('No teachers found')}
    />
  );
}
