// THROWAWAY dev kitchen sink (design-system validation) — delete before release (TASK-145). Only reachable in __DEV__ from the account sheet.
import React, { useRef, useState } from 'react';
import { Modal as RNModal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import IconPlus from '@tabler/icons-react-native/IconPlus';
import IconDownload from '@tabler/icons-react-native/IconDownload';
import IconPencil from '@tabler/icons-react-native/IconPencil';
import IconTrash from '@tabler/icons-react-native/IconTrash';
import IconShare from '@tabler/icons-react-native/IconShare';
import IconDotsVertical from '@tabler/icons-react-native/IconDotsVertical';
import IconSchool from '@tabler/icons-react-native/IconSchool';
import IconCash from '@tabler/icons-react-native/IconCash';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import IconMoon from '@tabler/icons-react-native/IconMoon';
import IconSun from '@tabler/icons-react-native/IconSun';
import apiClient from '../../api/apiClient';
import { tokenService } from '../../api/tokenService';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../theme/motion';
import { isRTL } from '../../i18n';
import ActionSheet from '../../components/ui/ActionSheet';
import AppHeader from '../../components/ui/AppHeader';
import AttentionStrip from '../../components/ui/AttentionStrip';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import BottomSheet from '../../components/ui/BottomSheet';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmSheet from '../../components/ui/ConfirmSheet';
import DataCard from '../../components/ui/DataCard';
import DatePickerField from '../../components/ui/DatePickerField';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import FAB from '../../components/ui/FAB';
import FilterChips from '../../components/ui/FilterChips';
import KeyValueList from '../../components/ui/KeyValueList';
import ListItem from '../../components/ui/ListItem';
import LoadingState from '../../components/ui/LoadingState';
import ProgressBar from '../../components/ui/ProgressBar';
import RecordList from '../../components/ui/RecordList';
import ScorePill from '../../components/ui/ScorePill';
import SearchBar from '../../components/ui/SearchBar';
import Section from '../../components/ui/Section';
import SegmentedControl from '../../components/ui/SegmentedControl';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import Num from '../../components/ui/Num';
import StatTile from '../../components/ui/StatTile';
import TextField, { PhoneField } from '../../components/ui/TextField';
import NumberField, { MoneyField } from '../../components/ui/NumberField';
import TimeField from '../../components/ui/TimeField';
import SwitchRow from '../../components/ui/SwitchRow';
import RadioGroup from '../../components/ui/RadioGroup';
import MultiSelect from '../../components/ui/MultiSelect';
import FileField, { uploadFile, type PickedFile } from '../../components/ui/FileField';
import TopTabs from '../../components/ui/TopTabs';
import { ErrorSummary, FormScroll, useForm } from '../../components/ui/Form';
import { ToastProvider, useToast } from '../../components/ui/Toast';
import { BarChart, DonutChart, LineChart } from '../../components/charts/Charts';

type Tab = 'form' | 'base' | 'display' | 'status' | 'overlays' | 'list' | 'charts' | 'checks';

function H({ children }: { children: string }) {
  const { colors, typography } = useTheme();
  return <Text style={[typography.label, { color: colors.textMuted, textTransform: 'uppercase' }]}>{children}</Text>;
}

/** TASK-130: form pattern — labels above, required/optional, validate on blur then on input, submit summary, keyboard avoidance. */
const FORM_LABELS = { name: 'Full name', email: 'Email', phone: 'Phone', classId: 'Class', startDate: 'Start date', startTime: 'Start time', hours: 'Hours per week', fee: 'Monthly fee', gender: 'Gender', subjects: 'Subjects', notes: 'Notes' };
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Arabic', 'French', 'English', 'History', 'Geography', 'Computer science', 'Islamic education', 'Sport'].map((l, i) => ({ value: i + 1, label: l }));
function FormTab() {
  const toast = useToast();
  const scroll = useRef<ScrollView>(null);
  const f = useForm({ name: '', email: '', phone: '', classId: null as string | null, startDate: null as string | null, startTime: null as string | null, hours: null as number | null, fee: null as number | null, gender: null as string | null, subjects: [] as number[], notify: true, notes: '' }, (v) => ({
    name: v.name.trim().length < 3 ? 'At least 3 characters' : undefined,
    email: !v.email.trim() ? 'Required' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()) ? undefined : 'Enter a valid email address',
    classId: v.classId ? undefined : 'Required',
    phone: v.phone.replace(/\D/g, '').length < 8 ? 'At least 8 digits' : undefined,
    startDate: v.startDate ? undefined : 'Required',
    startTime: v.startTime ? undefined : 'Required',
    hours: v.hours == null ? 'Required' : v.hours > 40 ? 'At most 40' : undefined,
    fee: v.fee == null ? 'Required' : undefined,
    gender: v.gender ? undefined : 'Required',
    subjects: v.subjects.length ? undefined : 'Pick at least one',
  }));
  const onSubmit = () => {
    if (!f.submit(() => toast({ message: 'Form saved', tone: 'success' }))) scroll.current?.scrollTo({ y: 0, animated: true });
  };
  return (
    <FormScroll ref={scroll} actions={<Button title="Save" onPress={onSubmit} />}>
      <ErrorSummary items={f.summary} labels={FORM_LABELS} />
      <Card>
        <TextField label={FORM_LABELS.name} required autoCapitalize="words" autoComplete="name" {...f.text('name')} />
        <TextField label={FORM_LABELS.email} required keyboardType="email-address" autoCapitalize="none" autoComplete="email" {...f.text('email')} />
        <PhoneField label={FORM_LABELS.phone} required placeholder="+216 22 123 456" {...f.text('phone')} />
        <Select label={FORM_LABELS.classId} required options={[{ value: 'a', label: 'Class 10A' }, { value: 'b', label: 'Grade 10 - Section A' }]} {...f.pick('classId')} />
        <DatePickerField label={FORM_LABELS.startDate} required {...f.pick('startDate')} />
        <TimeField label={FORM_LABELS.startTime} required {...f.pick('startTime')} />
        <NumberField label={FORM_LABELS.hours} required suffix="h" {...f.input('hours')} />
        <MoneyField label={FORM_LABELS.fee} required {...f.input('fee')} />
        <RadioGroup label={FORM_LABELS.gender} required options={[{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]} {...f.pick('gender')} />
        <MultiSelect label={FORM_LABELS.subjects} required options={SUBJECTS} {...f.pick('subjects')} />
        <SwitchRow label="Notify parents" description="Send an SMS when the schedule changes" value={f.values.notify} onChange={f.set('notify')} />
        <DemoUpload label="Photo" accept="image" />
        <DemoUpload label="Document" accept="document" />
        <TextField label={FORM_LABELS.notes} optional multiline style={{ minHeight: 96, textAlignVertical: 'top' }} {...f.text('notes')} />
      </Card>
    </FormScroll>
  );
}

// TASK-132 demo target: a real multipart endpoint (POST /resources, field "resourceFile"); removing the file deletes the resource again.
function DemoUpload({ label, accept }: { label: string; accept: 'image' | 'document' }) {
  const { colors, typography } = useTheme();
  const [id, setId] = useState<number | null>(null);
  return (
    <>
      <FileField<{ data: { id: number } }>
        label={label}
        optional
        accept={accept}
        upload={(file: PickedFile, onProgress) => uploadFile('/resources', 'resourceFile', file, { title: `Kitchen sink upload ${file.name}` }, onProgress)}
        onChange={(r) => {
          if (!r && id) apiClient.delete(`/resources/${id}`).catch(() => {});
          setId(r ? r.data.id : null);
        }}
      />
      {id ? <Text style={[typography.caption, { color: colors.textMuted, marginTop: -8, marginBottom: 12 }]}>resource #{id} created on the server</Text> : null}
    </>
  );
}

/** TASK-126: existing components restyled. */
function BaseTab() {
  const { colors, spacing, typography } = useTheme();
  const [sel, setSel] = useState<string | null>('b');
  const [date, setDate] = useState<string | null>('2026-10-07');
  const [chip, setChip] = useState<'all' | 'active' | 'inactive'>('all');
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
      <H>Button</H>
      <View style={{ gap: spacing.sm }}>
        <Button title="Primary" icon={IconPlus} />
        <Button title="Secondary" variant="secondary" />
        <Button title="Outline" variant="outline" icon={IconDownload} />
        <Button title="Ghost" variant="ghost" />
        <Button title="Danger" variant="danger" icon={IconTrash} />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button title="Small" size="sm" />
          <Button title="Loading" size="sm" loading />
          <Button title="Disabled" size="sm" disabled />
        </View>
      </View>
      <H>Badge</H>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {(['primary', 'success', 'warning', 'danger', 'info', 'neutral'] as const).map((t) => (
          <Badge key={t} tone={t} label={t} icon={t === 'success' ? IconCircleCheck : undefined} />
        ))}
      </View>
      <H>FilterChips</H>
      <FilterChips value={chip} onChange={setChip} options={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      <H>Card · TextField · Select · DatePickerField</H>
      <Card>
        <TextField label="Full name" placeholder="Sara Ben Ali" required hint="As on the ID card" />
        <TextField label="Email" value="not-an-email" error="Enter a valid email address" />
        <Select label="Class" value={sel} onChange={setSel} options={[{ value: 'a', label: 'Class 10A' }, { value: 'b', label: 'Grade 10 - Section A' }]} />
        <DatePickerField label="Due date" value={date} onChange={setDate} />
      </Card>
      <H>ListItem</H>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ListItem title="Sara Ben Ali" subtitle="Class 10A · sara@example.com" leading={<Avatar name="Sara Ben Ali" />} trailing={<Badge label="Active" tone="success" />} onPress={() => {}} />
        <ListItem title="Static row" subtitle="No chevron when not tappable" last />
      </Card>
      <H>StatTile · Section</H>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <StatTile label="Students" value="12" icon={IconSchool} tone="primary" onPress={() => {}} />
        <StatTile label="Collection rate" value="63%" icon={IconCash} tone="danger" progress={63} hint="12,201.00 of 19,500.40 DT" />
      </View>
      <Section title="Needs attention" hint="Section with header action" action={{ label: 'See all', onPress: () => {} }}>
        <Text style={[typography.body, { color: colors.text }]}>Section content</Text>
      </Section>
      <H>TASK-004 · type roles, Num, delta, plain/skeleton Section, ListItem value</H>
      <Card style={{ gap: spacing.sm }}>
        <Text style={[typography.overline, { color: colors.textMuted }]}>Overline · نظرة عامة</Text>
        <Text style={[typography.displayNumeric, { color: colors.text }]}>
          <Num>1.285,00 DT</Num>
        </Text>
        <Text style={[typography.body, { color: colors.text }]}>
          الدرجة <Num>13.50/20</Num> · الهاتف <Num>+216 22 123 456</Num>
        </Text>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <StatTile label="Collected" value="12.201,00 DT" icon={IconCash} tone="success" delta={<Text style={[typography.label, { color: colors.success }]}><Num>+4%</Num></Text>} />
        <StatTile label="Average" value="13.50/20" icon={IconSchool} tone="info" />
      </View>
      <Section variant="plain" title="Plain section" hint="No card around it">
        <Text style={[typography.body, { color: colors.text }]}>Content on the page</Text>
      </Section>
      <Section title="Skeleton loading" state={{ isPending: true, isError: false, refetch: () => {} }} />
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ListItem title="Abdullah Mahmoudi" subtitle="FAC-2026-000012" value="1.285,00 DT" meta="Due 15 Oct" />
        <ListItem title="Mohamed Ali Wartani" value="13.50/20" meta="Maths" onPress={() => {}} last />
      </Card>
      <H>EmptyState · ErrorState · LoadingState</H>
      <Card style={{ padding: 0 }}>
        <EmptyState title="No students yet" message="Add the first student to get started." actionLabel="Add student" onAction={() => {}} />
      </Card>
      <ErrorState inline message="Could not load data." onRetry={() => {}} />
      <Card style={{ padding: 0 }}>
        <LoadingState rows={2} />
      </Card>
    </ScrollView>
  );
}

/** TASK-127: new display components. */
function DisplayTab() {
  const { spacing } = useTheme();
  const [q, setQ] = useState('');
  const [seg, setSeg] = useState<'messages' | 'ann'>('messages');
  const [top, setTop] = useState<'profile' | 'grades' | 'fees'>('profile');
  return (
    <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xxl }}>
      <AppHeader title="Sara Ben Ali" subtitle="Class 10A · Student" onBack={() => {}} actions={[{ icon: IconPencil, label: 'Edit', onPress: () => {} }, { icon: IconDotsVertical, label: 'More actions', onPress: () => {} }]} />
      <TopTabs value={top} onChange={setTop} tabs={[{ value: 'profile', label: 'Profile' }, { value: 'grades', label: 'Grades', count: 4 }, { value: 'fees', label: 'Fees' }]} />
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg }}>
        <H>SearchBar</H>
        <SearchBar value={q} onChangeText={setQ} placeholder="Search by name or email" />
        <H>SegmentedControl</H>
        <SegmentedControl value={seg} onChange={setSeg} options={[{ value: 'messages', label: 'Messages' }, { value: 'ann', label: 'Announcements' }]} />
        <H>KeyValueList</H>
        <KeyValueList rows={[{ label: 'Email', value: 'sara@example.com' }, { label: 'Class', value: 'Class 10A · A1' }, { label: 'Parent', value: null }]} />
        <H>ProgressBar</H>
        <ProgressBar value={72} label="Attendance" tone="success" />
        <ProgressBar value={35} label="Collection" tone="danger" />
        <H>Avatar (initials · image · broken image)</H>
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <Avatar name="Sara Ben Ali" />
          <Avatar name="School logo" uri="https://khaledbenwalid.com/assets/img/branding/icon-192.png" size={56} />
          <Avatar name="Missing Photo" uri="https://khaledbenwalid.com/does-not-exist.png" size={56} />
        </View>
        <H>DataCard</H>
        <DataCard
          title="Abdullah Mahmoudi"
          subtitle="FAC-2026-000012"
          leading={<Avatar name="Abdullah Mahmoudi" />}
          trailing={<Badge label="Paid" tone="success" />}
          meta={[{ label: 'Total', value: '1,284.00 DT' }, { label: 'Paid', value: '1,284.00 DT' }, { label: 'Due', value: '15 Oct 2026' }, { label: 'Balance', value: '0.00 DT' }]}
          onPress={() => {}}
        />
      </View>
    </ScrollView>
  );
}

