import { useReducer, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { habitReducer, initialHabitState, getStreak } from '../component/habits/habitReducer'
import { fetchHabits, toggleHabit, createHabit } from '../api/habbit'
import type { Habit } from '../mocs/handler/habits'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

function buildChartData(habits: Habit[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    const dateStr = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en', { weekday: 'short' })
    const completed = habits.filter(h => h.completedDates.includes(dateStr)).length
    return { day: label, completed }
  })
}

function getWeeklyProgress(habit: Habit): number {
  const days = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10)
  )
  const done = days.filter(d => habit.completedDates.includes(d)).length
  return Math.round((done / 7) * 100)
}

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  description: z.string().max(200),
})
type HabitFormData = z.infer<typeof habitSchema>

function AddHabitModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
  })

  const mutation = useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add New Habit</h2>
            <p className="text-sm text-gray-500 mt-0.5">Create a new habit to track your daily progress.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl mt-0.5">✕</button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
            <input
              {...register('name')}
              placeholder="e.g., Code Review"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              placeholder="What does this habit involve?"
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>

          {mutation.isError && (
            <p className="text-red-500 text-sm">{(mutation.error as Error).message}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {mutation.isPending ? 'Adding...' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function HabitCard({ habit }: { habit: Habit }) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const doneToday = habit.completedDates.includes(today)
  const streak = getStreak(habit.completedDates)
  const weeklyPct = getWeeklyProgress(habit)

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10)
    return { date: d, done: habit.completedDates.includes(d) }
  })

  const toggleMutation = useMutation({
    mutationFn: () => toggleHabit(habit.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(['habits'], (old: Habit[]) =>
        old.map(h => h.id === updated.id ? updated : h)
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/habits/${habit.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.setQueryData(['habits'], (old: Habit[]) =>
        old.filter(h => h.id !== habit.id)
      )
    },
  })

  return (
    <>
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete the habit "{habit.name}" and all its progress. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-semibold text-gray-900">{habit.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{habit.description}</p>
          </div>
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-gray-300 hover:text-red-400 transition-colors mt-0.5 text-lg"
          >
            🗑
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 mb-4">
          {streak > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              🔥 {streak} day streak
            </span>
          )}
          <span className="text-xs text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full ml-auto">
            daily
          </span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500">Weekly Progress</span>
            <span className="text-xs font-medium text-gray-700">{weeklyPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all duration-500"
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Last 7 Days</p>
          <div className="flex gap-1.5">
            {last7.map(({ date, done }) => (
              <div key={date} className={`flex-1 h-8 rounded-md ${done ? 'bg-green-500' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>

        <button
          onClick={() => toggleMutation.mutate()}
          disabled={toggleMutation.isPending}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            doneToday
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {doneToday ? '✓  Completed Today' : 'Mark Complete'}
        </button>
      </div>
    </>
  )
}

export default function HabitsPage() {
  const [state, dispatch] = useReducer(habitReducer, initialHabitState)
  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits,
  })

  const chartData = buildChartData(habits)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-500">completed : {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Habit Tracker</h2>
          <p className="text-sm text-gray-500 mt-1">Build consistent habits to accelerate your learning</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'OPEN_FORM' })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Add Habit
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Weekly Progress</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#blueGrad)"
              dot={{ fill: '#3B82F6', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#3B82F6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(n => <div key={n} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map(habit => <HabitCard key={habit.id} habit={habit} />)}
          {habits.length === 0 && (
            <p className="text-gray-400 text-sm col-span-3 text-center py-12">No habits yet. Add one above.</p>
          )}
        </div>
      )}

      {state.showForm && <AddHabitModal onClose={() => dispatch({ type: 'CLOSE_FORM' })} />}
    </div>
  )
}