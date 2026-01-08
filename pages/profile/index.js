const userService = require('../../utils/userService')
const taskService = require('../../utils/taskService')
const storage = require('../../utils/storage')

const TASKS_KEY = 'tm_tasks_v1'

// 同步任务到云端
function syncTasksToCloud(tasks) {
  return new Promise((resolve, reject) => {
    if (!(wx.cloud && wx.cloud.callFunction)) {
      reject(new Error('未启用云开发'))
      return
    }

    wx.showLoading({ title: '同步中...', mask: true })

    wx.cloud.callFunction({
      name: 'syncTasks',
      data: { tasks }
    }).then(r => {
      wx.hideLoading()
      const data = (r && r.result) ? r.result : {}
      if (data.ok === false) {
        reject(new Error(data.message || '同步失败'))
        return
      }
      resolve(data)
    }).catch(err => {
      wx.hideLoading()
      reject(err)
    })
  })
}

// 从云端拉取任务
function pullTasksFromCloud() {
  return new Promise((resolve, reject) => {
    if (!(wx.cloud && wx.cloud.callFunction)) {
      reject(new Error('未启用云开发'))
      return
    }

    wx.showLoading({ title: '拉取中...', mask: true })

    wx.cloud.callFunction({
      name: 'pullTasks',
      data: {}
    }).then(r => {
      wx.hideLoading()
      const data = (r && r.result) ? r.result : {}
      if (data.ok === false) {
        reject(new Error(data.message || '拉取失败'))
        return
      }
      resolve(data)
    }).catch(err => {
      wx.hideLoading()
      reject(err)
    })
  })
}

