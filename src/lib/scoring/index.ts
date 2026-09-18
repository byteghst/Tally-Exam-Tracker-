import type { ScoreInput, ScoreResult } from '@/types';

/**
 * Deterministic, side-effect-free scoring calculation.
 * Every exam-related screen must go through this function rather than
 * computing marks inline in a component.
 */
export function calculateScore(input: ScoreInput, totalQuestions?: number): ScoreResult {
  const correct = safeNumber(input.correct);
  const wrong = safeNumber(input.wrong);
  const unanswered = safeNumber(input.unanswered);

  const positiveMarksEarned = round(correct * input.positiveMarks);
  const negativeMarksLost = round(wrong * input.negativeMarks);
  const calculatedScore = round(positiveMarksEarned - negativeMarksLost);

  const hasManualOverride = input.manualScore !== undefined && input.manualScore !== null && !Number.isNaN(input.manualScore);
  const finalScore = hasManualOverride ? (input.manualScore as number) : calculatedScore;

  const percentage =
    input.totalMarks && input.totalMarks > 0
      ? round(clamp((finalScore / input.totalMarks) * 100, -100, 100))
      : null;

  const attempted = correct + wrong;
  const accuracy = attempted > 0 ? round((correct / attempted) * 100) : null;

  const totalQ = totalQuestions ?? (correct + wrong + unanswered > 0 ? correct + wrong + unanswered : undefined);
  const attemptRate = totalQ && totalQ > 0 ? round((attempted / totalQ) * 100) : null;

  return {
    calculatedScore,
    finalScore,
    isManualOverride: hasManualOverride,
    positiveMarksEarned,
    negativeMarksLost,
    percentage,
    accuracy,
    attemptRate
  };
}

/** Validates that correct + wrong + unanswered doesn't exceed totalQuestions. */
export function validateAttemptCounts(
  correct?: number,
  wrong?: number,
  unanswered?: number,
  totalQuestions?: number
): string | null {
  if (!totalQuestions) return null;
  const sum = safeNumber(correct) + safeNumber(wrong) + safeNumber(unanswered);
  if (sum > totalQuestions) {
    return `Correct + wrong + unanswered (${sum}) exceeds total questions (${totalQuestions}).`;
  }
  return null;
}

function safeNumber(n: number | undefined): number {
  if (n === undefined || n === null || Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return n;
}

function round(n: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(n * factor) / factor;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
