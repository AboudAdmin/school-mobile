import React from 'react';
import { Linking } from 'react-native';
import { fetchResourcePage, resourceKeys, type Resource } from '../../api/resources';
import { useSubjectStudent } from '../../api/students';
import { tr } from '../../i18n';
import ListItem, { Avatar } from '../../components/ui/ListItem';
import RecordList from '../../components/ui/RecordList';

/** GET /api/resources (shared, scoped by the backend). Opening a resource hands it to the system browser/viewer. */
export default function ResourcesScreen() {
  const me = useSubjectStudent();
  return (
    <RecordList<Resource>
      queryKey={resourceKeys.list(me.id, me.mode === 'child' ? me.classId : undefined)}
      fetchPage={(page) => fetchResourcePage(page, me.id, me.mode === 'child' ? me.classId : undefined)}
      keyExtractor={(r) => String(r.id)}
      search={{ placeholder: tr('Search resources'), match: (r, q) => r.title.toLowerCase().includes(q) }}
      renderItem={({ item }) => (
        <ListItem
          title={item.title}
          subtitle={[item.subject?.title, item.class?.name, item.type].filter(Boolean).join(' · ')}
          leading={<Avatar name={item.title} />}
          onPress={item.url ? () => Linking.openURL(item.url) : undefined}
        />
      )}
      emptyTitle={tr('No resources yet')}
      emptyMessage={tr('Course material shared by your teachers will appear here.')}
    />
  );
}
