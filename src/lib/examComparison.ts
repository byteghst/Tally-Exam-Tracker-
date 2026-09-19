import type { Exam } from '@/types';
import { calculateScore } from '@/lib/scoring';

export interface ExamComparison {
  previousExam?: Exam;
  currentPercentage: number | null;
  previousPercentage: number | null;
  percentageDiff: number | null;
  rankDiff: number | null; // positive = improved (moved to a lower/better rank number)
}

function percentageOf(exam: Exam): number | null {
  return calculateScore(
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
  ).percentage;
}

/**
 * Finds the most recent prior exam of the same type (daily vs daily,
 * weekly vs weekly) and computes score/rank deltas — only when both sides
 * of the comparison actually have the field populated.
 */
export function compareToPrevious(exam: Exam, allExams: Exam[]): ExamComparison {
  const sameTypeCompleted = allExams
    .filter((e) => e.id !== exam.id && e.type === exam.type && e.status === 'completed')
    .filter((e) => e.date < exam.date || (e.date === exam.date && e.createdAt < exam.createdAt))
    .sort((a, b) => (a.date === b.date ? a.createdAt - b.createdAt : a.date.localeCompare(b.date)));

  const previousExam = sameTypeCompleted[sameTypeCompleted.length - 1];
  const currentPercentage = percentageOf(exam);
  const previousPercentage = previousExam ? percentageOf(previousExam) : null;

  const percentageDiff =
    currentPercentage !== null && previousPercentage !== null
      ? Math.round((currentPercentage - previousPercentage) * 10) / 10
      : null;

  const rankDiff =
    previousExam && exam.rank !== undefined && previousExam.rank !== undefined
      ? previousExam.rank - exam.rank
      : null;

  return { previousExam, currentPercentage, previousPercentage, percentageDiff, rankDiff };
}
