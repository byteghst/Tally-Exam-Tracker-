import { Link } from 'react-router-dom';
import { FileSpreadsheet, Clock, ListChecks, Pencil, CalendarX2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge, EmptyState } from '@/components/ui/Badge';
import type { Exam, Deadline, Task } from '@/types';

interface DayAgendaProps {
  exams: Exam[];
  deadlines: Deadline[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditDeadline: (deadline: Deadline) => void;
  onEditTask: (task: Task) => void;
}

export function DayAgenda({
  exams,
  deadlines,
  tasks,
  onToggleTask,
  onEditDeadline,
  onEditTask
}: DayAgendaProps) {
  const isEmpty = exams.length === 0 && deadlines.length === 0 && tasks.length === 0;

  if (isEmpty) {
    return (
      <EmptyState
        title="Nothing on this day"
        description="Exams, deadlines and tasks for the selected date will show up here."
        icon={CalendarX2}
      />
    );
  }

  return (
    <div className="space-y-2">
      {exams.map((exam) => (
        <Link key={exam.id} to={`/exams/${exam.id}`}>
          <GlassCard interactive className="flex items-center gap-3 p-3.5">
            <FileSpreadsheet size={18} className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1 truncate text-ink">{exam.name}</span>
            <Badge tone={exam.type === 'daily' ? 'accent' : 'neutral'}>{exam.type}</Badge>
          </GlassCard>
        </Link>
      ))}

      {deadlines.map((deadline) => (
        <GlassCard key={deadline.id} className="flex items-center gap-3 p-3.5">
          <Clock size={18} className="shrink-0 text-warning" />
          <span className="min-w-0 flex-1 truncate text-ink">{deadline.title}</span>
          <button
            onClick={() => onEditDeadline(deadline)}
            aria-label={`Edit ${deadline.title}`}
            className="shrink-0 rounded-control p-1.5 text-ink-muted hover:bg-white/5 hover:text-ink"
          >
            <Pencil size={16} />
          </button>
        </GlassCard>
      ))}

      {tasks.map((task) => (
        <GlassCard key={task.id} className="flex items-center gap-3 p-3.5">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={() => onToggleTask(task.id)}
            aria-label={`Mark "${task.name}" ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
            className="h-4 w-4 shrink-0 rounded accent-accent"
          />
          <ListChecks size={16} className="shrink-0 text-success" />
          <span
            className={`min-w-0 flex-1 truncate ${
              task.status === 'completed' ? 'text-ink-faint line-through' : 'text-ink'
            }`}
          >
            {task.name}
          </span>
          <button
            onClick={() => onEditTask(task)}
            aria-label={`Edit ${task.name}`}
            className="shrink-0 rounded-control p-1.5 text-ink-muted hover:bg-white/5 hover:text-ink"
          >
            <Pencil size={16} />
          </button>
        </GlassCard>
      ))}
    </div>
  );
}
