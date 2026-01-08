const taskService = require('../../utils/taskService')
const userService = require('../../utils/userService')
const dateUtil = require('../../utils/date')
const storage = require('../../utils/storage')

const REMIND_KEY = 'tm_last_remind_ymd_v1'

Page({
  data: {
    user: null,
    tasks: [],
    visibleTasks: [],
    filterTab: 'all',
    keyword: '',
    priorityOptions: [
      { label: '全部', value: 'all' },
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' }
    ],
    priorityIndex: 0,
    progressPercent: 0,
    progressText: '0/0 已完成'
  },

  onShow() {
    const tabbar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabbar && tabbar.setData) tabbar.setData({ selected: 0 })
    this.reload()
  },

  reload() {
    const user = userService.getUser()
    const tasks = taskService.list()
    this.setData({ user, tasks })
    this.applyFilter()
    this.updateProgress()
    this.maybeRemindToday(tasks)
  },

  updateProgress() {
    const s = taskService.stats()
    const percent = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100)
    this.setData({
      progressPercent: percent,
      progressText: `${s.done}/${s.total} 已完成`
    })
  },

  maybeRemindToday(tasks) {
    const today = dateUtil.todayYMD()
    const last = storage.get(REMIND_KEY, '')
    if (last === today) return

    const dueToday = (tasks || []).filter(t => t && !t.completed && t.dueDate && dateUtil.isToday(t.dueDate))
    if (dueToday.length > 0) {
      wx.showToast({
        title: `今日到期 ${dueToday.length} 条`,
        icon: 'none',
        duration: 2500
      })
    }
    storage.set(REMIND_KEY, today)
  },

  applyFilter() {
    const { tasks, filterTab, keyword, priorityOptions, priorityIndex } = this.data
    const pValue = (priorityOptions[priorityIndex] && priorityOptions[priorityIndex].value) || 'all'
    const kw = (keyword || '').trim().toLowerCase()

    const filtered = (tasks || []).filter(t => {
      if (!t) return false
      if (filterTab === 'active' && t.completed) return false
      if (filterTab === 'done' && !t.completed) return false
      if (pValue !== 'all' && t.priority !== pValue) return false
      if (kw) {
        const hay = `${t.title || ''} ${t.desc || ''}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
      return true
    })

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

    this.setData({ visibleTasks: decorated })
  },

  onKeywordInput(e) {
    this.setData({ keyword: (e.detail && e.detail.value) || '' })
    this.applyFilter()
  },

  onTab(e) {
    const v = e.currentTarget.dataset.value
    this.setData({ filterTab: v })
    this.applyFilter()
  },

  onPriorityChange(e) {
    const idx = Number((e.detail && e.detail.value) || 0)
    this.setData({ priorityIndex: idx })
    this.applyFilter()
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/edit/index' })
  },

  onOpen(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: `/pages/edit/index?id=${encodeURIComponent(id)}` })
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({ url: `/pages/edit/index?id=${encodeURIComponent(id)}` })
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    taskService.toggleComplete(id)
    this.reload()
  },

  onLogin() {
    userService.fetchProfile()
      .then(user => {
        const app = getApp()
        if (app && app.setUser) app.setUser(user)
        this.setData({ user })
      })
      .catch(() => {
        wx.showToast({ title: '未授权', icon: 'none' })
      })
  },

  onShareAppMessage() {
    return {
      title: 'TaskMaster - 任务管理',
      path: '/pages/home/index'
    }
  }
})
