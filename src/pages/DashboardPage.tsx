import { useQuery } from '@tanstack/react-query'
import { fetchTasks } from '../api/tasks'

export default function DashboardPage() {
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })

  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const completionRate = total ? Math.round((completed / total) * 100) : 0

  const stats = [
    { label: 'Total Tasks',   value: total,      sub: 'Across all projects',          color: 'text-gray-400' },
    { label: 'Completed',     value: completed,  sub: `${completionRate}% completion rate`, color: 'text-emerald-500' },
    { label: 'In Progress',   value: inProgress, sub: 'Active tasks',                 color: 'text-blue-400' },
    { label: 'Habit Streak',  value: 7,          sub: '🔥 Keep it up!',               color: 'text-orange-400' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Welcome back, Dev! 👋</h2>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-2">{label}</p>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{value}</p>
            <p className={`text-xs ${color}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Recent tasks preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Recent Tasks</h3>
        {tasks.slice(0, 3).map(task => (
          <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-700">{task.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              task.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
              task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>{task.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}