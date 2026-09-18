import { z } from 'zod';

export const deadlineFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Keep it under 120 characters'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional(),
  description: z.string().max(1000, 'Keep it under 1000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().max(60, 'Keep it under 60 characters').optional(),
  reminderMinutesBefore: z.coerce.number().int().min(0, 'Cannot be negative').optional().or(z.literal('')),
  notes: z.string().max(2000, 'Keep notes under 2000 characters').optional()
});

export type DeadlineFormValues = z.infer<typeof deadlineFormSchema>;
