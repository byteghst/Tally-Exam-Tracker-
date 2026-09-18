import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ImportDialog } from '@/components/features/settings/ImportDialog';
import { useSettingsStore } from '@/store/settingsStore';
import { exportBackup, downloadBackupFile } from '@/data/backup';
import { normalizeLayout, WIDGET_LABELS } from '@/lib/dashboardWidgets';
import type { ThemeMode } from '@/types';

const THEME_OPTIONS: ThemeMode[] = ['light', 'dark', 'system'];

export function Settings() {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const [importOpen, setImportOpen] = useState(false);

  const widgetItems = normalizeLayout(settings.dashboardLayout);

  function toggleWidget(id: string) {
    const next = widgetItems.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    updateSettings({ dashboardLayout: next });
  }

  function moveWidget(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= widgetItems.length) return;
    const reordered = [...widgetItems];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    updateSettings({ dashboardLayout: reordered.map((w, i) => ({ ...w, order: i })) });
  }

  return (
    <div className="space-y-6 py-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>

      <GlassCard className="space-y-4 p-5">
        <h2 className="font-medium text-ink">Appearance</h2>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((mode) => (
            <button
              key={mode}
              onClick={() => updateSettings({ theme: mode })}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${
                settings.theme === mode ? 'bg-accent text-white' : 'bg-white/5 text-ink-muted'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-ink-muted">
          Glass intensity
          <input
            type="range"
            min={0}
            max={100}
            value={settings.glassIntensity}
            onChange={(e) => updateSettings({ glassIntensity: Number(e.target.value) })}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-ink-muted">
          Blur intensity
          <input
            type="range"
            min={0}
            max={100}
            value={settings.blurIntensity}
            onChange={(e) => updateSettings({ blurIntensity: Number(e.target.value) })}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={settings.reducedTransparency}
            onChange={(e) => updateSettings({ reducedTransparency: e.target.checked })}
          />
          Reduce transparency
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-muted">Motion</span>
          <div className="flex gap-2">
            {(['full', 'reduced', 'none'] as const).map((level) => (
              <button
                key={level}
                onClick={() => updateSettings({ animationLevel: level })}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${
                  settings.animationLevel === level ? 'bg-accent text-white' : 'bg-white/5 text-ink-muted'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3 p-5">
        <h2 className="font-medium text-ink">Dashboard</h2>
        <p className="text-sm text-ink-muted">Choose which widgets show on your Dashboard, and in what order.</p>
        <div className="space-y-2">
          {widgetItems.map((w, i) => (
            <div key={w.id} className="flex items-center justify-between rounded-control border border-border p-3">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={w.visible}
                  onChange={() => toggleWidget(w.id)}
                  className="h-4 w-4 rounded accent-accent"
                />
                {WIDGET_LABELS[w.id]}
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => moveWidget(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${WIDGET_LABELS[w.id]} up`}
                  className="rounded-control p-1.5 text-ink-muted hover:bg-white/5 hover:text-ink disabled:opacity-30"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveWidget(i, 1)}
                  disabled={i === widgetItems.length - 1}
                  aria-label={`Move ${WIDGET_LABELS[w.id]} down`}
                  className="rounded-control p-1.5 text-ink-muted hover:bg-white/5 hover:text-ink disabled:opacity-30"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="space-y-3 p-5">
        <h2 className="font-medium text-ink">Data</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => downloadBackupFile(await exportBackup())}
          >
            Export backup (JSON)
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
            Import backup
          </Button>
        </div>
      </GlassCard>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />

      <GlassCard className="p-5">
        <Button variant="danger" size="sm" onClick={resetSettings}>
          Reset settings to default
        </Button>
      </GlassCard>
    </div>
  );
}
