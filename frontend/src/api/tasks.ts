import api from './axiosClient'
import type { Task } from '../types'

export async function fetchTasks(): Promise<Task[]> {
  const res = await api.get<Task[]>('/tasks')
  return res.data
}

export async function createTask(data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const res = await api.post<Task>('/tasks', data)
  return res.data
}

export async function updateTask(id: number, data: Partial<Task>): Promise<Task> {
  const res = await api.put<Task>(`/tasks/${id}`, data)
  return res.data
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`)
}