Page({
  data: {
    user: null,
    stats: {
      total: 0,
      active: 0,
      done: 0,
      byPriority: { high: 0, medium: 0, low: 0 }
    }
  },

  onShow() {
    try {
      const tabbar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
      if (tabbar && tabbar.setData) {
        tabbar.setData({ selected: 3 })
      }
    } catch (err) {
      console.error('Tabbar设置失败:', err)
    }
    this.reload()
  },

  reload() {
    this.setData({
      user: userService.getUser(),
      stats: taskService.stats()
    })
  },

  onLogin() {
    userService.fetchProfile()
      .then(user => {
        const app = getApp()
        if (app && app.setUser) app.setUser(user)
        this.setData({ user })

        // 登录成功后，从云端拉取任务
        this.pullTasksAfterLogin()
      })
      .catch(err => {
        wx.showToast({ title: err.message || '未授权', icon: 'none' })
      })
  },

  // 登录后从云端拉取任务
  pullTasksAfterLogin() {
    pullTasksFromCloud()
      .then(data => {
        if (data.tasks && data.tasks.length > 0) {
          // 将云端任务保存到本地
          storage.set(TASKS_KEY, data.tasks)
          wx.showToast({
            title: `已恢复 ${data.tasks.length} 个任务`,
            icon: 'success',
            duration: 2000
          })
          // 刷新统计数据
          this.setData({
            stats: taskService.stats()
          })
        } else {
          wx.showToast({
            title: '云端暂无任务',
            icon: 'none',
            duration: 2000
          })
        }
      })
      .catch(err => {
        console.error('拉取任务失败', err)
        wx.showToast({
          title: '拉取任务失败',
          icon: 'none',
          duration: 2000
        })
      })
  },

  // 上传头像
  onChooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        userService.uploadAvatar(res.tempFilePaths[0])
          .then(user => {
            this.setData({ user })
            wx.showToast({ title: '上传成功', icon: 'success' })
          })
          .catch(err => {
            wx.showToast({ title: err.message, icon: 'none' })
          })
      }
    })
  },

  // 修改昵称
  onUpdateNickName() {
    // 尝试使用 editable modal
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: (res) => {
        console.log('Modal返回结果：', res)
        if (res.confirm) {
          const newNickName = res.content || res.editText || ''
          console.log('新昵称：', newNickName)

          if (newNickName && newNickName.trim()) {
            this.updateNickNameToServer(newNickName.trim())
          } else {
            wx.showToast({ title: '昵称不能为空', icon: 'none' })
          }
        }
      },
      fail: (err) => {
        console.error('Modal打开失败：', err)
        // 如果 editable 不支持，使用替代方案
        this.showNickNameInput()
      }
    })
  },

  // 替代方案：使用 prompt 方式
  showNickNameInput() {
    wx.showModal({
      title: '修改昵称',
      content: '请输入新昵称',
      editable: false,
      success: (res) => {
        if (res.confirm) {
          wx.showInput({
            placeholder: '请输入新昵称',
            success: (inputRes) => {
              if (inputRes.value && inputRes.value.trim()) {
                this.updateNickNameToServer(inputRes.value.trim())
              } else {
                wx.showToast({ title: '昵称不能为空', icon: 'none' })
              }
            }
          })
        }
      }
    })
  },

  // 更新昵称到服务器
  updateNickNameToServer(nickName) {
    console.log('准备更新昵称：', nickName)
    userService.updateProfile({ nickName })
      .then(user => {
        console.log('更新成功，用户数据：', user)
        this.setData({ user })
        wx.showToast({ title: '修改成功', icon: 'success' })
      })
      .catch(err => {
        console.error('更新失败：', err)
        console.error('错误详情：', JSON.stringify(err))
        wx.showToast({ title: err.message || '修改失败', icon: 'none' })
      })
  },

  // 删除头像
  onDeleteAvatar() {
    wx.showModal({
      title: '删除头像',
      content: '确定要删除头像吗？',
      success(res) {
        if (res.confirm) {
          userService.deleteOldAvatar()
            .then(() => {
              const user = this.data.user
              user.avatarBase64 = ''
              this.setData({ user })
              wx.showToast({ title: '删除成功', icon: 'success' })
            })
            .catch(err => {
              wx.showToast({ title: err.message, icon: 'none' })
            })
        }
      }
    })
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出吗？退出后会清除本地任务数据，任务已保存在云端，登录后会自动恢复。',
      confirmText: '退出',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          // 获取当前任务，先同步到云端
          const tasks = storage.get(TASKS_KEY, [])

          if (tasks.length > 0) {
            wx.showLoading({ title: '同步中...', mask: true })

            syncTasksToCloud(tasks)
              .then(data => {
                wx.hideLoading()
                // 清除本地数据
                storage.set(TASKS_KEY, [])
                const app = getApp()
                if (app && app.clearUser) app.clearUser()
                this.reload()

                wx.showToast({
                  title: '退出成功，任务已保存',
                  icon: 'success',
                  duration: 2000
                })
              })
              .catch(err => {
                wx.hideLoading()
                console.error('同步任务失败', err)

                // 即使同步失败，也退出登录
                wx.showModal({
                  title: '同步失败',
                  content: '任务同步失败，是否继续退出？',
                  success: (confirmRes) => {
                    if (confirmRes.confirm) {
                      storage.set(TASKS_KEY, [])
                      const app = getApp()
                      if (app && app.clearUser) app.clearUser()
                      this.reload()

                      wx.showToast({
                        title: '退出成功',
                        icon: 'success',
                        duration: 2000
                      })
                    }
                  }
                })
              })
          } else {
            // 没有任务，直接退出
            const app = getApp()
            if (app && app.clearUser) app.clearUser()
            this.reload()

            wx.showToast({
              title: '退出成功',
              icon: 'success',
              duration: 2000
            })
          }
        }
      }
    })
  },

  onGoSync() {
    wx.navigateTo({ url: '/pages/sync/index' })
  },

  onAdd() {
    wx.navigateTo({ url: '/pages/edit/index' })
  },

  onClearAll() {
    wx.showModal({
      title: '清空任务',
      content: '确定要清空所有任务吗？此操作不可恢复。',
      confirmText: '清空',
      confirmColor: '#111827',
      success: (res) => {
        if (res.confirm) {
          storage.set(TASKS_KEY, [])
          this.reload()
          wx.showToast({ title: '已清空', icon: 'success' })
        }
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
