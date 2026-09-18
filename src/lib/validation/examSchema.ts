import { z } from 'zod';

/**
 * Validates raw form input (strings from controlled inputs) rather than the
 * final Exam entity — coercion happens here so the form can stay simple
 * controlled inputs bound to strings.
 */
export const examFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Exam name is required').max(120, 'Keep it under 120 characters'),
    type: z.enum(['daily', 'weekly']),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().optional(),
    duration: z.coerce.number().min(0, 'Duration cannot be negative').optional().or(z.literal('')),
    totalQuestions: z.coerce.number().int().min(0, 'Cannot be negative').optional().or(z.literal('')),
    totalMarks: z.coerce.number().min(0, 'Cannot be negative').optional().or(z.literal('')),
    positiveMarks: z.coerce.number().min(0, 'Cannot be negative'),
    negativeMarks: z.coerce.number().min(0, 'Cannot be negative'),
    correct: z.coerce.number().int().min(0, 'Cannot be negative').optional().or(z.literal('')),
    wrong: z.coerce.number().int().min(0, 'Cannot be negative').optional().or(z.literal('')),
    unanswered: z.coerce.number().int().min(0, 'Cannot be negative').optional().or(z.literal('')),
    manualScoreOverride: z.coerce.number().optional().or(z.literal('')),
    rank: z.coerce.number().int().min(1, 'Rank must be at least 1').optional().or(z.literal('')),
    participants: z.coerce.number().int().min(1, 'Must be at least 1').optional().or(z.literal('')),
    status: z.enum(['upcoming', 'completed', 'missed', 'archived']),
    notes: z.string().max(2000, 'Keep notes under 2000 characters').optional()
  })
  .superRefine((data, ctx) => {
    const total = toNum(data.totalQuestions);
    const c = toNum(data.correct);
    const w = toNum(data.wrong);
    const u = toNum(data.unanswered);

    if (total !== undefined && (c !== undefined || w !== undefined || u !== undefined)) {
      const sum = (c ?? 0) + (w ?? 0) + (u ?? 0);
      if (sum > total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['unanswered'],
          message: `Correct + wrong + unanswered (${sum}) exceeds total questions (${total}).`
        });
      }
    }

    const rank = toNum(data.rank);
    const participants = toNum(data.participants);
    if (rank !== undefined && participants !== undefined && rank > participants) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rank'],
        message: `Rank (${rank}) can't be greater than participants (${participants}).`
      });
    }
  });

export type ExamFormValues = z.infer<typeof examFormSchema>;

function toNum(v: number | '' | undefined): number | undefined {
  if (v === undefined || v === '') return undefined;
  return v;
}
