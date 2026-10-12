import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { assignmentKeys, fetchAssignmentPage, type Assignment } from '../../api/assignments';
import { useSubjectStudent } from '../../api/students';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import { isScreenAllowed } from '../../navigation/rbac';
import { tr } from '../../i18n';
import { type Tone } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import TaskRow from '../../components/ui/TaskRow';
import RecordList from '../../components/ui/RecordList';

const STATUS: Record<Assignment['status'], { label: string; tone: Tone }> = {
  pending: { label: 'Waiting for approval', tone: 'warning' },
  approved: { label: 'Published', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  draft: { label: 'Draft', tone: 'neutral' },
};

/** GET /api/assignments (backend scopes it per role). Staff who may create homework get the "New homework" action. */
export default function AssignmentsScreen() {
  const { spacing } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const me = useSubjectStudent();
  // write actions only for staff who may create homework: never in self/child mode
  const canCreate = !!user && me.mode === 'staff' && isScreenAllowed('AssignmentForm', user.role);

  return (
    <View style={{ flex: 1 }}>
      <RecordList<Assignment>
        queryKey={assignmentKeys.list(me.id)}
        fetchPage={(page) => fetchAssignmentPage(page, me.id)}
        keyExtractor={(a) => String(a.id)}
        search={{ placeholder: tr('Search homework'), match: (a, q) => a.title.toLowerCase().includes(q) }}
        filters={canCreate ? <Button title={`+ ${tr('New homework')}`} onPress={() => navigation.navigate('AssignmentForm')} style={{ marginTop: spacing.xs }} /> : undefined}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
            <TaskRow
              title={item.title}
              subtitle={[item.subject?.title, item.class?.name].filter(Boolean).join(' · ')}
              dueDate={item.dueDate}
              open={item.status === 'approved'}
              status={{ label: tr(STATUS[item.status].label), tone: STATUS[item.status].tone }}
            />
          </View>
        )}
        emptyTitle={tr('No homework yet')}
      />
    </View>
  );
}
