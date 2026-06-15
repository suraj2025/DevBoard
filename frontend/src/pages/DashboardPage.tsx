import { useQuery } from '@tanstack/react-query'
import { fetchTasks } from '../api/tasks'
import { fetchHabits } from '../api/habbit'
import { getStreak } from '../component/habits/habitReducer'
import { useAuthStore } from '../store/authStore'

const priorityStyles: Record<string, string> = {
  high:   'bg-red-50 text-red-600 border border-red-200',
  medium: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
  low:    'bg-gray-100 text-gray-500 border border-gray-200',
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: tasks = [] }  = useQuery({ queryKey: ['tasks'],  queryFn: fetchTasks })
  const { data: habits = [] } = useQuery({ queryKey: ['habits'], queryFn: fetchHabits })

  const total      = tasks.length
  const completed  = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const compRate   = total ? Math.round((completed / total) * 100) : 0

  const maxStreak = habits.length
    ? Math.max(...habits.map(h => getStreak(h.completedDates)))
    : 0

  const stats = [
    { label: 'Total Tasks',  value: total,      sub: 'Across all projects',          icon: '○',  color: 'text-gray-400' },
    { label: 'Completed',    value: completed,  sub: `${compRate}% completion rate`, icon: '✓',  color: 'text-green-500', subColor: 'text-green-500' },
    { label: 'In Progress',  value: inProgress, sub: 'Active tasks',                 icon: '⏱',  color: 'text-blue-400' },
    { label: 'Habit Streak', value: maxStreak,  sub: '🔥 Keep it up!',               icon: '🔥', color: 'text-orange-500', subColor: 'text-orange-500' },
  ]

  // Recent activity — completed tasks + habits with streaks
  const recentActivity = [
    ...tasks.filter(t => t.status === 'done').map(t => ({
      type: 'task' as const,
      title: t.title,
      sub: `Completed • ${new Date(t.createdAt).toLocaleDateString('en-GB')}`,
    })),
    ...habits.filter(h => getStreak(h.completedDates) > 0).map(h => ({
      type: 'habit' as const,
      title: h.name,
      sub: `Streak • ${getStreak(h.completedDates)} day streak`,
    })),
  ].slice(0, 4)

  // Upcoming tasks — not done, sorted by created date
  const upcoming = tasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 3)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name ?? 'Dev'}! 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening with your learning journey today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, sub, icon, color, subColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <span className={`text-lg ${color}`}>{icon}</span>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-1">{value}</p>
            <p className={`text-xs ${subColor ?? 'text-gray-400'}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Recent activity + Upcoming tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent activity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4">
            <span className="text-blue-500">↗</span> Recent Activity
          </h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No activity yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={item.type === 'task' ? 'text-green-500' : 'text-orange-500'}>
                    {item.type === 'task' ? '✓' : '🔥'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming tasks */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-4">
            <span className="text-blue-500">📅</span> Upcoming Tasks
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No upcoming tasks.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcoming.map(task => (
                <div key={task.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="text-gray-300 mt-0.5">○</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-400">
                        Due {new Date(task.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

     
    </div>
  )
}