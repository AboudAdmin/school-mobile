// Teacher dashboard on the DashboardScreen scaffold: Attention → Today → My classes → Shortcuts.
// Single source: GET /attendance/my-sessions (the rules live in teacherAttention.ts).
import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import IconClock from '@tabler/icons-react-native/IconClock';
import { tr } from '../../i18n';
import { useMySessions } from '../../api/attendance';
import AttentionStrip, { type Attention } from '../../components/ui/AttentionStrip';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DashboardScreen from '../../components/ui/DashboardScreen';
import EventRow from '../../components/ui/EventRow';
import Section from '../../components/ui/Section';
import StatTile from '../../components/ui/StatTile';
import { useTheme } from '../../theme/ThemeProvider';
import { focusSession, teacherAttention, type AttentionRule } from './teacherAttention';

export default function TeacherDashboard() {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const sessions = useMySessions();
  const list = sessions.data ?? [];
  const now = new Date();
  const taken = list.filter((s) => s.attendance.taken).length;
  const focus = focusSession(list, now);
  const open = (id: number) => navigation.navigate('AttendanceSession', { id });

  const text = (r: AttentionRule) => {
    const name = r.session.class?.name ?? '—';
    if (r.kind === 'missed') return tr('Attendance not taken: {{class}}, {{time}}', { class: name, time: r.session.startTime.slice(0, 5) });
    if (r.kind === 'now') return tr('{{class}} is in progress. Take attendance.', { class: name });
    return tr('Low attendance in {{class}}: {{rate}}%', { class: name, rate: r.rate });
  };
  const items: Attention[] = teacherAttention(list, now).map((r) => ({ tone: r.tone, text: text(r), onPress: () => open(r.session.id) }));

  const stateLabel = { now: tr('In progress'), next: tr('Up next'), missed: tr('Attendance not taken') };

  return (
    <DashboardScreen
      refreshing={sessions.isRefetching}
      onRefresh={() => sessions.refetch()}
      blocks={[
        {
          key: 'attention',
          node: (
            <Section title={tr('Needs attention')} state={sessions}>
              <AttentionStrip items={items} />
            </Section>
          ),
        },
        {
          key: 'today',
          node: (
            <Section title={tr('Today')} state={sessions}>
              {focus ? (
                <View style={{ gap: spacing.md }}>
                  <EventRow
                    last
                    time={focus.session.startTime.slice(0, 5)}
                    title={`${focus.session.class?.name ?? '—'} · ${focus.session.subject?.title ?? ''}`}
                    subtitle={focus.session.room ?? undefined}
                    trailing={<Badge tone={focus.state === 'missed' ? 'danger' : focus.state === 'now' ? 'warning' : 'info'} label={stateLabel[focus.state]} />}
                  />
                  <Button title={tr('Take attendance')} onPress={() => open(focus.session.id)} />
                </View>
              ) : (
                <Text style={[typography.body, { color: colors.textMuted }]}>{list.length ? tr('Attendance taken for every class') : tr('No classes today')}</Text>
              )}
            </Section>
          ),
        },
        {
          key: 'classes',
          node: (
            <Section title={tr('My classes')} hint={tr('Is attendance up to date?')} action={{ label: tr('See all'), onPress: () => navigation.navigate('Attendance') }} state={sessions}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <StatTile label={tr('Taken')} value={`${taken}/${list.length}`} icon={IconCircleCheck} tone="success" progress={list.length ? (taken / list.length) * 100 : 0} />
                <StatTile label={tr('To take')} value={String(list.length - taken)} icon={IconClock} tone={list.length - taken ? 'warning' : 'success'} />
              </View>
            </Section>
          ),
        },
        {
          key: 'shortcuts',
          node: (
            <View style={{ gap: spacing.sm }}>
              <Button title={tr('Enter grades')} variant="outline" onPress={() => navigation.navigate('GradeEntry')} />
              <Button title={tr('New homework')} variant="outline" onPress={() => navigation.navigate('AssignmentForm')} />
              <Button title={tr('Messages')} variant="ghost" onPress={() => navigation.navigate('Messages')} />
            </View>
          ),
        },
      ]}
    />
  );
}
