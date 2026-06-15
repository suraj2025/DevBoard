import api from './axiosClient'

export type Profile = {
  id: number
  name: string
  email: string
}

export async function fetchProfile(): Promise<Profile> {
  const res = await api.get<Profile>('/profile')
  return res.data
}

export async function updateProfile(data: Pick<Profile, 'name' | 'email'>): Promise<Profile> {
  const res = await api.put<Profile>('/profile', data)
  return res.data
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  try {
    const res = await api.put('/profile/password', data)
    return res.data
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to update password')
  }
}

export async function clearAllData(): Promise<void> {
  await api.delete('/profile/data')
}

export async function deleteAccount(): Promise<void> {
  await api.delete('/profile')
}