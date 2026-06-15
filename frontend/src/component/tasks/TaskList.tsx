import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, deleteTask, updateTask } from '../../api/tasks'
import TaskCard from './TaskCard'
import type { Task } from '../../types'

export default function TaskList() {
  const queryClient = useQueryClient()

  // ---- useQuery: fetch and cache tasks ----
  const { data: tasks, isLoading, isError, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })

  // ---- useMutation: delete ----
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      // tell React Query the 'tasks' cache is stale → refetches automatically
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // ---- useMutation: update status ----
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
      updateTask(id, data),

    // Optimistic update — update UI instantly, roll back if server fails
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])

      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...data } : t)) ?? []
      )

      return { previous } // context — used in onError to rollback
    },
    onError: (_err, _vars, context) => {
      // server failed → restore previous data
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // ---- Render states ----
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500 text-sm">
        Failed to load tasks: {(error as Error).message}
      </div>
    )
  }

  if (!tasks?.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No tasks yet. Add one above.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={(id) => deleteMutation.mutate(id)}
          onStatusChange={(id, status) =>
            updateMutation.mutate({ id, data: { status } })
          }
        />
      ))}
    </div>
  )
}