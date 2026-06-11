import { taskHandlers } from './task'
import { authHandlers } from './auth'

export const handlers = [...authHandlers, ...taskHandlers]