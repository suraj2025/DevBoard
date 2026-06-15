import { taskHandlers } from './task'
import { authHandlers } from './auth'
import { habitHandlers } from './habits'

export const handlers = [...authHandlers, ...taskHandlers, ...habitHandlers]