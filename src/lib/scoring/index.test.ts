import { describe, it, expect } from 'vitest';
import { calculateScore, validateAttemptCounts } from './index';

describe('calculateScore', () => {
  it('computes standard positive/negative marking', () => {
    const result = calculateScore({
      correct: 75,
      wrong: 10,
      unanswered: 15,
      positiveMarks: 1,
      negativeMarks: 0.25,
      totalMarks: 100
    });
    expect(result.calculatedScore).toBe(72.5);
    expect(result.finalScore).toBe(72.5);
    expect(result.isManualOverride).toBe(false);
    expect(result.percentage).toBe(72.5);
    expect(result.accuracy).toBeCloseTo(88.24, 1);
  });

  it('handles zero negative marking', () => {
    const result = calculateScore({
      correct: 40,
      wrong: 10,
      positiveMarks: 2,
      negativeMarks: 0
    });
    expect(result.calculatedScore).toBe(80);
    expect(result.negativeMarksLost).toBe(0);
  });

  it('respects manual score override', () => {
    const result = calculateScore({
      correct: 50,
      wrong: 5,
      positiveMarks: 1,
      negativeMarks: 0.25,
      manualScore: 999
    });
    expect(result.isManualOverride).toBe(true);
    expect(result.finalScore).toBe(999);
    expect(result.calculatedScore).not.toBe(999); // calculated is still tracked separately
  });

  it('never returns NaN/Infinity even with missing fields', () => {
    const result = calculateScore({ positiveMarks: 1, negativeMarks: 0.25 });
    expect(Number.isFinite(result.calculatedScore)).toBe(true);
    expect(result.accuracy).toBeNull();
    expect(result.attemptRate).toBeNull();
  });

  it('returns null percentage when totalMarks is not provided', () => {
    const result = calculateScore({ correct: 10, positiveMarks: 1, negativeMarks: 0 });
    expect(result.percentage).toBeNull();
  });
});

describe('validateAttemptCounts', () => {
  it('flags counts exceeding total questions', () => {
    const err = validateAttemptCounts(60, 30, 20, 100);
    expect(err).toMatch(/exceeds total questions/);
  });

  it('passes when counts are within total', () => {
    const err = validateAttemptCounts(60, 20, 20, 100);
    expect(err).toBeNull();
  });

  it('skips validation when totalQuestions is not provided', () => {
    expect(validateAttemptCounts(999, 999, 999, undefined)).toBeNull();
  });
});
