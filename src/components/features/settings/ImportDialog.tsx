import { useRef, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  validateBackup,
  previewBackup,
  applyBackup,
  type Backup,
  type ImportPreview
} from '@/data/backup';
import { useExamStore } from '@/store/examStore';
import { useDeadlineStore } from '@/store/deadlineStore';
import { useTaskStore } from '@/store/taskStore';
import { useSyllabusStore } from '@/store/syllabusStore';
import { useUIStore } from '@/store/uiStore';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

type Stage = 'pick' | 'preview' | 'applying' | 'done';

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('pick');
  const [error, setError] = useState<string | undefined>(undefined);
  const [backup, setBackup] = useState<Backup | undefined>(undefined);
  const [preview, setPreview] = useState<ImportPreview | undefined>(undefined);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [fileName, setFileName] = useState('');

  const { hydrate: hydrateExams } = useExamStore();
  const { hydrate: hydrateDeadlines } = useDeadlineStore();
  const { hydrate: hydrateTasks } = useTaskStore();
  const { hydrate: hydrateSyllabus } = useSyllabusStore();
  const { pushToast } = useUIStore();

  function reset() {
    setStage('pick');
    setError(undefined);
    setBackup(undefined);
    setPreview(undefined);
    setMode('merge');
    setFileName('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFileChosen(file: File) {
    setFileName(file.name);
    setError(undefined);
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      const result = validateBackup(raw);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBackup(result.data);
      setPreview(previewBackup(result.data));
      setStage('preview');
    } catch {
      setError('Could not read that file — make sure it\'s a Tally backup JSON file.');
    }
  }

  async function handleConfirmImport() {
    if (!backup) return;
    setStage('applying');
    try {
      await applyBackup(backup, mode);
      await Promise.all([hydrateExams(), hydrateDeadlines(), hydrateTasks(), hydrateSyllabus()]);
      pushToast(mode === 'replace' ? 'Backup restored' : 'Backup merged in');
      setStage('done');
    } catch {
      setError('Import failed partway through. Your existing data should be unaffected, but please check.');
      setStage('preview');
    }
  }

  return (
    <Sheet
      open={open}
      onClose={handleClose}
      title="Import backup"
      footer={
        stage === 'preview' ? (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={reset}>
              Choose a different file
            </Button>
            <Button onClick={handleConfirmImport}>
              {mode === 'replace' ? 'Replace all data' : 'Merge into existing data'}
            </Button>
          </div>
        ) : stage === 'done' ? (
          <div className="flex justify-end">
            <Button onClick={handleClose}>Done</Button>
          </div>
        ) : undefined
      }
    >
      {stage === 'pick' && (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            Choose a backup JSON file exported from this app (see Settings → Export backup).
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChosen(file);
              e.target.value = '';
            }}
          />
          <Button onClick={() => fileInputRef.current?.click()}>Choose file</Button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      )}

      {stage === 'preview' && preview && (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            Found in <span className="font-medium text-ink">{fileName}</span>:
          </p>
          <GlassCard className="grid grid-cols-2 gap-3 p-4">
            <Stat label="Exams" value={preview.examCount} />
            <Stat label="Deadlines" value={preview.deadlineCount} />
            <Stat label="Syllabus items" value={preview.syllabusCount} />
            <Stat label="Tasks" value={preview.taskCount} />
          </GlassCard>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-ink-muted">How should this be applied?</legend>
            <label className="flex items-start gap-2 rounded-control border border-border p-3">
              <input
                type="radio"
                name="import-mode"
                checked={mode === 'merge'}
                onChange={() => setMode('merge')}
                className="mt-1 accent-accent"
              />
              <span>
                <span className="block font-medium text-ink">Merge</span>
                <span className="block text-sm text-ink-muted">
                  Adds these items alongside what you already have. Items with the same ID are overwritten.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 rounded-control border border-border p-3">
              <input
                type="radio"
                name="import-mode"
                checked={mode === 'replace'}
                onChange={() => setMode('replace')}
                className="mt-1 accent-accent"
              />
              <span>
                <span className="block font-medium text-ink">Replace everything</span>
                <span className="block text-sm text-danger">
                  Deletes all current data first. Only do this if you mean to fully restore from this file.
                </span>
              </span>
            </label>
          </fieldset>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      )}

      {stage === 'applying' && <p className="text-sm text-ink-muted">Importing…</p>}

      {stage === 'done' && <p className="text-sm text-ink">Your data has been updated.</p>}
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="font-display text-lg font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
