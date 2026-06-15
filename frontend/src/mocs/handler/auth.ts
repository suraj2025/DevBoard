import { http, HttpResponse } from 'msw'

export const authHandlers = [
  http.post('/api/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string }

    if (email === 'dev@devboard.com' && password === 'password123') {
      return HttpResponse.json({
        token: 'fake-jwt-token-xyz',
        user: { id: '1', name: 'Dev User', email },
      })
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('/api/logout', () => {
    return HttpResponse.json({ message: 'Logged out' })
  }),
]