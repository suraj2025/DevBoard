import type { Habit } from "../../types"

// Every possible thing that can happen in this UI
export type HabitAction =
  | { type: 'OPEN_FORM' }
  | { type: 'CLOSE_FORM' }
  | { type: 'SET_FILTER'; payload: 'all' | 'done' | 'pending' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_EXPAND'; payload: string }

export type HabitUIState = {
  showForm: boolean
  filter: 'all' | 'done' | 'pending'
  search: string
  expandedId: string | null
}

export const initialHabitState: HabitUIState = {
  showForm: false,
  filter: 'all',
  search: '',
  expandedId: null,
}

// Pure function — same input always gives same output, no side effects
export function habitReducer(state: HabitUIState, action: HabitAction): HabitUIState {
  switch (action.type) {
    case 'OPEN_FORM':
      return { ...state, showForm: true }

    case 'CLOSE_FORM':
      return { ...state, showForm: false }

    case 'SET_FILTER':
      return { ...state, filter: action.payload }

    case 'SET_SEARCH':
      return { ...state, search: action.payload }

    case 'TOGGLE_EXPAND':
      return {
        ...state,
        expandedId: state.expandedId === action.payload ? null : action.payload,
      }

    default:
      return state
  }
}

// Pure helper — derives filtered list from habits + UI state
// No useState, no side effects — just data in, data out
export function getFilteredHabits(habits: Habit[], state: HabitUIState) {
  const today = new Date().toISOString().slice(0, 10)

  return habits
    .filter(h => {
      if (state.search) {
        return h.name.toLowerCase().includes(state.search.toLowerCase())
      }
      return true
    })
    .filter(h => {
      const doneToday = h.completedDates.includes(today)
      if (state.filter === 'done')    return doneToday
      if (state.filter === 'pending') return !doneToday
      return true
    })
}

// Calculates current streak for a habit
export function getStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0

  const sorted = [...completedDates].sort().reverse()
  const today  = new Date().toISOString().slice(0, 10)

  // streak only counts if done today or yesterday
  if (sorted[0] !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (sorted[0] !== yesterday) return 0
  }

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev    = new Date(sorted[i - 1])
    const current = new Date(sorted[i])
    const diff    = (prev.getTime() - current.getTime()) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}