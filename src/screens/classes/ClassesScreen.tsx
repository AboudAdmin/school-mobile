import React from 'react';
import apiClient from '../../api/apiClient';
import { tr } from '../../i18n';
import Badge from '../../components/ui/Badge';
import ListItem, { Avatar } from '../../components/ui/ListItem';
import RecordList from '../../components/ui/RecordList';

interface ClassRow {
  id: number;
  name: string;
  room: string | null;
  capacity: number | null;
  gradeLevelRef?: { label: string } | null;
  students?: { id: number }[];
}

/** GET /api/classes: paginated list with enrolment vs capacity. */
export default function ClassesScreen() {
  return (
    <RecordList<ClassRow>
      queryKey={['classes']}
      fetchPage={async (page) => {
        const res = await apiClient.get('/classes', { params: { page, pageSize: 20 } });
        return { items: res.data.data, hasNextPage: res.data.pagination.hasNextPage };
      }}
      keyExtractor={(c) => String(c.id)}
      search={{ placeholder: tr('Search classes'), match: (c, q) => c.name.toLowerCase().includes(q) }}
      renderItem={({ item }) => {
        const enrolled = item.students?.length ?? 0;
        const full = item.capacity != null && enrolled >= item.capacity;
        return (
          <ListItem
            title={item.name}
            subtitle={[item.gradeLevelRef?.label, item.room && (/^room\b/i.test(item.room) ? item.room : `${tr('Room')} ${item.room}`)].filter(Boolean).join(' · ')}
            leading={<Avatar name={item.name} />}
            trailing={<Badge label={item.capacity != null ? `${enrolled}/${item.capacity}` : String(enrolled)} tone={full ? 'warning' : 'neutral'} />}
          />
        );
      }}
      emptyTitle={tr('No classes found')}
    />
  );
}
