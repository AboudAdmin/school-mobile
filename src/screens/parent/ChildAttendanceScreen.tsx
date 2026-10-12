// Attendance of the subject student (a parent's active child): GET /attendance?studentId, newest first.
import React from 'react';
import { View } from 'react-native';
import { fetchAttendancePage, attendanceKeys } from '../../api/attendance';
import { useSubjectStudent } from '../../api/students';
import { loc, tr } from '../../i18n';
import Badge, { type Tone } from '../../components/ui/Badge';
import EventRow from '../../components/ui/EventRow';
import RecordList from '../../components/ui/RecordList';
import ViewingBar from '../../components/ui/ViewingBar';
import { useTheme } from '../../theme/ThemeProvider';

const STATUS: Record<string, { label: string; tone: Tone }> = {
  present: { label: 'Present', tone: 'success' },
  late: { label: 'Late', tone: 'warning' },
  absent: { label: 'Absent', tone: 'danger' },
};

export default function ChildAttendanceScreen() {
  const me = useSubjectStudent();
  const { spacing } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <ViewingBar me={me} />
      <RecordList
        queryKey={attendanceKeys.studentList(me.id)}
        fetchPage={(page) => fetchAttendancePage(me.id!, page)}
        keyExtractor={(r) => String(r.id)}
        renderItem={({ item }) => {
          const st = STATUS[item.status] ?? { label: item.status, tone: 'neutral' as Tone };
          const d = new Date(item.date);
          return (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <EventRow
                time={d.toLocaleDateString(loc(), { day: 'numeric', month: 'short' })}
                title={d.toLocaleDateString(loc(), { weekday: 'long', year: 'numeric' })}
                trailing={<Badge tone={st.tone} label={tr(st.label)} />}
              />
            </View>
          );
        }}
        emptyTitle={tr('No attendance recorded yet')}
      />
    </View>
  );
}
