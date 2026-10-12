import type { TablerIcon } from '../components/ui/Icon';
import type { ScreenName } from './rbac';
import IconSchool from '@tabler/icons-react-native/IconSchool';
import IconChalkboard from '@tabler/icons-react-native/IconChalkboard';
import IconUsersGroup from '@tabler/icons-react-native/IconUsersGroup';
import IconCalendarCheck from '@tabler/icons-react-native/IconCalendarCheck';
import IconReportMoney from '@tabler/icons-react-native/IconReportMoney';
import IconFileInvoice from '@tabler/icons-react-native/IconFileInvoice';
import IconUserPlus from '@tabler/icons-react-native/IconUserPlus';
import IconUsers from '@tabler/icons-react-native/IconUsers';
import IconCash from '@tabler/icons-react-native/IconCash';
import IconCalendarWeek from '@tabler/icons-react-native/IconCalendarWeek';
import IconBook from '@tabler/icons-react-native/IconBook';
import IconAward from '@tabler/icons-react-native/IconAward';
import IconSpeakerphone from '@tabler/icons-react-native/IconSpeakerphone';
import IconMessages from '@tabler/icons-react-native/IconMessages';
import IconPencil from '@tabler/icons-react-native/IconPencil';
import IconFolder from '@tabler/icons-react-native/IconFolder';
import IconLayoutDashboard from '@tabler/icons-react-native/IconLayoutDashboard';

// Tabler icons matching the web sidebar (ti ti-*); role dashboards and unlisted screens use the dashboard icon
const ICONS: Partial<Record<ScreenName, TablerIcon>> = {
  Students: IconSchool, Teachers: IconChalkboard, Classes: IconUsersGroup, Attendance: IconCalendarCheck, Finance: IconReportMoney,
  Invoices: IconFileInvoice, Registrations: IconUserPlus, MyChildren: IconUsers, Fees: IconCash, Timetable: IconCalendarWeek,
  Homework: IconBook, Results: IconAward, Notices: IconSpeakerphone, Messages: IconMessages, GradeEntry: IconPencil, Resources: IconFolder,
};

export const iconFor = (screen: ScreenName): TablerIcon => ICONS[screen] ?? IconLayoutDashboard;
