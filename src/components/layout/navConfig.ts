import {
  LayoutDashboard,
  FileSpreadsheet,
  Clock,
  BookOpen,
  ListChecks,
  CalendarDays,
  BarChart3,
  History,
  Settings,
  type LucideIcon
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** shown in the mobile bottom bar (max 5, rest go in the "More" sheet) */
  primary?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, primary: true },
  { label: 'Exams', path: '/exams', icon: FileSpreadsheet, primary: true },
  { label: 'Deadlines', path: '/deadlines', icon: Clock, primary: true },
  { label: 'Tasks', path: '/tasks', icon: ListChecks, primary: true },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Syllabus', path: '/syllabus', icon: BookOpen },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'History', path: '/history', icon: History },
  { label: 'Settings', path: '/settings', icon: Settings }
];