/** TASK-128: status components. */
function StatusTab() {
  const { colors, spacing, typography } = useTheme();
  const reduced = useReducedMotion();
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
      <H>ScorePill (/20, ≥75 % / ≥50 %)</H>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <ScorePill score={17.5} label="Maths" />
        <ScorePill score={12} label="French" />
        <ScorePill score={7} label="Arabic" />
        <ScorePill score={null} label="Science" />
        <ScorePill score={84} max={100} label="Exam" />
      </View>
      <H>AttentionStrip</H>
      <AttentionStrip
        items={[
          { tone: 'danger', text: '1 invoice is overdue · 3,649.70 DT', onPress: () => {} },
          { tone: 'warning', text: '6 students have no linked parent', onPress: () => {} },
          { tone: 'info', text: '2 exams scheduled in the next 7 days' },
        ]}
      />
      <AttentionStrip items={[]} />
      <H>Skeleton</H>
      <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>
        Reduce motion: {reduced ? 'ON (static)' : 'off (pulsing)'}
      </Text>
      <View testID="skeleton-sample" style={{ gap: spacing.sm }}>
        <Skeleton width="80%" height={16} />
        <Skeleton width="50%" height={12} />
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <Skeleton width={48} height={48} round />
          <Skeleton width="60%" height={12} />
        </View>
      </View>
    </ScrollView>
  );
}

