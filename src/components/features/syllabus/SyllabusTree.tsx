import { useState } from 'react';
import { ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import type { SyllabusNode } from '@/types';

const STATE_TONE = {
  not_started: 'neutral',
  started: 'accent',
  in_progress: 'accent',
  revision_needed: 'warning',
  completed: 'success'
} as const;

const STATE_LABEL: Record<string, string> = {
  not_started: 'Not started',
  started: 'Started',
  in_progress: 'In progress',
  revision_needed: 'Needs revision',
  completed: 'Completed'
};

interface SyllabusTreeProps {
  nodes: SyllabusNode[];
  parentId?: string;
  depth?: number;
  onEdit: (node: SyllabusNode) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (node: SyllabusNode) => void;
}

export function SyllabusTree({ nodes, parentId, depth = 0, onEdit, onAddChild, onDelete }: SyllabusTreeProps) {
  const children = nodes.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order);

  if (children.length === 0) return null;

  return (
    <div className="space-y-2" style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      {children.map((node) => (
        <SyllabusTreeNode
          key={node.id}
          node={node}
          nodes={nodes}
          depth={depth}
          onEdit={onEdit}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function SyllabusTreeNode({
  node,
  nodes,
  depth,
  onEdit,
  onAddChild,
  onDelete
}: {
  node: SyllabusNode;
  nodes: SyllabusNode[];
  depth: number;
  onEdit: (node: SyllabusNode) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (node: SyllabusNode) => void;
}) {
  const hasChildren = nodes.some((n) => n.parentId === node.id);
  const [expanded, setExpanded] = useState(depth === 0);

  return (
    <div>
      <GlassCard className="p-3.5">
        <div className="flex items-start gap-2">
          {hasChildren ? (
            <button
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? `Collapse ${node.title}` : `Expand ${node.title}`}
              className="mt-0.5 shrink-0 text-ink-muted"
            >
              <ChevronRight size={16} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          ) : (
            <span className="mt-0.5 w-4 shrink-0" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-medium text-ink">{node.title}</p>
              <span className="shrink-0 text-sm tabular-nums text-ink-muted">{node.progressPercent}%</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={STATE_TONE[node.progressState]}>{STATE_LABEL[node.progressState]}</Badge>
              <span className="text-xs capitalize text-ink-faint">{node.type}</span>
            </div>
            <ProgressBar value={node.progressPercent} className="mt-2" />
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-1">
          <button
            onClick={() => onAddChild(node.id)}
            aria-label={`Add item under ${node.title}`}
            className="rounded-control p-1.5 text-ink-muted hover:bg-white/5 hover:text-ink"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onEdit(node)}
            aria-label={`Edit ${node.title}`}
            className="rounded-control p-1.5 text-ink-muted hover:bg-white/5 hover:text-ink"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(node)}
            aria-label={`Delete ${node.title}`}
            className="rounded-control p-1.5 text-ink-muted hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </GlassCard>

      {hasChildren && expanded && (
        <div className="mt-2">
          <SyllabusTree
            nodes={nodes}
            parentId={node.id}
            depth={depth + 1}
            onEdit={onEdit}
            onAddChild={onAddChild}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}
