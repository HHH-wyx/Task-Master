const storage = require('./storage')

const TASKS_KEY = 'tm_tasks_v1'

function safeArray(v) {
  return Array.isArray(v) ? v : []
}

function genId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function list() {
  const tasks = safeArray(storage.get(TASKS_KEY, []))
  tasks.sort((a, b) => {
    const ad = a && a.dueDate ? a.dueDate : ''
    const bd = b && b.dueDate ? b.dueDate : ''
    if (ad !== bd) return ad > bd ? 1 : -1
    const au = (a && a.updatedAt) || 0
    const bu = (b && b.updatedAt) || 0
    return bu - au
  })
  return tasks
}

function get(id) {
  const tasks = list()
  return tasks.find(t => t.id === id) || null
}

function saveAll(tasks) {
  return storage.set(TASKS_KEY, tasks)
}

function upsert(payload) {
  const tasks = safeArray(storage.get(TASKS_KEY, []))
  const now = Date.now()

  if (payload && payload.id) {
    const idx = tasks.findIndex(t => t.id === payload.id)
    if (idx >= 0) {
      const old = tasks[idx] || {}
      tasks[idx] = {
        ...old,
        ...payload,
        updatedAt: now
      }
      saveAll(tasks)
      return tasks[idx]
    }
  }

  const task = {
    id: genId(),
    title: (payload && payload.title) || '',
    desc: (payload && payload.desc) || '',
    priority: (payload && payload.priority) || 'medium',
    dueDate: (payload && payload.dueDate) || '',
    completed: !!(payload && payload.completed),
    createdAt: now,
    updatedAt: now,
    completedAt: (payload && payload.completedAt) || null
  }

  tasks.push(task)
  saveAll(tasks)
  return task
}

function remove(id) {
  const tasks = safeArray(storage.get(TASKS_KEY, []))
  const next = tasks.filter(t => t.id !== id)
  saveAll(next)
  return next.length !== tasks.length
}

function toggleComplete(id) {
  const tasks = safeArray(storage.get(TASKS_KEY, []))
  const now = Date.now()
  const idx = tasks.findIndex(t => t.id === id)
  if (idx < 0) return null
  const t = tasks[idx] || {}
  const nextCompleted = !t.completed
  tasks[idx] = {
    ...t,
    completed: nextCompleted,
    updatedAt: now,
    completedAt: nextCompleted ? now : null
  }
  saveAll(tasks)
  return tasks[idx]
}

function stats() {
  const tasks = list()
  const total = tasks.length
  const done = tasks.filter(t => t && t.completed).length
  const active = total - done
  const byPriority = {
    high: tasks.filter(t => t && t.priority === 'high').length,
    medium: tasks.filter(t => t && t.priority === 'medium').length,
    low: tasks.filter(t => t && t.priority === 'low').length
  }

  return {
    total,
    done,
    active,
    byPriority
  }
}

module.exports = {
  list,
  get,
  upsert,
  remove,
  toggleComplete,
  stats
}
