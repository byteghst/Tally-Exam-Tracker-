import { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { deadlineFormSchema, type DeadlineFormValues } from '@/lib/validation/deadlineSchema';
import { useDeadlineStore } from '@/store/deadlineStore';
import { useUIStore } from '@/store/uiStore';
import { todayISO } from '@/lib/dates';
import type { Deadline, DeadlinePriority } from '@/types';

interface DeadlineFormProps {
  open: boolean;
  onClose: () => void;
  deadline?: Deadline;
}

type FieldErrors = Partial<Record<keyof DeadlineFormValues, string>>;

function toFormState(deadline?: Deadline) {
  return {
    title: deadline?.title ?? '',
    date: deadline?.date ?? todayISO(),
    time: deadline?.time ?? '',
    description: deadline?.description ?? '',
    priority: deadline?.priority ?? ('medium' as DeadlinePriority),
    category: deadline?.category ?? '',
    reminderMinutesBefore: deadline?.reminderMinutesBefore?.toString() ?? '',
    notes: deadline?.notes ?? ''
  };
}

export function DeadlineForm({ open, onClose, deadline }: DeadlineFormProps) {
  const { addDeadline, updateDeadline } = useDeadlineStore();
  const { pushToast } = useUIStore();
  const isEdit = !!deadline;

  const [form, setForm] = useState(() => toFormState(deadline));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [lastId, setLastId] = useState(deadline?.id);

  if (deadline?.id !== lastId || (!deadline && lastId)) {
    setLastId(deadline?.id);
    setForm(toFormState(deadline));
    setErrors({});
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    const toValidate = {
      ...form,
      reminderMinutesBefore: form.reminderMinutesBefore === '' ? '' : Number(form.reminderMinutesBefore)
    };
    const result = deadlineFormSchema.safeParse(toValidate);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof DeadlineFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const v = result.data;

    const payload = {
      title: v.title.trim(),
      date: v.date,
      time: v.time || undefined,
      description: v.description?.trim() || undefined,
      priority: v.priority,
      category: v.category?.trim() || undefined,
      reminderMinutesBefore: v.reminderMinutesBefore === '' ? undefined : v.reminderMinutesBefore,
      status: deadline?.status ?? ('upcoming' as const),
      notes: v.notes?.trim() || undefined,
      tagIds: deadline?.tagIds ?? []
    };

    try {
      if (isEdit && deadline) {
        await updateDeadline(deadline.id, payload);
        pushToast('Deadline updated');
      } else {
        await addDeadline(payload);
        pushToast('Deadline added');
      }
      onClose();
    } catch {
      pushToast('Something went wrong saving this deadline. Please try again.', undefined, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit deadline' : 'Add deadline'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {isEdit ? 'Save changes' : 'Add deadline'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title}
          placeholder="e.g. University admission form deadline"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            error={errors.date}
          />
          <Input
            label="Time (optional)"
            type="time"
            value={form.time}
            onChange={(e) => set('time', e.target.value)}
          />
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-ink-muted">Priority</legend>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as DeadlinePriority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set('priority', p)}
                aria-pressed={form.priority === p}
                className={`flex-1 rounded-control border px-3 py-2 text-sm font-medium capitalize ${
                  form.priority === p ? 'border-accent bg-accent/15 text-accent' : 'border-border text-ink-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </fieldset>

        <Input
          label="Category (optional)"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          error={errors.category}
          placeholder="e.g. Admissions, Scholarship, Form submission"
        />

        <Input
          label="Remind me (minutes before, optional)"
          type="number"
          inputMode="numeric"
          value={form.reminderMinutesBefore}
          onChange={(e) => set('reminderMinutesBefore', e.target.value)}
          error={errors.reminderMinutesBefore}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-muted">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            className="w-full rounded-control border border-border bg-surface p-3 text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          {errors.description && <p className="text-sm text-danger">{errors.description}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-muted">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            className="w-full rounded-control border border-border bg-surface p-3 text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          {errors.notes && <p className="text-sm text-danger">{errors.notes}</p>}
        </div>
      </div>
    </Sheet>
  );
}
