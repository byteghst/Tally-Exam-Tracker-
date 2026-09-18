import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Dashboard } from '@/pages/Dashboard';
import { Exams } from '@/pages/Exams';
import { ExamDetail } from '@/pages/ExamDetail';
import { Deadlines } from '@/pages/Deadlines';
import { Syllabus } from '@/pages/Syllabus';
import { Tasks } from '@/pages/Tasks';
import { Calendar } from '@/pages/Calendar';
import { Analytics } from '@/pages/Analytics';
import { History } from '@/pages/History';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'exams', element: <Exams /> },
      { path: 'exams/daily', element: <Exams /> },
      { path: 'exams/weekly', element: <Exams /> },
      { path: 'exams/:id', element: <ExamDetail /> },
      { path: 'deadlines', element: <Deadlines /> },
      { path: 'syllabus', element: <Syllabus /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'history', element: <History /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> }
    ]
  }
]);
