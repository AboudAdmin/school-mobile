// One conversation: GET /messages/conversations/:userId (polled), PATCH …/read on open/new messages,
// reply = POST /messages/send to the counterpart, re-using the last subject as "Re: …" (same as the web chat).
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { errorMessage } from '../../api/errors';
import { useTheme } from '../../theme/ThemeProvider';
import { control } from '../../theme/spacing';
import { isRTL, loc, tr } from '../../i18n';
import Button from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';

const THREAD_POLL_MS = 5000;

interface Msg {
  id: number;
  subject: string;
  content: string;
  createdAt: string;
  mine: boolean;
  isRead: boolean;
}
interface ThreadData {
  counterpart: { id: number; name: string };
  canReply: boolean;
  messages: Msg[];
}

export default function Thread() {
  const { colors, spacing, radius, typography } = useTheme();
  const { userId, name } = useRoute().params as { userId: number; name?: string };
  const navigation = useNavigation();
  const qc = useQueryClient();
  const [text, setText] = useState('');

  useEffect(() => {
    if (name) navigation.setOptions({ title: name });
  }, [name, navigation]);

  const q = useQuery({
    queryKey: ['thread', userId],
    refetchInterval: THREAD_POLL_MS,
    queryFn: async () => (await apiClient.get(`/messages/conversations/${userId}`)).data.data as ThreadData,
  });
  const unread = q.data?.messages.some((m) => !m.mine && !m.isRead);
  useEffect(() => {
    if (unread) apiClient.patch(`/messages/conversations/${userId}/read`).then(() => qc.invalidateQueries({ queryKey: ['conversations'] })).catch(() => {});
  }, [unread, userId, qc]);

  const send = useMutation({
    mutationFn: async () => {
      const last = q.data?.messages[q.data.messages.length - 1]?.subject || tr('Message');
      const subject = (/^re:/i.test(last) ? last : `Re: ${last}`).slice(0, 200);
      return apiClient.post('/messages/send', { recipients: { userIds: [userId] }, subject, content: text.trim() });
    },
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['thread', userId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  if (q.isPending) return <LoadingState />;
  if (q.isError || !q.data) return <ErrorState message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={() => q.refetch()} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior="padding" keyboardVerticalOffset={control.keyboardOffset}>
      <FlatList
        data={[...q.data.messages].reverse()}
        inverted
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.mine ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: spacing.md,
              borderRadius: radius.lg,
              backgroundColor: item.mine ? colors.primary : colors.surface,
              borderWidth: item.mine ? spacing.none : control.hairline,
              borderColor: colors.border,
              gap: spacing.xs,
            }}
          >
            <Text style={[typography.caption, { color: item.mine ? colors.onPrimary : colors.textMuted, ...typography.weights.semibold }]}>{item.subject}</Text>
            <Text style={[typography.body, { color: item.mine ? colors.onPrimary : colors.text }]}>{item.content}</Text>
            <Text style={[typography.caption, { color: item.mine ? colors.onPrimary : colors.textMuted }]}>
              {new Date(item.createdAt).toLocaleString(loc(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      />
      {q.data.canReply ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={tr('Write a reply…')}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={tr('Write a reply…')}
            multiline
            maxLength={5000}
            style={[
              typography.input,
              {
                flex: 1,
                maxHeight: control.textareaMax,
                minHeight: control.touch,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.md,
                borderWidth: control.hairline,
                borderColor: colors.borderStrong,
                color: colors.text,
                backgroundColor: colors.surfaceAlt,
                textAlign: isRTL() ? 'right' : 'left',
              },
            ]}
          />
          <Button title={tr('Send')} onPress={() => send.mutate()} loading={send.isPending} disabled={!text.trim()} style={{ minHeight: control.touch }} />
        </View>
      ) : (
        <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', padding: spacing.md }]}>{tr('Replies are not available in this conversation.')}</Text>
      )}
      {send.isError ? (
        <Text accessibilityRole="alert" style={[typography.caption, { color: colors.danger, textAlign: 'center', paddingBottom: spacing.sm }]}>
          {errorMessage(send.error, tr('Could not send the message'))}
        </Text>
      ) : null}
    </KeyboardAvoidingView>
  );
}
