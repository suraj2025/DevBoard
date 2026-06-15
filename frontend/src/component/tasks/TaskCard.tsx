import type { Task } from "../../types"

const priorityStyles = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-green-100 text-green-700',
}

const statusStyles = {
  todo:        'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done:        'bg-emerald-100 text-emerald-700',
}

type Props = {
  task: Task
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: Task['status']) => void
}

export default function TaskCard({ task, onDelete, onStatusChange }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500 text-xs shrink-0 transition-colors"
        >
          ✕
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
          className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer ${statusStyles[task.status]}`}
        >
          <option value="todo">todo</option>
          <option value="in_progress">in progress</option>
          <option value="done">done</option>
        </select>
      </div>

      <p className="text-xs text-gray-400">{task.createdAt.slice(0, 10)}</p>
    </div>
  )
}