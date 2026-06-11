import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, deleteTask, updateTask } from '../api/tasks'
import type { Task } from '../mocs/handler/task'
import TaskForm from '../component/tasks/TaskForm'

const priorityStyles: Record<Task['priority'], string> = {
  high:   'bg-red-50 text-red-600 border border-red-200',
  medium: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
  low:    'bg-gray-100 text-gray-500 border border-gray-200',
}

const columns: { key: Task['status']; label: string; bg: string; headerBg: string }[] = [
  { key: 'todo',        label: 'To Do',       bg: 'bg-gray-50',   headerBg: 'bg-gray-50' },
  { key: 'in_progress', label: 'In Progress', bg: 'bg-blue-50',   headerBg: 'bg-blue-50' },
  { key: 'done',        label: 'Done',        bg: 'bg-green-50',  headerBg: 'bg-green-50' },
]

type MenuState = { taskId: string; x: number; y: number } | null

function TaskCard({
  task,
  onDelete,
  onEdit,
  onStatusChange,
}: {
  task: Task
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onStatusChange: (id: string, status: Task['status']) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const nextStatus: Record<Task['status'], Task['status'] | null> = {
    todo:        'in_progress',
    in_progress: 'done',
    done:        null,
  }

  return (
    <>
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete "{task.title}". This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(task.id); setConfirmDelete(false) }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1 pr-2">
            {task.title}
          </h3>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
            >
              ⋮
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 w-36">
                  <button
                    onClick={() => { onEdit(task); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  {nextStatus[task.status] && (
                    <button
                      onClick={() => { onStatusChange(task.id, nextStatus[task.status]!); setMenuOpen(false) }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Move to {nextStatus[task.status] === 'in_progress' ? 'In Progress' : 'Done'}
                    </button>
                  )}
                  <button
                    onClick={() => { setConfirmDelete(true); setMenuOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">{task.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
          {task.createdAt && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              📅 {new Date(task.createdAt).toLocaleDateString('en-GB')}
            </span>
          )}
        </div>
      </div>
    </>
  )
}

export default function TasksPage() {
  const [showForm, setShowForm]     = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], old =>
        old?.map(t => t.id === id ? { ...t, ...data } : t) ?? []
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks'], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-6">
        {[1,2,3].map(n => (
          <div key={n} className="space-y-3">
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Task Management</h2>
          <p className="text-sm text-gray-500 mt-1">Organize your learning tasks with a Kanban board</p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(({ key, label, headerBg }) => {
          const colTasks = tasks.filter(t => t.status === key)
          return (
            <div key={key}>
              {/* Column header */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-3 ${headerBg}`}>
                <h3 className="font-semibold text-gray-800 text-sm">{label}</h3>
                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={id => deleteMutation.mutate(id)}
                    onEdit={t => { setEditingTask(t); setShowForm(true) }}
                    onStatusChange={(id, status) => updateMutation.mutate({ id, data: { status } })}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-xs text-gray-400">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <TaskForm
          onClose={() => { setShowForm(false); setEditingTask(null) }}
          editingTask={editingTask}
        />
      )}
    </div>
  )
}