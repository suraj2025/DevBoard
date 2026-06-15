import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Too long'),
  description: z.string().max(300, 'Too long').optional().transform(v => v ?? ''),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'done']),
  dueDate: z.string().optional(),
})

export type TaskFormData = z.infer<typeof taskSchema>