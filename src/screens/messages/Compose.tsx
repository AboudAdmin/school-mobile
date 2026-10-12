// New direct message: recipients come from GET /messages/recipients (contacts for families, ?q= search for staff/teachers);
// POST /messages/send { recipients: { userIds }, subject, content }. The backend decides who may message whom.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { errorMessage } from '../../api/errors';
import { useOnline } from '../../api/network';
import { useTheme } from '../../theme/ThemeProvider';
import { control } from '../../theme/spacing';
import { tr } from '../../i18n';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ErrorSummary, FormScroll, useForm } from '../../components/ui/Form';
import OfflineNote from '../../components/ui/OfflineNote';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import { useToast } from '../../components/ui/Toast';

interface Person {
  id: number;
  name: string;
  role: string;
  className?: string;
}

export default function Compose() {
  const { colors } = useTheme();
  const navigation = useNavigation<{ replace: (screen: string, params?: object) => void }>();
  const qc = useQueryClient();
  const online = useOnline();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const f = useForm({ to: null as number | null, subject: '', content: '' }, (v) => ({
    to: v.to ? undefined : tr('Choose a recipient'),
    subject: v.subject.trim() ? undefined : tr('Add a subject.'),
    content: v.content.trim() ? undefined : tr('Write a message.'),
  }));
  const v = f.values;

  useEffect(() => {
    const t = setTimeout(() => setTerm(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const options = useQuery({
    queryKey: ['message-recipients', term],
    queryFn: async () => (await apiClient.get('/messages/recipients', { params: { q: term || undefined } })).data.data as { contacts: Person[]; people: Person[] },
  });
  const people = [...(options.data?.contacts ?? []), ...(options.data?.people ?? [])].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);
  const toName = people.find((p) => p.id === v.to)?.name;

  const send = useMutation({
    mutationFn: async () => apiClient.post('/messages/send', { recipients: { userIds: [v.to] }, subject: v.subject.trim(), content: v.content.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      toast({ message: tr('Message sent'), tone: 'success' });
      navigation.replace('Thread', { userId: v.to, name: toName });
    },
    onError: (e) => setServerError(errorMessage(e, tr('Could not send the message'))),
  });

  const submit = () => {
    setServerError(null);
    f.submit(() => send.mutate());
  };
  const labels = { to: tr('To'), subject: tr('Subject'), content: tr('Message'), form: tr('Send') };
  const items: [string, string][] = serverError ? [...f.summary, ['form', serverError]] : f.summary;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FormScroll
        actions={
          <>
            <OfflineNote />
            <Button title={tr('Send')} onPress={submit} loading={send.isPending} disabled={!online} />
          </>
        }
      >
        <ErrorSummary items={items} labels={labels} />
        <Card>
          <TextField label={tr('Find a person')} value={search} onChangeText={setSearch} placeholder={tr('Name or email')} autoCorrect={false} />
          <Select
            label={tr('To')}
            required
            {...f.pick('to')}
            placeholder={options.isPending ? '…' : people.length ? '—' : tr('Nobody found')}
            options={people.map((p) => ({ value: p.id, label: `${p.name} · ${tr(p.role.charAt(0).toUpperCase() + p.role.slice(1))}${p.className ? ` · ${p.className}` : ''}` }))}
          />
          <TextField label={tr('Subject')} required maxLength={200} {...f.text('subject')} />
          <TextField label={tr('Message')} required multiline maxLength={5000} style={{ minHeight: control.textareaMax, textAlignVertical: 'top' }} {...f.text('content')} />
        </Card>
      </FormScroll>
    </View>
  );
}
