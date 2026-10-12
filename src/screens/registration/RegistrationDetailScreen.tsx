// Review one registration request — same rules as the web review modal:
//   GET /registration-requests/:id, POST /:id/approve { classId, parentId? }, POST /:id/reject { reason }
// Hero + grouped details; the Approve / Reject actions sit in the ActionBar and each goes through a ConfirmSheet, then a Toast.
import React, { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/apiClient';
import { errorMessage } from '../../api/errors';
import { registrationKeys } from '../../api/registrations';
import { useTheme } from '../../theme/ThemeProvider';
import { loc, tr } from '../../i18n';
import ActionBar from '../../components/ui/ActionBar';
import Badge from '../../components/ui/Badge';
import BottomSheet from '../../components/ui/BottomSheet';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmSheet from '../../components/ui/ConfirmSheet';
import DetailHero from '../../components/ui/DetailHero';
import ErrorState from '../../components/ui/ErrorState';
import KeyValueList from '../../components/ui/KeyValueList';
import LoadingState from '../../components/ui/LoadingState';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import { useToast } from '../../components/ui/Toast';
import { REG_TONE, type RegStatus } from './RegistrationsScreen';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import { IconText } from '../../components/ui/Icon';

interface Detail {
  id: number;
  status: RegStatus;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress?: string | null;
  parentCnic?: string | null;
  studentName: string;
  studentEmail: string;
  studentBirthdate: string;
  studentGender: string;
  studentAddress?: string | null;
  gradeLevel?: { label: string } | null;
  rejectionReason?: string | null;
  duplicates: {
    parentEmailMatchesParent: { parentId: number; name: string } | null;
    parentEmailUsedByOtherRole: string | null;
    parentPhoneMatchesParent: { parentId: number; name?: string } | null;
    studentEmailTaken: boolean;
    sameChildExists: boolean;
  };
}
interface Accounts {
  parentEmail: string;
  parentLinkedToExisting: boolean;
  studentEmail: string;
}

export default function RegistrationDetailScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius, typography } = useTheme();
  const { id } = useRoute().params as { id: number };
  const qc = useQueryClient();
  const toast = useToast();
  const [classId, setClassId] = useState<number | null>(null);
  const [linkParent, setLinkParent] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirm, setConfirm] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Accounts | null>(null);

  const req = useQuery({
    queryKey: ['registration-request', id],
    queryFn: async () => (await apiClient.get(`/registration-requests/${id}`)).data.data as Detail,
  });
  const classes = useQuery({
    queryKey: ['classes-options'],
    queryFn: async () => (await apiClient.get('/classes', { params: { pageSize: 200 } })).data.data as { id: number; name: string }[],
  });

  const done = () => {
    qc.invalidateQueries({ queryKey: ['registration-requests'] });
    qc.invalidateQueries({ queryKey: ['registration-request', id] });
    qc.invalidateQueries({ queryKey: registrationKeys.pending });
  };
  const approve = useMutation({
    mutationFn: async () => {
      const body: { classId: number; parentId?: number } = { classId: classId! };
      if (linkParent && req.data?.duplicates.parentPhoneMatchesParent) body.parentId = req.data.duplicates.parentPhoneMatchesParent.parentId;
      return (await apiClient.post(`/registration-requests/${id}/approve`, body)).data.data;
    },
    onSuccess: (d) => {
      setAccounts(d?.accounts ?? null);
      setConfirm(null);
      done();
      toast({ message: t('registration.review.activeTitle'), tone: 'success' });
    },
    onError: (e) => (setConfirm(null), setFormError(errorMessage(e, t('registration.review.approveFailed')))),
  });
  const reject = useMutation({
    mutationFn: async () => apiClient.post(`/registration-requests/${id}/reject`, { reason: reason.trim() }),
    onSuccess: () => {
      setConfirm(null);
      setRejectOpen(false);
      done();
      toast({ message: tr('Request rejected'), tone: 'info' });
    },
    onError: (e) => (setConfirm(null), setFormError(errorMessage(e, t('registration.review.rejectFailed')))),
  });

  if (req.isPending) return <LoadingState />;
  if (req.isError || !req.data) return <ErrorState message={t('registration.review.loadFailed')} retryLabel={t('registration.review.retry')} onRetry={() => req.refetch()} />;

  const r = req.data;
  const dup = r.duplicates;
  const blocked = !!dup && (!!dup.parentEmailUsedByOtherRole || dup.studentEmailTaken);
  const pending = r.status === 'pending';
  const date = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' });
  const note = (text: string, tone: 'info' | 'warning' | 'danger') => (
    <Text key={text} style={[typography.body, { color: colors[tone], backgroundColor: colors[`${tone}Soft`], padding: spacing.md, borderRadius: radius.md }]}>
      {text}
    </Text>
  );
  const className = (classes.data ?? []).find((c) => c.id === classId)?.name ?? '';

  const startApprove = () => {
    if (!classId) return setFormError(t('registration.required'));
    setFormError(null);
    setConfirm('approve');
  };
  const startReject = () => {
    if (reason.trim().length < 3) return setFormError(t('registration.required'));
    setFormError(null);
    setConfirm('reject');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
        <DetailHero title={r.studentName} subtitle={r.parentName} badge={<Badge label={t(`registration.review.${r.status}`)} tone={REG_TONE[r.status]} />} />

        {accounts ? (
          <Card style={{ borderColor: colors.success, gap: spacing.xs }}>
            <IconText icon={IconCircleCheck} color={colors.success} textStyle={typography.heading} alert>
              {t('registration.review.activeTitle')}
            </IconText>
            <Text style={[typography.body, { color: colors.text }]}>{t('registration.review.activeHint')}</Text>
            <Text style={[typography.body, { color: colors.text }]}>
              {t('registration.review.parentLogin')}: {accounts.parentEmail}
            </Text>
            <Text style={[typography.body, { color: colors.text }]}>
              {t('registration.review.childLogin')}: {accounts.studentEmail}
            </Text>
          </Card>
        ) : null}

        <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
          {t('registration.review.parentSection')}
        </Text>
        <KeyValueList
          rows={[
            { label: t('registration.parentName'), value: r.parentName },
            { label: t('registration.email'), value: r.parentEmail },
            { label: t('registration.phone'), value: r.parentPhone },
            { label: t('registration.review.address'), value: r.parentAddress },
            { label: t('registration.review.cnic'), value: r.parentCnic },
          ]}
        />
        <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
          {t('registration.review.childSection')}
        </Text>
        <KeyValueList
          rows={[
            { label: t('registration.email'), value: r.studentEmail },
            { label: t('registration.review.birthdate'), value: date(r.studentBirthdate) },
            { label: t('registration.review.gender'), value: t(`registration.${r.studentGender}`) },
            { label: t('registration.review.gradeLevel'), value: r.gradeLevel?.label },
            { label: t('registration.review.address'), value: r.studentAddress },
          ]}
        />

        {pending ? (
          <>
            <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
              {t('registration.review.checks')}
            </Text>
            {!dup.parentEmailMatchesParent && !dup.parentEmailUsedByOtherRole && !dup.parentPhoneMatchesParent && !dup.studentEmailTaken && !dup.sameChildExists
              ? note(t('registration.review.noIssues'), 'info')
              : null}
            {dup.parentEmailMatchesParent ? note(t('registration.review.dupParentEmail', { name: dup.parentEmailMatchesParent.name }), 'info') : null}
            {dup.parentPhoneMatchesParent ? note(t('registration.review.dupParentPhone', { name: dup.parentPhoneMatchesParent.name || '' }), 'warning') : null}
            {dup.sameChildExists ? note(t('registration.review.dupChild'), 'warning') : null}
            {dup.parentEmailUsedByOtherRole ? note(t('registration.review.dupOtherRole', { role: dup.parentEmailUsedByOtherRole }), 'danger') : null}
            {dup.studentEmailTaken ? note(t('registration.review.dupChildEmail'), 'danger') : null}

            <Card>
              <Select
                label={t('registration.review.class')}
                required
                hint={t('registration.review.classHelp')}
                placeholder={t('registration.review.selectClass')}
                value={classId}
                onChange={(v) => (setClassId(v), setFormError(null))}
                options={(classes.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
                error={formError}
              />
              {dup.parentPhoneMatchesParent ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{t('registration.review.linkParent')}</Text>
                  <Switch accessibilityLabel={t('registration.review.linkParent')} value={linkParent} onValueChange={setLinkParent} trackColor={{ true: colors.primary, false: colors.border }} />
                </View>
              ) : null}
            </Card>
          </>
        ) : r.status === 'rejected' && r.rejectionReason ? (
          note(`${t('registration.review.reason')}: ${r.rejectionReason}`, 'danger')
        ) : null}
      </ScrollView>

      {pending ? (
        <ActionBar>
          <Button title={t('registration.review.approve')} onPress={startApprove} disabled={blocked || approve.isPending || reject.isPending} />
          <Button title={t('registration.review.reject')} variant="outline" onPress={() => (setFormError(null), setRejectOpen(true))} disabled={approve.isPending || reject.isPending} />
        </ActionBar>
      ) : null}

      <BottomSheet
        visible={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title={t('registration.review.reject')}
        footer={<Button title={t('registration.review.confirmReject')} variant="danger" onPress={startReject} style={{ flex: 1 }} />}
      >
        <TextField label={t('registration.review.rejectReason')} required hint={t('registration.review.rejectHint')} value={reason} onChangeText={setReason} multiline maxLength={1000} error={rejectOpen ? formError : null} />
      </BottomSheet>

      <ConfirmSheet
        visible={confirm === 'approve'}
        title={tr('Approve this request?')}
        message={tr('Accounts are created for {{parent}} and {{student}}, and the child joins {{class}}.', { parent: r.parentName, student: r.studentName, class: className })}
        confirmLabel={t('registration.review.approve')}
        loading={approve.isPending}
        onConfirm={() => approve.mutate()}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmSheet
        visible={confirm === 'reject'}
        title={tr('Reject this request?')}
        message={tr('The request is rejected with the reason you entered. This cannot be undone.')}
        confirmLabel={t('registration.review.confirmReject')}
        destructive
        loading={reject.isPending}
        onConfirm={() => reject.mutate()}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
}
