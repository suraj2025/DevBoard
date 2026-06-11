import { http, HttpResponse } from 'msw'

export type Habit = {
  id: string
  name: string
  description: string
  completedDates: string[]  // ISO date strings e.g. '2026-06-11'
  createdAt: string
}

const habits: Habit[] = [
  { id: '1', name: 'Read 30 mins',     description: 'Read any technical book', completedDates: [], createdAt: '2026-06-01' },
  { id: '2', name: 'Exercise',         description: 'Any physical activity',   completedDates: [], createdAt: '2026-06-01' },
  { id: '3', name: 'Code every day',   description: 'At least 1 hour of code', completedDates: [], createdAt: '2026-06-01' },
]

export const habitHandlers = [
  http.get('/api/habits', () => HttpResponse.json(habits)),

  http.post('/api/habits/:id/toggle', ({ params, request: req }) => {
    const habit = habits.find(h => h.id === params.id)
    if (!habit) return HttpResponse.json({ message: 'Not found' }, { status: 404 })

    const today = new Date().toISOString().slice(0, 10)
    const already = habit.completedDates.includes(today)

    habit.completedDates = already
      ? habit.completedDates.filter(d => d !== today)
      : [...habit.completedDates, today]

    return HttpResponse.json(habit)
  }),

  http.post('/api/habits', async ({ request }) => {
    const body = await request.json() as Pick<Habit, 'name' | 'description'>
    const newHabit: Habit = {
      ...body,
      id: String(Date.now()),
      completedDates: [],
      createdAt: new Date().toISOString(),
    }
    habits.push(newHabit)
    return HttpResponse.json(newHabit, { status: 201 })
  }),

  
]