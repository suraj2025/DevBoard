import type { Habit } from '../mocs/handler/habits'

export async function fetchHabits(): Promise<Habit[]> {
  const res = await fetch('/api/habits')
  if (!res.ok) throw new Error('Failed to fetch habits')
  return res.json()
}

export async function toggleHabit(id: string): Promise<Habit> {
  const res = await fetch(`/api/habits/${id}/toggle`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to toggle habit')
  return res.json()
}

export async function createHabit(data: Pick<Habit, 'name' | 'description'>): Promise<Habit> {
  const res = await fetch('/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create habit')
  return res.json()
}