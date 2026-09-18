import { z } from 'zod';

export const syllabusFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Keep it under 120 characters'),
  type: z.enum(['course', 'chapter', 'topic', 'subtopic']),
  parentId: z.string().optional(),
  progressState: z.enum(['not_started', 'started', 'in_progress', 'completed', 'revision_needed']),
  progressPercent: z.coerce.number().min(0, 'Cannot be negative').max(100, 'Cannot exceed 100'),
  notes: z.string().max(2000, 'Keep notes under 2000 characters').optional()
});

export type SyllabusFormValues = z.infer<typeof syllabusFormSchema>;
