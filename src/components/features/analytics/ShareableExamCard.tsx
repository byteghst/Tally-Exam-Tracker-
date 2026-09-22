import { useEffect, useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { drawExamTrendCard, CARD_WIDTH, CARD_HEIGHT } from '@/lib/shareCard/drawExamTrendCard';
import type { ExamTrendPoint } from '@/lib/examTrend';

interface ShareableExamCardProps {
  open: boolean;
  onClose: () => void;
  points: ExamTrendPoint[];
}

const ANIMATION_MS = 1400;

export function ShareableExamCard({ open, onClose, points }: ShareableExamCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCanShareFiles(
      typeof navigator !== 'undefined' &&
        'canShare' in navigator &&
        navigator.canShare?.({ files: [new File([], 'test.png', { type: 'image/png' })] }) === true
    );
  }, []);

  useEffect(() => {
    if (!open || points.length < 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CARD_WIDTH * dpr;
    canvas.height = CARD_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let cancelled = false;
    let start: number | null = null;

    async function run() {
      // wait for the brand fonts to be ready so canvas text doesn't fall
      // back to a system font for the first frame or two
      if ('fonts' in document) {
        try {
          await document.fonts.ready;
        } catch {
          // proceed with whatever's loaded — a fallback font beats no card
        }
      }
      if (cancelled) return;

      const step = (timestamp: number) => {
        if (start === null) start = timestamp;
        const progress = (timestamp - start) / ANIMATION_MS;
        drawExamTrendCard(ctx!, points, progress);
        if (progress < 1 && !cancelled) {
          rafRef.current = requestAnimationFrame(step);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    }

    run();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // points is derived fresh each render from the store; re-running the
    // animation on every parent re-render would be jarring, so this only
    // keys off `open` — the sheet is remounted-in-effect each time it opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function getFinalBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject(new Error('Canvas not ready'));
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not ready'));
      // force the crisp final frame regardless of where the animation was
      drawExamTrendCard(ctx, points, 1);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Could not generate image'));
      }, 'image/png');
    });
  }

  async function handleDownload() {
    setBusy(true);
    try {
      const blob = await getFinalBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tally-exam-trend-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    setBusy(true);
    try {
      const blob = await getFinalBlob();
      const file = new File([blob], 'tally-exam-trend.png', { type: 'image/png' });
      await navigator.share({ files: [file], title: 'Exam Score Trend — Tally' });
    } catch (err) {
      // AbortError just means the person closed the native share sheet — not a real failure
      if ((err as Error)?.name !== 'AbortError') {
        // fall back silently to download so they still get the image
        await handleDownload();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Share exam trend"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleDownload} disabled={busy}>
            <Download size={16} />
            Download
          </Button>
          {canShareFiles && (
            <Button onClick={handleShare} disabled={busy}>
              <Share2 size={16} />
              Share
            </Button>
          )}
        </div>
      }
    >
      <div className="mx-auto w-full max-w-sm" style={{ aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
          aria-label="Exam score trend, shareable card"
        />
      </div>
    </Sheet>
  );
}
