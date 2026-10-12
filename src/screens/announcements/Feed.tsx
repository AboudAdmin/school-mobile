// Announcement feed (read-only for non-authors): GET /announcements (backend filters by role/class), POST /:id/read | /:id/ack
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../theme/ThemeProvider';
import { control } from '../../theme/spacing';
import { loc, tr } from '../../i18n';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import RecordList from '../../components/ui/RecordList';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import { IconText } from '../../components/ui/Icon';

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  isPinned: boolean;
  requiresAcknowledgment: boolean;
  createdAt: string;
  creator?: { name: string } | null;
  isRead: boolean;
  isAcknowledged: boolean;
}

export default function Feed() {
  const { colors, spacing, radius, typography } = useTheme();
  const qc = useQueryClient();
  const [open, setOpen] = useState<number | null>(null);
  const mark = useMutation({
    mutationFn: async ({ id, kind }: { id: number; kind: 'read' | 'ack' }) => apiClient.post(`/announcements/${id}/${kind}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });

  return (
    <RecordList<Announcement>
      queryKey={['announcements']}
      fetchPage={async (page) => {
        const res = await apiClient.get('/announcements', { params: { page, pageSize: 20 } });
        return { items: res.data.data, hasNextPage: res.data.pagination.hasNextPage };
      }}
      keyExtractor={(a) => String(a.id)}
      search={{ placeholder: tr('Search announcements'), match: (a, q) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) }}
      renderItem={({ item }) => {
        const expanded = open === item.id;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            onPress={() => {
              setOpen(expanded ? null : item.id);
              if (!item.isRead) mark.mutate({ id: item.id, kind: 'read' });
            }}
            style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: control.hairline, borderColor: item.isRead ? colors.border : colors.primary, gap: spacing.xs }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              {!item.isRead ? <Badge tone="primary" label={tr('New')} /> : null}
              {item.isPinned ? <Badge tone="info" label={tr('Pinned')} /> : null}
              {item.priority === 'high' || item.priority === 'urgent' ? <Badge tone="danger" label={tr('Important')} /> : null}
            </View>
            <Text style={[typography.heading, { color: colors.text }]}>{item.title}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {[item.creator?.name, new Date(item.createdAt).toLocaleDateString(loc(), { day: 'numeric', month: 'short' })].filter(Boolean).join(' · ')}
            </Text>
            <Text style={[typography.body, { color: colors.text }]} numberOfLines={expanded ? undefined : 2}>
              {item.content}
            </Text>
            {expanded && item.requiresAcknowledgment ? (
              item.isAcknowledged ? (
                <IconText icon={IconCircleCheck} color={colors.success} textStyle={typography.caption}>{tr('Acknowledged')}</IconText>
              ) : (
                <Button title={tr('Acknowledge')} variant="outline" onPress={() => mark.mutate({ id: item.id, kind: 'ack' })} loading={mark.isPending} style={{ alignSelf: 'flex-start', minHeight: control.chip }} />
              )
            ) : null}
          </Pressable>
        );
      }}
      emptyTitle={tr('No announcements')}
    />
  );
}
