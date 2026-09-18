import { useId, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { syllabusFormSchema, type SyllabusFormValues } from '@/lib/validation/syllabusSchema';
import { useSyllabusStore } from '@/store/syllabusStore';
import { useUIStore } from '@/store/uiStore';
import type { SyllabusNode, SyllabusNodeType, SyllabusProgressState } from '@/types';

interface SyllabusFormProps {
  open: boolean;
  onClose: () => void;
  node?: SyllabusNode;
  /** Pre-selects a parent, e.g. when adding a child from the tree's "+" action. */
  defaultParentId?: string;
}

type FieldErrors = Partial<Record<keyof SyllabusFormValues, string>>;

const TYPE_OPTIONS: SyllabusNodeType[] = ['course', 'chapter', 'topic', 'subtopic'];
const PROGRESS_OPTIONS: { value: SyllabusProgressState; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'started', label: 'Started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'revision_needed', label: 'Needs revision' },
  { value: 'completed', label: 'Completed' }
];

function toFormState(node?: SyllabusNode, defaultParentId?: string) {
  return {
    title: node?.title ?? '',
    type: node?.type ?? ('chapter' as SyllabusNodeType),
    parentId: node?.parentId ?? defaultParentId ?? '',
    progressState: node?.progressState ?? ('not_started' as SyllabusProgressState),
    progressPercent: node?.progressPercent ?? 0,
    notes: node?.notes ?? ''
  };
}

export function SyllabusForm({ open, onClose, node, defaultParentId }: SyllabusFormProps) {
  const { nodes, addNode, updateNode } = useSyllabusStore();
  const { pushToast } = useUIStore();
  const isEdit = !!node;

  const [form, setForm] = useState(() => toFormState(node, defaultParentId));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [lastId, setLastId] = useState(node?.id);
  const parentFieldId = useId();

  if (node?.id !== lastId || (!node && lastId)) {
    setLastId(node?.id);
    setForm(toFormState(node, defaultParentId));
    setErrors({});
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // a node can't become its own parent, and can't be moved under one of its own descendants
  const descendantIds = new Set<string>();
  if (node) {
    const stack = [node.id];
    while (stack.length) {
      const current = stack.pop()!;
      for (const n of nodes) {
        if (n.parentId === current && !descendantIds.has(n.id)) {
          descendantIds.add(n.id);
          stack.push(n.id);
        }
      }
    }
  }
  const parentOptions = nodes.filter((n) => n.id !== node?.id && !descendantIds.has(n.id));

  async function handleSubmit() {
    const result = syllabusFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof SyllabusFormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const v = result.data;

    const siblingCount = nodes.filter((n) => n.parentId === (v.parentId || undefined)).length;

    const payload = {
      title: v.title.trim(),
      type: v.type,
      parentId: v.parentId || undefined,
      progressState: v.progressState,
      progressPercent: v.progressPercent,
      order: node?.order ?? siblingCount,
      notes: v.notes?.trim() || undefined,
      tagIds: node?.tagIds ?? []
    };

    try {
      if (isEdit && node) {
        await updateNode(node.id, payload);
        pushToast('Syllabus item updated');
      } else {
        await addNode(payload);
        pushToast('Syllabus item added');
      }
      onClose();
    } catch {
      pushToast('Something went wrong saving this item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit syllabus item' : 'Add syllabus item'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {isEdit ? 'Save changes' : 'Add item'}
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
          placeholder="e.g. Chapter 3: Vector"
        />

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-ink-muted">Type</legend>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                aria-pressed={form.type === t}
                className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
                  form.type === t ? 'bg-accent text-white' : 'bg-white/5 text-ink-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={parentFieldId} className="text-sm font-medium text-ink-muted">
            Parent (optional)
          </label>
          <select
            id={parentFieldId}
            value={form.parentId}
            onChange={(e) => set('parentId', e.target.value)}
            className="h-11 rounded-control border border-border bg-surface px-3 text-ink"
          >
            <option value="">No parent (top level)</option>
            {parentOptions.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-ink-muted">Progress state</legend>
          <div className="flex flex-wrap gap-2">
            {PROGRESS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('progressState', opt.value)}
                aria-pressed={form.progressState === opt.value}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  form.progressState === opt.value ? 'bg-accent text-white' : 'bg-white/5 text-ink-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center justify-between text-sm font-medium text-ink-muted">
            <span>Progress</span>
            <span className="tabular-nums text-ink">{form.progressPercent}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={form.progressPercent}
            onChange={(e) => set('progressPercent', Number(e.target.value))}
          />
          {errors.progressPercent && <p className="text-sm text-danger">{errors.progressPercent}</p>}
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
