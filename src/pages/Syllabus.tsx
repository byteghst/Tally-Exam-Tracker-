import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SyllabusForm } from '@/components/features/syllabus/SyllabusForm';
import { SyllabusTree } from '@/components/features/syllabus/SyllabusTree';
import { useSyllabusStore } from '@/store/syllabusStore';
import { useOpenAddFromNavState } from '@/hooks/useOpenAddFromNavState';
import type { SyllabusNode } from '@/types';

export function Syllabus() {
  const { nodes, hydrate, deleteNode, overallProgress } = useSyllabusStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SyllabusNode | undefined>(undefined);
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<SyllabusNode | undefined>(undefined);

  useOpenAddFromNavState(() => {
    setEditing(undefined);
    setDefaultParentId(undefined);
    setFormOpen(true);
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const childCount = deleteTarget ? nodes.filter((n) => n.parentId === deleteTarget.id).length : 0;

  function openAdd() {
    setEditing(undefined);
    setDefaultParentId(undefined);
    setFormOpen(true);
  }

  function openAddChild(parentId: string) {
    setEditing(undefined);
    setDefaultParentId(parentId);
    setFormOpen(true);
  }

  function openEdit(node: SyllabusNode) {
    setEditing(node);
    setDefaultParentId(undefined);
    setFormOpen(true);
  }

  return (
    <div className="space-y-5 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Syllabus</h1>
          <p className="text-sm text-ink-muted">Build your own course/chapter/topic structure</p>
        </div>
        <Button size="sm" onClick={openAdd}>
          Add item
        </Button>
      </header>

      {nodes.length > 0 && (
        <GlassCard className="flex items-center gap-4 p-4">
          <ProgressRing value={overallProgress()} size={48} strokeWidth={5} />
          <div>
            <p className="text-sm font-medium text-ink-muted">Overall progress</p>
            <p className="text-xs text-ink-faint">Across {nodes.length} tracked item{nodes.length === 1 ? '' : 's'}</p>
          </div>
        </GlassCard>
      )}

      {nodes.length === 0 ? (
        <EmptyState
          title="No syllabus items yet"
          description="Nothing is predefined — add your own course/chapter/topic structure."
          action={
            <Button size="sm" onClick={openAdd}>
              Create your first item
            </Button>
          }
        />
      ) : (
        <SyllabusTree
          nodes={nodes}
          onEdit={openEdit}
          onAddChild={openAddChild}
          onDelete={(node) => setDeleteTarget(node)}
        />
      )}

      <SyllabusForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        node={editing}
        defaultParentId={defaultParentId}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={() => deleteTarget && deleteNode(deleteTarget.id)}
        title="Delete this item?"
        description={
          childCount > 0
            ? `"${deleteTarget?.title}" has ${childCount} item${childCount === 1 ? '' : 's'} under it. They'll move up one level instead of being deleted.`
            : `"${deleteTarget?.title}" will be permanently removed. This can't be undone.`
        }
        confirmLabel="Delete"
      />
    </div>
  );
}
