import { http, HttpResponse } from 'msw'

export type Task = {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

const tasks: Task[] = [
  { id: '1', title: 'Setup project', description: 'Vite + React + TS', status: 'done', priority: 'high', createdAt: '2026-06-01' },
  { id: '2', title: 'Build task list', description: 'Fetch and display tasks', status: 'in_progress', priority: 'high', createdAt: '2026-06-02' },
  { id: '3', title: 'Add MSW mocks', description: 'Mock all API endpoints', status: 'todo', priority: 'medium', createdAt: '2026-06-03' },
]

export const taskHandlers = [
  // GET all tasks
  http.get('/api/tasks', () => {
    return HttpResponse.json(tasks)
  }),

  // GET single task
  http.get('/api/tasks/:id', ({ params }) => {
    const task = tasks.find(t => t.id === params.id)
    if (!task) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(task)
  }),

  // POST create task
  http.post('/api/tasks', async ({ request }) => {
    const body = await request.json() as Omit<Task, 'id' | 'createdAt'>
    const newTask: Task = {
      ...body,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    }
    tasks.push(newTask)
    return HttpResponse.json(newTask, { status: 201 })
  }),

  // PUT update task
  http.put('/api/tasks/:id', async ({ params, request }) => {
    const idx = tasks.findIndex(t => t.id === params.id)
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const body = await request.json() as Partial<Task>
    tasks[idx] = { ...tasks[idx], ...body }
    return HttpResponse.json(tasks[idx])
  }),

  // DELETE task
  http.delete('/api/tasks/:id', ({ params }) => {
    const idx = tasks.findIndex(t => t.id === params.id)
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    tasks.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]