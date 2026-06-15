import api from './axiosClient'
import type { Habit } from '../types'

export async function fetchHabits(): Promise<Habit[]> {
  const res = await api.get<Habit[]>('/habits')
  return res.data
}

export async function toggleHabit(id: number): Promise<Habit> {
  const res = await api.post<Habit>(`/habits/${id}/toggle`)
  return res.data
}

export async function createHabit(data: Pick<Habit, 'name' | 'description'>): Promise<Habit> {
  const res = await api.post<Habit>('/habits', data)
  return res.data
}
export async function deleteHabit(id: number): Promise<void> {
  await api.delete(`/habits/${id}`)
}