import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProfile, updateProfile } from '../api/profile'
import { useAuthStore } from '../store/authStore'
import { changePassword, clearAllData, deleteAccount } from '../api/profile'

type Tab = 'profile' | 'notifications' | 'account'

const tabs: { key: Tab; label: string }[] = [
  { key: 'profile',       label: 'Profile' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'account',       label: 'Account' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        checked ? 'bg-gray-900' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function ProfileTab() {
  const queryClient = useQueryClient()
  const setAuthUser = useAuthStore((state) => state.login)
  const token = useAuthStore((state) => state.token)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Sync form fields once profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setEmail(profile.email)
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated)
      // keep Zustand auth store in sync too (navbar shows user.name)
      if (token) setAuthUser({ id: updated.id, name: updated.name, email: updated.email }, token)
    },
  })

  if (isLoading) {
    return <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-blue-500 mt-0.5">👤</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Profile Information</h3>
            <p className="text-sm text-gray-500 mt-0.5">Update your personal information and profile details</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm mt-3">{(mutation.error as Error).message}</p>
        )}

        <div className="border-t border-gray-100 mt-5 pt-5 flex justify-end items-center gap-3">
          {mutation.isSuccess && <span className="text-sm text-green-600">Saved!</span>}
          <button
            onClick={() => mutation.mutate({ name, email })}
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            💾 {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Appearance section unchanged */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-blue-500 mt-0.5">🎨</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Appearance</h3>
            <p className="text-sm text-gray-500 mt-0.5">Customize the look and feel of the application</p>
          </div>
        </div>
        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Theme</label>
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2.5 text-sm font-medium border-2 border-blue-500 rounded-lg text-gray-900 bg-white">
              Light Mode
            </button>
            <button disabled className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-400 bg-gray-50 cursor-not-allowed">
              Dark Mode (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    email: true,
    push: true,
    taskReminders: true,
    habitReminders: true,
  })
  const [saved, setSaved] = useState(false)

  const items: { key: keyof typeof prefs; title: string; desc: string }[] = [
    { key: 'email',          title: 'Email Notifications', desc: 'Receive email updates about your tasks and habits' },
    { key: 'push',            title: 'Push Notifications',  desc: 'Receive push notifications in your browser' },
    { key: 'taskReminders',   title: 'Task Reminders',      desc: 'Get reminders for upcoming task due dates' },
    { key: 'habitReminders',  title: 'Habit Reminders',     desc: 'Daily reminders to complete your habits' },
  ]

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-start gap-2 mb-1">
        <span className="text-blue-500 mt-0.5">🔔</span>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Notification Preferences</h3>
          <p className="text-sm text-gray-500 mt-0.5">Choose how you want to be notified about updates</p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-gray-100">
        {items.map(({ key, title, desc }) => (
          <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <Toggle checked={prefs[key]} onChange={v => setPrefs(p => ({ ...p, [key]: v }))} />
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 mt-2 pt-5 flex justify-end items-center gap-3">
        {saved && <span className="text-sm text-green-600">Saved!</span>}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          💾 Save Preferences
        </button>
      </div>
    </div>
  )
}

function AccountTab() {
  const [confirmAction, setConfirmAction] = useState<'delete' | 'clear' | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordError('')
    },
    onError: (err: Error) => setPasswordError(err.message),
  })

  const clearDataMutation = useMutation({
    mutationFn: clearAllData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      setConfirmAction(null)
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      logout()
    },
  })

  const handlePasswordSubmit = () => {
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    passwordMutation.mutate({ currentPassword, newPassword })
  }

  const handleConfirm = () => {
    if (confirmAction === 'clear') clearDataMutation.mutate()
    if (confirmAction === 'delete') deleteAccountMutation.mutate()
  }

  return (
    <div className="space-y-6">
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirmAction === 'delete'
                ? 'This will permanently delete your account and all data. This action cannot be undone.'
                : 'This will remove all your tasks and habits. Your account will remain.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={clearDataMutation.isPending || deleteAccountMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {confirmAction === 'delete'
                  ? (deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account')
                  : (clearDataMutation.isPending ? 'Clearing...' : 'Clear Data')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-blue-500 mt-0.5">🛡</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Account Security</h3>
            <p className="text-sm text-gray-500 mt-0.5">Manage your password and security settings</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {passwordError && <p className="text-red-500 text-sm mt-3">{passwordError}</p>}
        {passwordMutation.isSuccess && <p className="text-green-600 text-sm mt-3">Password updated successfully!</p>}

        <div className="border-t border-gray-100 mt-5 pt-5 flex justify-end">
          <button
            onClick={handlePasswordSubmit}
            disabled={passwordMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 bg-red-50/30 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-red-600">Danger Zone</h3>
        <p className="text-sm text-gray-500 mt-0.5 mb-4">Irreversible actions that affect your account</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete Account</p>
              <p className="text-xs text-gray-500 mt-0.5">Permanently delete your account and all data</p>
            </div>
            <button onClick={() => setConfirmAction('delete')}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shrink-0 ml-4">
              Delete Account
            </button>
          </div>

          <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Clear All Data</p>
              <p className="text-xs text-gray-500 mt-0.5">Remove all tasks and habits (keeps account)</p>
            </div>
            <button onClick={() => setConfirmAction('clear')}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shrink-0 ml-4">
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile'       && <ProfileTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'account'       && <AccountTab />}
    </div>
  )
}