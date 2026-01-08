const storage = require('./storage')

const USER_KEY = 'tm_user_v1'

function getUser() {
  return storage.get(USER_KEY, null)
}

function setUser(user) {
  return storage.set(USER_KEY, user)
}

function clearUser() {
  return storage.remove(USER_KEY)
}

function fetchProfile() {
  return new Promise((resolve, reject) => {
    if (!wx.getUserProfile) {
      reject(new Error('当前基础库不支持 getUserProfile'))
      return
    }

    wx.getUserProfile({
      desc: '用于展示头像和昵称',
      success(res) {
        const info = res.userInfo || {}
        const user = {
          nickName: info.nickName || '微信用户',
          avatarUrl: info.avatarUrl || '',
          gender: info.gender || 0,
          province: info.province || '',
          city: info.city || '',
          updatedAt: Date.now()
        }
        const doResolve = (finalUser) => {
          setUser(finalUser)
          resolve(finalUser)
        }

        if (wx.cloud && wx.cloud.callFunction) {
          wx.cloud.callFunction({
            name: 'login',
            data: { user }
          }).then(r => {
            const data = (r && r.result) ? r.result : {}
            if (data.ok === false) {
              reject(new Error(data.message || '登录失败'))
              return
            }
            doResolve(Object.assign({}, user, data.user || {}))
          }).catch(err => {
            reject(err || new Error('登录失败'))
          })
        } else {
          doResolve(user)
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

function updateProfile({ nickName, avatarUrl }) {
  return new Promise((resolve, reject) => {
    if (!(wx.cloud && wx.cloud.callFunction)) {
      reject(new Error('未启用云开发'))
      return
    }

    wx.cloud.callFunction({
      name: 'updateProfile',
      data: { nickName, avatarUrl }
    }).then(r => {
      const data = (r && r.result) ? r.result : {}
      if (data.ok === false) {
        reject(new Error(data.message || '更新失败'))
        return
      }
      const user = data.user || null
      if (user) setUser(user)
      resolve(user)
    }).catch(reject)
  })
}

function validateAvatar(tempFilePath) {
  return new Promise((resolve, reject) => {
    if (!(wx.cloud && wx.cloud.callFunction)) {
      reject(new Error('未启用云开发'))
      return
    }

    wx.getFileInfo({
      filePath: tempFilePath,
      success(res) {
        const fileSize = res.size || 0
        const fileType = res.type || ''

        // 读取文件并转换为Base64
        const fs = wx.getFileSystemManager()
        fs.readFile({
          filePath: tempFilePath,
          encoding: 'base64',
          success(readRes) {
            // 构建完整的Base64字符串
            const base64Data = `data:${fileType || 'image/jpeg'};base64,${readRes.data}`

            wx.cloud.callFunction({
              name: 'validateAvatar',
              data: {
                avatarBase64: base64Data,
                fileSize,
                fileType
              }
            }).then(r => {
              const data = (r && r.result) ? r.result : {}
              if (data.ok === false) {
                reject(new Error(data.message || '文件验证失败'))
                return
              }
              resolve({
                ...data.data,
                base64Data
              })
            }).catch(reject)
          },
          fail(err) {
            reject(new Error('读取文件失败'))
          }
        })
      },
      fail(err) {
        reject(new Error('获取文件信息失败'))
      }
    })
  })
}

function uploadAvatar(tempFilePath) {
  return new Promise((resolve, reject) => {
    if (!(wx.cloud && wx.cloud.callFunction)) {
      reject(new Error('未启用云开发'))
      return
    }
    if (!tempFilePath) {
      reject(new Error('缺少文件路径'))
      return
    }

    // 先验证文件
    validateAvatar(tempFilePath)
      .then(data => {
        const base64Data = data.base64Data

        wx.showLoading({ title: '上传中...', mask: true })

        // 调用云函数直接存储Base64数据到数据库
        return wx.cloud.callFunction({
          name: 'uploadAvatar',
          data: { avatarBase64: base64Data }
        })
      })
      .then(r => {
        wx.hideLoading()
        const data = (r && r.result) ? r.result : {}
        if (data.ok === false) {
          reject(new Error(data.message || '头像更新失败'))
          return
        }
        const user = data.user || null
        if (user) setUser(user)
        resolve(user)
      })
      .catch(err => {
        wx.hideLoading()
        reject(err)
      })
  })
}

function getUserInfo() {
  return new Promise((resolve, reject) => {
    if (!(wx.cloud && wx.cloud.callFunction)) {
      reject(new Error('未启用云开发'))
      return
    }

    wx.cloud.callFunction({
      name: 'userOperation',
      data: { action: 'get' }
    }).then(r => {
      const data = (r && r.result) ? r.result : {}
      if (data.ok === false) {
        reject(new Error(data.message || '获取用户信息失败'))
        return
      }
      const user = data.user || null
      if (user) setUser(user)
      resolve(user)
    }).catch(reject)
  })
}

function verifySession(sessionToken) {
  return new Promise((resolve, reject) => {
    if (!(wx.cloud && wx.cloud.callFunction)) {
      reject(new Error('未启用云开发'))
      return
    }

    wx.cloud.callFunction({
      name: 'userOperation',
      data: { action: 'verifySession', sessionToken }
    }).then(r => {
      const data = (r && r.result) ? r.result : {}
      if (data.ok === false) {
        reject(new Error(data.message || '会话验证失败'))
        return
      }
      resolve(data.valid === true)
    }).catch(reject)
  })
}

function deleteOldAvatar(fileID) {
  return new Promise((resolve, reject) => {
    if (!(wx.cloud && wx.cloud.callFunction)) {
      reject(new Error('未启用云开发'))
      return
    }

    wx.cloud.callFunction({
      name: 'userOperation',
      data: { action: 'deleteOldAvatar', fileID }
    }).then(r => {
      const data = (r && r.result) ? r.result : {}
      if (data.ok === false) {
        reject(new Error(data.message || '删除失败'))
        return
      }
      resolve(true)
    }).catch(reject)
  })
}

function cleanUploadHistory() {
  return new Promise((resolve, reject) => {
    if (!(wx.cloud && wx.cloud.callFunction)) {
      reject(new Error('未启用云开发'))
      return
    }

    wx.cloud.callFunction({
      name: 'userOperation',
      data: { action: 'cleanUploadHistory' }
    }).then(r => {
      const data = (r && r.result) ? r.result : {}
      if (data.ok === false) {
        reject(new Error(data.message || '清理失败'))
        return
      }
      resolve(true)
    }).catch(reject)
  })
}

module.exports = {
  getUser,
  setUser,
  clearUser,
  fetchProfile,
  updateProfile,
  validateAvatar,
  uploadAvatar,
  getUserInfo,
  verifySession,
  deleteOldAvatar,
  cleanUploadHistory
}

