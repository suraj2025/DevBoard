import api from './axiosClient'

type LoginCredentials = {
  email: string
  password: string
}

type AuthUser = {
  id: number
  name: string
  email: string
}

type AuthResponse = {
  token: string
  user: AuthUser
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const res = await api.post<AuthResponse>('/login', credentials)
    return res.data
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Login failed')
  }
}

export async function register(data: { name: string; email: string; password: string }): Promise<{ message: string }> {
  try {
    const res = await api.post('/register', data)
    return res.data
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Registration failed')
  }
}

export async function logout(): Promise<void> {
  await api.post('/logout')
}