import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import { fetchTasks } from '../api/tasks'
import { fetchHabits } from '../api/habbit'
import { getStreak } from '../component/habits/habitReducer'

type Tab = 'task' | 'habit'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('habit')

  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks })
  const { data: habits = [] } = useQuery({ queryKey: ['habits'], queryFn: fetchHabits })

  // ── Stats ──
  const total      = tasks.length
  const completed  = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const compRate   = total ? Math.round((completed / total) * 100) : 0
  const avgStreak  = habits.length
    ? Math.round(habits.reduce((sum, h) => sum + getStreak(h.completedDates), 0) / habits.length)
    : 0

  const stats = [
    { label: 'Completion Rate', value: `${compRate}%`, sub: `${completed} of ${total} tasks`,   icon: '↗', color: 'text-green-500' },
    { label: 'Active Tasks',    value: inProgress,     sub: 'Currently in progress',             icon: '◎', color: 'text-blue-500' },
    { label: 'Total Habits',    value: habits.length,  sub: 'Being tracked',                     icon: '🎯', color: 'text-orange-500' },
    { label: 'Avg. Streak',     value: avgStreak,      sub: 'Days average',                      icon: '📅', color: 'text-purple-500' },
  ]

  // ── Task Analytics ──
  const statusData = [
    { name: 'To Do',       value: tasks.filter(t => t.status === 'todo').length,        color: '#94a3b8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Done',        value: tasks.filter(t => t.status === 'done').length,        color: '#22c55e' },
  ]

  const priorityData = [
    { name: 'High',   count: tasks.filter(t => t.priority === 'high').length,   fill: '#ef4444' },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'medium').length, fill: '#f59e0b' },
    { name: 'Low',    count: tasks.filter(t => t.priority === 'low').length,    fill: '#94a3b8' },
  ]

  // Weekly task progress — tasks created per week this month
  const weeklyData = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => {
    const weekTasks = tasks.filter(t => {
      const d = new Date(t.createdAt)
      const weekNum = Math.floor((d.getDate() - 1) / 7)
      return weekNum === i
    })
    return {
      week,
      Completed:  weekTasks.filter(t => t.status === 'done').length,
      'In Progress': weekTasks.filter(t => t.status === 'in_progress').length,
    }
  })

  // ── Habit Analytics ──
  // Last 30 days line chart
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000)
    const dateStr = d.toISOString().slice(0, 10)
    const label = d.getDate().toString()
    return {
      date: label,
      habits: habits.filter(h => h.completedDates.includes(dateStr)).length,
    }
  })

  // Habit consistency bar chart (last 30 days)
  const consistencyData = habits.map(h => {
    const last30dates = Array.from({ length: 30 }, (_, i) =>
      new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10)
    )
    const count = last30dates.filter(d => h.completedDates.includes(d)).length
    return { name: h.name, days: count }
  })

  // Streaks list sorted desc
  const streakList = habits
    .map(h => ({ name: h.name, description: h.description, streak: getStreak(h.completedDates) }))
    .filter(h => h.streak > 0)
    .sort((a, b) => b.streak - a.streak)

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    if (percent < 0.05) return null
    return (
      <text x={x} y={y} fill="#64748b" textAnchor={x > cx ? 'start' : 'end'} fontSize={12}>
        {`${name} ${Math.round(percent * 100)}%`}
      </text>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm text-sm">
        <p className="font-medium text-gray-900 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color ?? p.fill }}>
            {p.name === 'habits' ? `habits : ${p.value}` : `${p.name} : ${p.value}`}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Track your productivity and progress over time</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, sub, icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <span className={`text-lg ${color}`}>{icon}</span>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{value}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {(['task', 'habit'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'task' ? 'Task Analytics' : 'Habit Analytics'}
          </button>
        ))}
      </div>

      {/* Task Analytics */}
      {activeTab === 'task' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Task Status Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={CustomPieLabel}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Priority bar chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Priority Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={priorityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly progress */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Weekly Task Progress</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Completed"   fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="In Progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Habit Analytics */}
      {activeTab === 'habit' && (
        <div className="space-y-6">
          {/* Consistency bar chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Habit Consistency (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={consistencyData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 30]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="days" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly trend line chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Monthly Habit Completion Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={last30} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="habits"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Current streaks list */}
          {streakList.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Current Streaks</h3>
              <div className="divide-y divide-gray-50">
                {streakList.map(({ name, description, streak }) => (
                  <div key={name} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-orange-500">{streak}</p>
                      <p className="text-xs text-gray-400">days</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}