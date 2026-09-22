import { useId, useMemo, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { examFormSchema, type ExamFormValues } from '@/lib/validation/examSchema';
import { calculateScore } from '@/lib/scoring';
import { useExamStore } from '@/store/examStore';
import { useUIStore } from '@/store/uiStore';
import { todayISO } from '@/lib/dates';
import type { Exam, ExamStatus, ExamType } from '@/types';

interface ExamFormProps {
  open: boolean;
  onClose: () => void;
  /** Present when editing an existing exam; absent when creating. */
  exam?: Exam;
  /** Locks the type selector — used when opened from /exams/daily or /exams/weekly. */
  defaultType?: ExamType;
}

type FieldErrors = Partial<Record<keyof ExamFormValues, string>>;

function examToFormState(exam?: Exam, defaultType: ExamType = 'daily') {
  return {
    name: exam?.name ?? '',
    type: exam?.type ?? defaultType,
    date: exam?.date ?? todayISO(),
    startTime: exam?.startTime ?? '',
    duration: exam?.duration?.toString() ?? '',
    totalQuestions: exam?.totalQuestions?.toString() ?? '',
    totalMarks: exam?.totalMarks?.toString() ?? '',
    positiveMarks: exam?.positiveMarks?.toString() ?? '1',
    negativeMarks: exam?.negativeMarks?.toString() ?? '0',
    correct: exam?.correct?.toString() ?? '',
    wrong: exam?.wrong?.toString() ?? '',
    unanswered: exam?.unanswered?.toString() ?? '',
    manualScoreOverride: exam?.manualScoreOverride?.toString() ?? '',
    rank: exam?.rank?.toString() ?? '',
    participants: exam?.participants?.toString() ?? '',
    status: exam?.status ?? ('upcoming' as ExamStatus),
    notes: exam?.notes ?? ''
  };
}

export function ExamForm({ open, onClose, exam, defaultType }: ExamFormProps) {
  const { addExam, updateExam } = useExamStore();
  const { pushToast } = useUIStore();
  const isEdit = !!exam;

  const [form, setForm] = useState(() => examToFormState(exam, defaultType));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [useManualOverride, setUseManualOverride] = useState(!!exam?.manualScoreOverride);
  const [submitting, setSubmitting] = useState(false);

  // reset local state whenever a different exam is opened for editing
  const statusFieldId = useId();
  const notesFieldId = useId();
  const [lastExamId, setLastExamId] = useState(exam?.id);
  if (exam?.id !== lastExamId || (!exam && lastExamId)) {
    setLastExamId(exam?.id);
    setForm(examToFormState(exam, defaultType));
    setUseManualOverride(!!exam?.manualScoreOverride);
    setErrors({});
  }

  const liveScore = useMemo(() => {
    const num = (v: string) => (v === '' ? undefined : Number(v));
    return calculateScore(
      {
        correct: num(form.correct),
        wrong: num(form.wrong),
        unanswered: num(form.unanswered),
        positiveMarks: Number(form.positiveMarks) || 0,
        negativeMarks: Number(form.negativeMarks) || 0,
        totalMarks: num(form.totalMarks),
        manualScore: useManualOverride ? num(form.manualScoreOverride) : undefined
      },
      num(form.totalQuestions)
    );
  }, [form, useManualOverride]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    const toValidate: ExamFormValues = {
      ...form,
      duration: form.duration === '' ? '' : Number(form.duration),
      totalQuestions: form.totalQuestions === '' ? '' : Number(form.totalQuestions),
      totalMarks: form.totalMarks === '' ? '' : Number(form.totalMarks),
      positiveMarks: Number(form.positiveMarks),
      negativeMarks: Number(form.negativeMarks),
      correct: form.correct === '' ? '' : Number(form.correct),
      wrong: form.wrong === '' ? '' : Number(form.wrong),
      unanswered: form.unanswered === '' ? '' : Number(form.unanswered),
      manualScoreOverride: form.manualScoreOverride === '' ? '' : Number(form.manualScoreOverride),
      rank: form.rank === '' ? '' : Number(form.rank),
      participants: form.participants === '' ? '' : Number(form.participants)
    } as ExamFormValues;

    const result = examFormSchema.safeParse(toValidate);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ExamFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const v = result.data;
    const numOrUndef = (n: number | '' | undefined) => (n === '' || n === undefined ? undefined : n);

    const payload = {
      name: v.name.trim(),
      type: v.type,
      date: v.date,
      startTime: v.startTime || undefined,
      duration: numOrUndef(v.duration),
      totalQuestions: numOrUndef(v.totalQuestions),
      totalMarks: numOrUndef(v.totalMarks),
      positiveMarks: v.positiveMarks,
      negativeMarks: v.negativeMarks,
      correct: numOrUndef(v.correct),
      wrong: numOrUndef(v.wrong),
      unanswered: numOrUndef(v.unanswered),
      manualScoreOverride: useManualOverride ? numOrUndef(v.manualScoreOverride) : undefined,
      rank: numOrUndef(v.rank),
      participants: numOrUndef(v.participants),
      status: v.status,
      notes: v.notes?.trim() || undefined,
      tagIds: exam?.tagIds ?? []
    };

    try {
      if (isEdit && exam) {
        await updateExam(exam.id, payload);
        pushToast('Exam updated');
      } else {
        await addExam(payload);
        pushToast('Exam added');
      }
      onClose();
    } catch {
      pushToast('Something went wrong saving this exam. Please try again.', undefined, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit exam' : 'Add exam'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {isEdit ? 'Save changes' : 'Add exam'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic info */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Basic info</h3>
          <Input
            label="Exam name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={errors.name}
            placeholder="e.g. Physics Model Test 4"
          />
          <div className="flex gap-2">
            {(['daily', 'weekly'] as ExamType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`flex-1 rounded-control border px-3 py-2 text-sm font-medium capitalize ${
                  form.type === t ? 'border-accent bg-accent/15 text-accent' : 'border-border text-ink-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              error={errors.date}
            />
            <Input
              label="Start time"
              type="time"
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (min)"
              type="number"
              inputMode="numeric"
              value={form.duration}
              onChange={(e) => set('duration', e.target.value)}
              error={errors.duration}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor={statusFieldId} className="text-sm font-medium text-ink-muted">
                Status
              </label>
              <select
                id={statusFieldId}
                value={form.status}
                onChange={(e) => set('status', e.target.value as ExamStatus)}
                className="h-11 rounded-control border border-border bg-surface px-3 text-ink"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>
            </div>
          </div>
        </section>

        {/* Scoring */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Scoring</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total questions"
              type="number"
              inputMode="numeric"
              value={form.totalQuestions}
              onChange={(e) => set('totalQuestions', e.target.value)}
              error={errors.totalQuestions}
            />
            <Input
              label="Total marks"
              type="number"
              inputMode="numeric"
              value={form.totalMarks}
              onChange={(e) => set('totalMarks', e.target.value)}
              error={errors.totalMarks}
            />
            <Input
              label="Positive marks / correct answer"
              type="number"
              inputMode="decimal"
              value={form.positiveMarks}
              onChange={(e) => set('positiveMarks', e.target.value)}
              error={errors.positiveMarks}
            />
            <Input
              label="Negative marks / wrong answer"
              type="number"
              inputMode="decimal"
              value={form.negativeMarks}
              onChange={(e) => set('negativeMarks', e.target.value)}
              error={errors.negativeMarks}
            />
            <Input
              label="Correct"
              type="number"
              inputMode="numeric"
              value={form.correct}
              onChange={(e) => set('correct', e.target.value)}
              error={errors.correct}
            />
            <Input
              label="Wrong"
              type="number"
              inputMode="numeric"
              value={form.wrong}
              onChange={(e) => set('wrong', e.target.value)}
              error={errors.wrong}
            />
            <Input
              label="Unanswered"
              type="number"
              inputMode="numeric"
              value={form.unanswered}
              onChange={(e) => set('unanswered', e.target.value)}
              error={errors.unanswered}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={useManualOverride}
              onChange={(e) => setUseManualOverride(e.target.checked)}
              className="h-4 w-4 rounded accent-accent"
            />
            Override final score manually
          </label>
          {useManualOverride && (
            <Input
              label="Manual score"
              type="number"
              inputMode="decimal"
              value={form.manualScoreOverride}
              onChange={(e) => set('manualScoreOverride', e.target.value)}
              error={errors.manualScoreOverride}
            />
          )}

          <GlassCard className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            <LivePreview label="Calculated" value={liveScore.calculatedScore} />
            <LivePreview
              label={useManualOverride ? 'Final (manual)' : 'Final'}
              value={liveScore.finalScore}
              highlight
            />
            <LivePreview label="Percentage" value={liveScore.percentage !== null ? `${liveScore.percentage}%` : '—'} />
            <LivePreview label="Accuracy" value={liveScore.accuracy !== null ? `${liveScore.accuracy}%` : '—'} />
          </GlassCard>
        </section>

        {/* Ranking */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Ranking</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Rank"
              type="number"
              inputMode="numeric"
              value={form.rank}
              onChange={(e) => set('rank', e.target.value)}
              error={errors.rank}
            />
            <Input
              label="Participants"
              type="number"
              inputMode="numeric"
              value={form.participants}
              onChange={(e) => set('participants', e.target.value)}
              error={errors.participants}
            />
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-2">
          <h3 id={notesFieldId} className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Notes
          </h3>
          <textarea
            aria-labelledby={notesFieldId}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            placeholder="Anything worth remembering about this exam..."
            aria-invalid={!!errors.notes}
            className="w-full rounded-control border border-border bg-surface p-3 text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          {errors.notes && <p className="text-sm text-danger">{errors.notes}</p>}
        </section>
      </div>
    </Sheet>
  );
}

function LivePreview({
  label,
  value,
  highlight
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-ink-faint">{label}</p>
      <p className={`font-display text-lg font-semibold tabular-nums ${highlight ? 'text-accent' : 'text-ink'}`}>
        {value}
      </p>
    </div>
  );
}
