// Messages tab: conversations (GET /messages/conversations, polled — no socket in the stack) + the announcement feed.
import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../theme/ThemeProvider';
import { loc, tr } from '../../i18n';
import Badge from '../../components/ui/Badge';
import FAB from '../../components/ui/FAB';
import IconPlus from '@tabler/icons-react-native/IconPlus';
import FilterChips from '../../components/ui/FilterChips';
import ListItem, { Avatar } from '../../components/ui/ListItem';
import RecordList from '../../components/ui/RecordList';
import Feed from '../announcements/Feed';

export const POLL_MS = 15000;

interface Conv {
  counterpart: { id: number; name: string; role: string };
  unread: number;
  last: { subject: string; content: string; createdAt: string; mine: boolean };
}

export default function ConversationList() {
  const { spacing } = useTheme();
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const [view, setView] = useState<'messages' | 'announcements'>('messages');

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <FilterChips
          value={view}
          onChange={setView}
          options={[
            { value: 'messages', label: tr('Messages') },
            { value: 'announcements', label: tr('Announcements') },
          ]}
        />
      </View>
      {view === 'announcements' ? (
        <Feed />
      ) : (
        <RecordList<Conv>
          queryKey={['conversations']}
          refetchInterval={POLL_MS}
          fetchPage={async () => ({ items: (await apiClient.get('/messages/conversations')).data.data, hasNextPage: false })}
          keyExtractor={(c) => String(c.counterpart.id)}
          search={{ placeholder: tr('Search conversations'), match: (c, q) => c.counterpart.name.toLowerCase().includes(q) || c.last.subject.toLowerCase().includes(q) }}
          fab={<FAB icon={IconPlus} label={tr('New message')} extended onPress={() => navigation.navigate('Compose')} />}
          renderItem={({ item }) => (
            <ListItem
              title={item.counterpart.name}
              subtitle={`${item.last.mine ? tr('You: ') : ''}${item.last.subject} — ${item.last.content}`}
              leading={<Avatar name={item.counterpart.name} />}
              trailing={
                item.unread ? (
                  <Badge tone="primary" label={String(item.unread)} />
                ) : (
                  <Badge tone="neutral" label={new Date(item.last.createdAt).toLocaleDateString(loc(), { day: 'numeric', month: 'short' })} />
                )
              }
              onPress={() => navigation.navigate('Thread', { userId: item.counterpart.id, name: item.counterpart.name })}
            />
          )}
          emptyTitle={tr('No conversations yet')}
          emptyMessage={tr('Start one with “New message”.')}
        />
      )}
    </View>
  );
}
