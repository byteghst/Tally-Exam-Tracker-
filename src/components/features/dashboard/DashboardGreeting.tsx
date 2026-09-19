import { computeGreetingSummary } from '@/lib/greeting';
import type { Exam, Deadline, Task } from '@/types';

interface DashboardGreetingProps {
  userName?: string;
  exams: Exam[];
  deadlines: Deadline[];
  tasks: Task[];
}

export function DashboardGreeting({ userName, exams, deadlines, tasks }: DashboardGreetingProps) {
  const { timeGreeting, headline } = computeGreetingSummary({ exams, deadlines, tasks });

  return (
    <header>
      <h1 className="font-display text-2xl font-semibold text-ink">
        {timeGreeting}
        {userName ? `, ${userName}` : ''}.
      </h1>
      <p className="mt-0.5 text-ink-muted">{headline}</p>
    </header>
  );
}
