import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ExamForm } from '@/components/features/exams/ExamForm';
import { useExamStore } from '@/store/examStore';
import { useUIStore } from '@/store/uiStore';
import { calculateScore } from '@/lib/scoring';
import { formatDate } from '@/lib/dates';

export function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exams, hydrate, archiveExam, duplicateExam } = useExamStore();
  const { pushToast } = useUIStore();

  const [editOpen, setEditOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  useEffect(() => {
    if (exams.length === 0) hydrate();
  }, [exams.length, hydrate]);

  const exam = exams.find((e) => e.id === id);

  if (!exam) {
    return (
      <div className="py-6">
        <p className="text-ink-muted">Exam not found.</p>
        <Link to="/exams" className="text-accent">
          Back to Exams
        </Link>
      </div>
    );
  }

  const score = calculateScore(
    {
      correct: exam.correct,
      wrong: exam.wrong,
      unanswered: exam.unanswered,
      positiveMarks: exam.positiveMarks,
      negativeMarks: exam.negativeMarks,
      totalMarks: exam.totalMarks,
      manualScore: exam.manualScoreOverride
    },
    exam.totalQuestions
  );

  async function handleDuplicate() {
    await duplicateExam(exam!.id);
    pushToast('Exam duplicated');
    navigate('/exams');
  }

  async function handleArchive() {
    await archiveExam(exam!.id);
    pushToast('Exam archived');
    navigate('/exams');
  }

  return (
    <div className="space-y-5 py-6">
      <Link to="/exams" className="text-sm text-ink-muted">
        ← Back to Exams
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{exam.name}</h1>
          <p className="text-sm text-ink-muted">{formatDate(exam.date)}</p>
        </div>
        <Badge tone={exam.type === 'daily' ? 'accent' : 'neutral'}>{exam.type}</Badge>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
        <Button size="sm" variant="secondary" onClick={handleDuplicate}>
          Duplicate
        </Button>
        <Button size="sm" variant="danger" onClick={() => setArchiveConfirmOpen(true)}>
          Archive
        </Button>
      </div>

      <GlassCard className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
        <Stat label="Final score" value={score.finalScore} />
        <Stat label="Percentage" value={score.percentage !== null ? `${score.percentage}%` : '—'} />
        <Stat label="Accuracy" value={score.accuracy !== null ? `${score.accuracy}%` : '—'} />
        <Stat label="Rank" value={exam.rank ? `${exam.rank}${exam.participants ? ` / ${exam.participants}` : ''}` : '—'} />
        <Stat label="Correct" value={exam.correct ?? '—'} />
        <Stat label="Wrong" value={exam.wrong ?? '—'} />
        <Stat label="Unanswered" value={exam.unanswered ?? '—'} />
        <Stat label="Attempt rate" value={score.attemptRate !== null ? `${score.attemptRate}%` : '—'} />
      </GlassCard>

      {score.isManualOverride && (
        <p className="text-sm text-ink-faint">
          Final score was manually overridden (calculated value was {score.calculatedScore}).
        </p>
      )}

      {exam.notes && (
        <GlassCard className="p-5">
          <p className="text-sm font-medium text-ink-muted">Notes</p>
          <p className="mt-1 text-ink">{exam.notes}</p>
        </GlassCard>
      )}

      <ExamForm open={editOpen} onClose={() => setEditOpen(false)} exam={exam} />

      <ConfirmDialog
        open={archiveConfirmOpen}
        onClose={() => setArchiveConfirmOpen(false)}
        onConfirm={handleArchive}
        title="Archive this exam?"
        description="It'll be removed from your active exam lists but the data isn't deleted — you can still access it from a backup export."
        confirmLabel="Archive"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="font-display text-lg font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
