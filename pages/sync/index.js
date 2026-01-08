const taskService = require('../../utils/taskService')
const storage = require('../../utils/storage')

const TASKS_KEY = 'tm_tasks_v1'

function safeArray(v) {
  return Array.isArray(v) ? v : []
}

Page({
  data: {
    exportText: '',
    importText: '',
    modeOptions: [
      { label: '合并（按 id 更新/新增）', value: 'merge' },
      { label: '覆盖（清空后导入）', value: 'overwrite' }
    ],
    modeIndex: 0
  },

  onShow() {
    this.refreshExport()
  },

  refreshExport() {
    const tasks = taskService.list()
    const payload = {
      version: 1,
      exportedAt: Date.now(),
      tasks
    }
    this.setData({ exportText: JSON.stringify(payload) })
  },

  onCopy() {
    const text = this.data.exportText || ''
    if (!text) return
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
      }
    })
  },

  onImportInput(e) {
    this.setData({ importText: (e.detail && e.detail.value) || '' })
  },

  onModeChange(e) {
    const idx = Number((e.detail && e.detail.value) || 0)
    this.setData({ modeIndex: idx })
  },

  onImport() {
    const text = (this.data.importText || '').trim()
    if (!text) {
      wx.showToast({ title: '请粘贴 JSON', icon: 'none' })
      return
    }

    let parsed = null
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      wx.showToast({ title: 'JSON 格式错误', icon: 'none' })
      return
    }

    let incoming = []
    if (Array.isArray(parsed)) incoming = parsed
    else if (parsed && Array.isArray(parsed.tasks)) incoming = parsed.tasks
    else {
      wx.showToast({ title: '未识别 tasks 数据', icon: 'none' })
      return
    }

    incoming = safeArray(incoming).filter(t => t && t.id)

    if (incoming.length === 0) {
      wx.showToast({ title: '导入内容为空', icon: 'none' })
      return
    }

    const mode = (this.data.modeOptions[this.data.modeIndex] && this.data.modeOptions[this.data.modeIndex].value) || 'merge'

    wx.showModal({
      title: '确认导入',
      content: `将导入 ${incoming.length} 条任务，方式：${mode === 'merge' ? '合并' : '覆盖'}。`,
      confirmText: '导入',
      success: (res) => {
        if (!res.confirm) return

        if (mode === 'overwrite') {
          storage.set(TASKS_KEY, incoming)
        } else {
          const current = safeArray(storage.get(TASKS_KEY, []))
          const map = {}
          current.forEach(t => {
            if (t && t.id) map[t.id] = t
          })
          incoming.forEach(t => {
            map[t.id] = t
          })
          const merged = Object.keys(map).map(k => map[k])
          storage.set(TASKS_KEY, merged)
        }

        this.setData({ importText: '' })
        this.refreshExport()
        wx.showToast({ title: '导入成功', icon: 'success' })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: 'TaskMaster - 任务管理',
      path: '/pages/home/index'
    }
  }
})
