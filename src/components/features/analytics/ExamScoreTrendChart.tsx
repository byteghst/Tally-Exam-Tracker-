import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/Badge';
import { calculateScore } from '@/lib/scoring';
import { parseISODate } from '@/lib/dates';
import type { Exam } from '@/types';

interface ChartPoint {
  date: string;
  label: string;
  percentage: number;
  name: string;
}

export function ExamScoreTrendChart({ exams }: { exams: Exam[] }) {
  const points: ChartPoint[] = exams
    .map((e) => {
      const score = calculateScore(
        {
          correct: e.correct,
          wrong: e.wrong,
          unanswered: e.unanswered,
          positiveMarks: e.positiveMarks,
          negativeMarks: e.negativeMarks,
          totalMarks: e.totalMarks,
          manualScore: e.manualScoreOverride
        },
        e.totalQuestions
      );
      return score.percentage === null
        ? null
        : {
            date: e.date,
            label: `${parseISODate(e.date).getMonth() + 1}/${parseISODate(e.date).getDate()}`,
            percentage: score.percentage,
            name: e.name
          };
    })
    .filter((p): p is ChartPoint => p !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <GlassCard className="p-4">
      <p className="mb-3 text-sm font-medium text-ink-muted">Exam score trend</p>
      {points.length < 2 ? (
        <EmptyState
          title="Not enough data yet"
          description="Add a couple more completed exams with total marks set to see a trend line."
        />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="label" stroke="#9EA7B8" fontSize={12} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#9EA7B8" fontSize={12} tickLine={false} width={36} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Score']}
              labelFormatter={(_: unknown, payload: unknown) => {
                const items = payload as Array<{ payload?: { name?: string } }> | undefined;
                return items?.[0]?.payload?.name ?? '';
              }}
              contentStyle={{
                background: '#141B2B',
                border: '1px solid #262F42',
                borderRadius: 8,
                fontSize: 12
              }}
            />
            <Line type="monotone" dataKey="percentage" stroke="#5B8DEF" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}
