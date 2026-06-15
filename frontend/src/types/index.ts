export type Task = {
  id: number
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  dueDate?: string
}
export type Habit = {
  id: number
  name: string
  description: string
  completedDates: string[]
  createdAt: string
}