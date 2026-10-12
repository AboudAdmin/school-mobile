import type { ComponentType } from 'react';
import type { ScreenName } from './rbac';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import AdminDashboard from '../screens/dashboard/AdminDashboard';
import StudentsScreen from '../screens/students/StudentsScreen';
import StudentDetailScreen from '../screens/students/StudentDetailScreen';
import TeachersScreen from '../screens/teachers/TeachersScreen';
import TeacherDetailScreen from '../screens/teachers/TeacherDetailScreen';
import ClassesScreen from '../screens/classes/ClassesScreen';
import FinanceScreen from '../screens/finance/FinanceScreen';
import InvoicesScreen from '../screens/finance/InvoicesScreen';
import InvoiceDetailScreen from '../screens/finance/InvoiceDetailScreen';
import SecretaryDashboard from '../screens/dashboard/SecretaryDashboard';
import RegistrationsScreen from '../screens/registration/RegistrationsScreen';
import RegistrationDetailScreen from '../screens/registration/RegistrationDetailScreen';
import TeacherDashboard from '../screens/dashboard/TeacherDashboard';
import ParentDashboard from '../screens/parent/ParentDashboard';
import MyChildrenScreen from '../screens/parent/MyChildrenScreen';
import FeesScreen from '../screens/parent/FeesScreen';
import ChildAttendanceScreen from '../screens/parent/ChildAttendanceScreen';
import SessionsScreen from '../screens/attendance/SessionsScreen';
import AttendanceSessionScreen from '../screens/attendance/AttendanceSessionScreen';
import GradeEntryScreen from '../screens/grades/GradeEntryScreen';
import AssignmentsScreen from '../screens/assignments/AssignmentsScreen';
import AssignmentFormScreen from '../screens/assignments/AssignmentFormScreen';
import StudentDashboard from '../screens/dashboard/StudentDashboard';
import TimetableScreen from '../screens/student/TimetableScreen';
import ResultsScreen from '../screens/student/ResultsScreen';
import ResourcesScreen from '../screens/student/ResourcesScreen';
import ConversationList from '../screens/messages/ConversationList';
import Thread from '../screens/messages/Thread';
import Compose from '../screens/messages/Compose';
import Feed from '../screens/announcements/Feed';

// Built screens; everything else stays a placeholder until its role task lands
const SCREENS: Partial<Record<ScreenName, ComponentType>> = {
  AdminDashboard,
  Students: StudentsScreen,
  StudentDetail: StudentDetailScreen,
  Teachers: TeachersScreen,
  TeacherDetail: TeacherDetailScreen,
  Classes: ClassesScreen,
  Finance: FinanceScreen,
  SecretaryDashboard,
  Registrations: RegistrationsScreen,
  RegistrationDetail: RegistrationDetailScreen,
  Invoices: InvoicesScreen,
  InvoiceDetail: InvoiceDetailScreen,
  TeacherDashboard,
  Attendance: SessionsScreen,
  AttendanceSession: AttendanceSessionScreen,
  GradeEntry: GradeEntryScreen,
  Homework: AssignmentsScreen,
  AssignmentForm: AssignmentFormScreen,
  StudentDashboard,
  ParentDashboard,
  MyChildren: MyChildrenScreen,
  Fees: FeesScreen,
  ChildAttendance: ChildAttendanceScreen,
  Timetable: TimetableScreen,
  StudentTimetable: TimetableScreen,
  Results: ResultsScreen,
  StudentResults: ResultsScreen,
  Resources: ResourcesScreen,
  Messages: ConversationList,
  Thread,
  Compose,
  Notices: Feed,
};

export const screenFor = (name: ScreenName): ComponentType => SCREENS[name] ?? PlaceholderScreen;