/** TASK-129: overlays & feedback. */
function OverlaysTab() {
  const { colors, spacing, typography } = useTheme();
  const toast = useToast();
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [actions, setActions] = useState(false);
  const [log, setLog] = useState('—');
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 120 }}>
        <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>
          Last event: {log}
        </Text>
        <Button title="Open bottom sheet" variant="outline" onPress={() => setSheet(true)} />
        <Button title="Open confirm sheet" variant="outline" onPress={() => setConfirm(true)} />
        <Button title="Open action sheet" variant="outline" onPress={() => setActions(true)} />
        <Button title="Toast: success (5 s)" variant="secondary" onPress={() => (setLog('toast shown ' + new Date().toLocaleTimeString()), toast({ message: 'Payment recorded', tone: 'success' }))} />
        <Button title="Toast: with action (persistent)" variant="secondary" onPress={() => toast({ message: 'Student deleted', tone: 'info', action: { label: 'Undo', onPress: () => setLog('undo pressed') } })} />
        <Button title="Toast: error (8 s)" variant="secondary" onPress={() => toast({ message: 'Could not save attendance', tone: 'danger', duration: 8000 })} />
      </ScrollView>
      <FAB icon={IconPlus} label="New homework" extended onPress={() => setLog('FAB pressed')} />
      <BottomSheet visible={sheet} onClose={() => (setSheet(false), setLog('sheet closed'))} title="Bottom sheet" footer={<Button title="Done" onPress={() => (setSheet(false), setLog('sheet done'))} style={{ flex: 1 }} />}>
        <Text style={[typography.body, { color: colors.text }]}>Sheets replace the old centred modal. Close with the X, Back, the backdrop or Done.</Text>
      </BottomSheet>
      <ConfirmSheet
        visible={confirm}
        title="Delete student?"
        message="Sara Ben Ali and her account will be permanently deleted. Grades and payments stay in reports."
        confirmLabel="Delete"
        destructive
        onConfirm={() => (setConfirm(false), setLog('confirmed delete'))}
        onCancel={() => (setConfirm(false), setLog('cancelled'))}
      />
      <ActionSheet
        visible={actions}
        title="Invoice FAC-2026-000012"
        onClose={() => setActions(false)}
        actions={[
          { label: 'Share PDF', icon: IconShare, onPress: () => setLog('share') },
          { label: 'Edit', icon: IconPencil, onPress: () => setLog('edit') },
          { label: 'Cancel invoice', icon: IconTrash, destructive: true, onPress: () => setLog('cancel invoice') },
        ]}
      />
    </View>
  );
}

