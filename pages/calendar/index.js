const taskService = require('../../utils/taskService')
const dateUtil = require('../../utils/date')

Page({
  data: {
    selectedDate: '',
    visibleTasks: [],
    dayTotal: 0,
    dayTodo: 0,
    dayDone: 0
  },

  onLoad() {
    this.setData({ selectedDate: dateUtil.todayYMD() })
  },

  onShow() {
    const tabbar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabbar && tabbar.setData) tabbar.setData({ selected: 1 })
    this.reload()
  },

  reload() {
    const tasks = taskService.list()
    const selected = this.data.selectedDate

    const dayAll = (tasks || []).filter(t => {
      if (!t) return false
      if (!t.dueDate) return true
      return t.dueDate >= selected
    })

    dayAll.sort((a, b) => {
      const ah = a && a.dueDate ? 1 : 0
      const bh = b && b.dueDate ? 1 : 0
      if (ah !== bh) return bh - ah

      const ad = (a && a.dueDate) || ''
      const bd = (b && b.dueDate) || ''
      if (ad !== bd) return ad > bd ? 1 : -1

      const au = (a && a.updatedAt) || 0
      const bu = (b && b.updatedAt) || 0
      return bu - au
    })

    const dayTotal = dayAll.length
    const dayTodo = dayAll.filter(t => t && !t.completed).length
    const dayDone = dayAll.filter(t => t && !!t.completed).length

    const filtered = dayAll

    const decorated = filtered.map(t => {
      let priorityLabel = '中'
      let priorityClass = 'pill-gray'
      if (t.priority === 'high') {
        priorityLabel = '高'
        priorityClass = 'pill-red'
      } else if (t.priority === 'low') {
        priorityLabel = '低'
        priorityClass = 'pill-green'
      }

      let dueClass = ''
      if (t.dueDate && !t.completed) {
        if (dateUtil.isOverdue(t.dueDate)) dueClass = 'due-over'
        else if (dateUtil.isToday(t.dueDate)) dueClass = 'due-today'
      }

      return {
        ...t,
        priorityLabel,
        priorityClass,
        dueClass
      }
    })

    this.setData({
      visibleTasks: decorated,
      dayTotal,
      dayTodo,
      dayDone
    })
  },

  onDateChange(e) {
    const v = (e.detail && e.detail.value) || dateUtil.todayYMD()
    this.setData({ selectedDate: v })
    this.reload()
  },

  onAddForDate() {
    const d = this.data.selectedDate
    wx.navigateTo({ url: `/pages/edit/index?dueDate=${encodeURIComponent(d)}` })
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    taskService.toggleComplete(id)
    this.reload()
  },

  onShareAppMessage() {
    return {
      title: 'TaskMaster - 任务管理',
      path: '/pages/home/index'
    }
  }
})
