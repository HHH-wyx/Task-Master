const taskService = require('../../utils/taskService')

Page({
  data: {
    id: '',
    isEdit: false,
    form: {
      title: '',
      desc: '',
      priority: 'medium',
      dueDate: '',
      completed: false,
      completedAt: null
    },
    priorityOptions: [
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' }
    ],
    priorityIndex: 1
  },

  onLoad(query) {
    const id = query && query.id ? decodeURIComponent(query.id) : ''
    if (id) {
      const task = taskService.get(id)
      if (task) {
        const idx = this.data.priorityOptions.findIndex(p => p.value === task.priority)
        wx.setNavigationBarTitle({ title: '编辑任务' })
        this.setData({
          id,
          isEdit: true,
          form: {
            title: task.title || '',
            desc: task.desc || '',
            priority: task.priority || 'medium',
            dueDate: task.dueDate || '',
            completed: !!task.completed,
            completedAt: task.completedAt || null
          },
          priorityIndex: idx >= 0 ? idx : 1
        })
      }
    } else {
      wx.setNavigationBarTitle({ title: '新建任务' })

      const dueDate = query && query.dueDate ? decodeURIComponent(query.dueDate) : ''
      if (dueDate) {
        this.setData({ 'form.dueDate': dueDate })
      }
    }
  },

  onTitle(e) {
    this.setData({ 'form.title': (e.detail && e.detail.value) || '' })
  },

  onDesc(e) {
    this.setData({ 'form.desc': (e.detail && e.detail.value) || '' })
  },

  onPriority(e) {
    const idx = Number((e.detail && e.detail.value) || 1)
    const opt = this.data.priorityOptions[idx] || this.data.priorityOptions[1]
    this.setData({
      priorityIndex: idx,
      'form.priority': opt.value
    })
  },

  onDueDate(e) {
    const v = (e.detail && e.detail.value) || ''
    this.setData({ 'form.dueDate': v })
  },

  onCompleted(e) {
    const checked = !!(e.detail && e.detail.value)
    this.setData({
      'form.completed': checked,
      'form.completedAt': checked ? Date.now() : null
    })
  },

  onSave() {
    const form = this.data.form || {}
    const title = (form.title || '').trim()
    if (!title) {
      wx.showToast({ title: '请填写标题', icon: 'none' })
      return
    }

    const payload = {
      id: this.data.id || undefined,
      title,
      desc: (form.desc || '').trim(),
      priority: form.priority || 'medium',
      dueDate: form.dueDate || '',
      completed: !!form.completed,
      completedAt: form.completed ? (form.completedAt || Date.now()) : null
    }

    taskService.upsert(payload)
    wx.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => {
      wx.navigateBack({ delta: 1 })
    }, 300)
  },

  onDelete() {
    const id = this.data.id
    if (!id) return

    wx.showModal({
      title: '删除任务',
      content: '确定要删除这条任务吗？',
      confirmText: '删除',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          taskService.remove(id)
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => {
            wx.navigateBack({ delta: 1 })
          }, 300)
        }
      }
    })
  }
})