interface StudentRow {
  id: number;
  user: { name: string; email: string; status: string };
  class?: { name: string } | null;
}
function ListTab() {
  const [status, setStatus] = useState<'' | 'active' | 'inactive'>('');
  return (
    <RecordList<StudentRow>
      queryKey={['students', { status }]}
      fetchPage={async (page) => {
        const res = await apiClient.get('/students', { params: { page, pageSize: 4, status: status || undefined } });
        return { items: res.data.data, hasNextPage: res.data.pagination.hasNextPage };
      }}
      keyExtractor={(s) => String(s.id)}
      search={{ placeholder: 'Search loaded students', match: (s, q) => s.user.name.toLowerCase().includes(q) || s.user.email.toLowerCase().includes(q) }}
      filters={<FilterChips value={status} onChange={setStatus} options={[{ value: '', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />}
      renderItem={({ item }) => (
        <ListItem
          title={item.user.name}
          subtitle={`${item.class?.name ?? '—'} · ${item.user.email}`}
          leading={<Avatar name={item.user.name} />}
          trailing={<Badge label={item.user.status} tone={item.user.status === 'active' ? 'success' : 'warning'} />}
        />
      )}
      emptyTitle="No students match"
      emptyMessage="Try another filter."
    />
  );
}

function ChartsTab() {
  const { colors, spacing } = useTheme();
  const { data, error, isPending } = useQuery({ queryKey: ['reports-overview', 90], queryFn: async () => (await apiClient.get('/reports/overview', { params: { days: 90 } })).data });
  if (isPending) return <LoadingState />;
  if (error || !data) return <ErrorState message="Could not load data." />;
  const daily: { date: string; present: number; late: number; absent: number }[] = data.attendance.daily;
  const labels = daily.map((d) => d.date.slice(5));
  const roles: Record<string, number> = data.users.byRole;
  const palette = [colors.primary, colors.success, colors.warning, colors.info, colors.danger];
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
      <Section title="Attendance rate over time">
        <LineChart labels={labels} data={daily.map((d) => Math.round(((d.present + d.late) / Math.max(d.present + d.late + d.absent, 1)) * 100))} color={colors.primary} suffix="%" maxValue={100} />
      </Section>
      <Section title="Daily attendance">
        <BarChart
          labels={labels}
          series={[
            { name: 'Present', color: colors.success, data: daily.map((d) => d.present) },
            { name: 'Late', color: colors.warning, data: daily.map((d) => d.late) },
            { name: 'Absent', color: colors.danger, data: daily.map((d) => d.absent) },
          ]}
        />
      </Section>
      <Section title="Users by role">
        <DonutChart centerLabel="users" items={Object.entries(roles).map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }))} />
      </Section>
    </ScrollView>
  );
}

