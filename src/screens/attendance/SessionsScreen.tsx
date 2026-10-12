import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { attendanceKeys, fetchMySessions, type Session } from '../../api/attendance';
import { tr } from '../../i18n';
import Badge from '../../components/ui/Badge';
import EventRow from '../../components/ui/EventRow';
import RecordList from '../../components/ui/RecordList';
import { useTheme } from '../../theme/ThemeProvider';

/** GET /api/attendance/my-sessions: today's sessions (a teacher only gets their own). */
export default function SessionsScreen() {
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const { spacing } = useTheme();
  return (
    <RecordList<Session>
      queryKey={attendanceKeys.mySessionsList()}
      fetchPage={async () => ({ items: await fetchMySessions(), hasNextPage: false })}
      keyExtractor={(s) => String(s.id)}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: spacing.lg }}>
          <EventRow
            time={item.startTime.slice(0, 5)}
            title={`${item.class?.name ?? '—'} · ${item.subject?.title ?? ''}`}
            subtitle={`${item.startTime.slice(0, 5)}–${item.endTime.slice(0, 5)}${item.room ? ` · ${item.room}` : ''}`}
            trailing={
              item.attendance.taken ? (
                <Badge tone="success" label={`${item.attendance.present + item.attendance.late}/${item.attendance.total}`} />
              ) : (
                <Badge tone="warning" label={tr('To take')} />
              )
            }
            onPress={() => navigation.navigate('AttendanceSession', { id: item.id })}
          />
        </View>
      )}
      emptyTitle={tr('No classes today')}
      emptyMessage={tr('Sessions from your timetable appear here on the days you teach.')}
    />
  );
}
