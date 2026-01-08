const taskService = require('../../utils/taskService')
const dateUtil = require('../../utils/date')

Page({
  data: {
    stats: {
      total: 0,
      active: 0,
      done: 0,
      byPriority: {
        high: 0,
        medium: 0,
        low: 0
      }
    },
    progressPercent: 0,
    dueToday: 0,
    overdue: 0
  },

  onShow() {
    const tabbar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabbar && tabbar.setData) tabbar.setData({ selected: 2 })
    this.reload()
  },

  reload() {
    const tasks = taskService.list()
    const s = taskService.stats()
    const percent = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100)

    const dueToday = (tasks || []).filter(t => t && !t.completed && t.dueDate && dateUtil.isToday(t.dueDate)).length
    const overdue = (tasks || []).filter(t => t && !t.completed && t.dueDate && dateUtil.isOverdue(t.dueDate)).length

    this.setData({
      stats: s,
      progressPercent: percent,
      dueToday,
      overdue
    })
  },

  onShareAppMessage() {
    return {
      title: 'TaskMaster - 任务管理',
      path: '/pages/home/index'
    }
  }
})