// RN-TASK-002 check: invalid access token + 3 parallel requests must trigger exactly ONE refresh, then all succeed
async function testRefresh(): Promise<string> {
  let refreshCalls = 0;
  const id = axios.interceptors.request.use((c) => {
    if (c.url?.includes('/auth/refresh')) refreshCalls++;
    return c;
  });
  try {
    await tokenService.setAccessToken('invalid.token.value');
    const results = await Promise.allSettled([1, 2, 3].map(() => apiClient.get('/students', { params: { pageSize: 1 } })));
    return `refresh calls: ${refreshCalls}, requests ok: ${results.filter((r) => r.status === 'fulfilled').length}/3`;
  } finally {
    axios.interceptors.request.eject(id);
  }
}

function ChecksTab({ onClose }: { onClose: () => void }) {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const [result, setResult] = useState('');
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>isRTL(): {String(isRTL())}</Text>
      <Button title="Test token refresh" variant="outline" onPress={async () => setResult(await testRefresh())} />
      {result ? <Text style={[typography.body, { color: colors.text }]}>{result}</Text> : null}
      {(['Teachers', 'Students', 'Fees', 'Registrations'] as const).map((s) => (
        <Button key={s} title={`Force ${s}`} variant="ghost" onPress={() => (onClose(), navigation.navigate(s))} />
      ))}
    </ScrollView>
  );
}

export default function KitchenSink({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, isDark, setMode } = useTheme();
  const [tab, setTab] = useState<Tab>('form');
  return (
    <RNModal visible={visible} onRequestClose={onClose} animationType="slide">
      {/* own toast host: this full-screen modal would otherwise cover the app-level toasts */}
      <ToastProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <AppHeader
          title="Kitchen sink"
          subtitle={`${isDark ? 'Dark' : 'Light'} · ${isRTL() ? 'RTL' : 'LTR'}`}
          onBack={onClose}
          actions={[{ icon: isDark ? IconSun : IconMoon, label: isDark ? 'Light theme' : 'Dark theme', onPress: () => setMode(isDark ? 'light' : 'dark') }]}
        />
        <TopTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'form', label: 'Form' },
            { value: 'base', label: 'Base' },
            { value: 'display', label: 'Display' },
            { value: 'status', label: 'Status' },
            { value: 'overlays', label: 'Overlays' },
            { value: 'list', label: 'List' },
            { value: 'charts', label: 'Charts' },
            { value: 'checks', label: 'Checks' },
          ]}
        />
        <View style={{ flex: 1 }}>
          {tab === 'form' ? <FormTab /> : null}
          {tab === 'base' ? <BaseTab /> : null}
          {tab === 'display' ? <DisplayTab /> : null}
          {tab === 'status' ? <StatusTab /> : null}
          {tab === 'overlays' ? <OverlaysTab /> : null}
          {tab === 'list' ? <ListTab /> : null}
          {tab === 'charts' ? <ChartsTab /> : null}
          {tab === 'checks' ? <ChecksTab onClose={onClose} /> : null}
        </View>
      </SafeAreaView>
      </ToastProvider>
    </RNModal>
  );
}
