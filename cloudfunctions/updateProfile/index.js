const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    if (!openid) {
      return { ok: false, error: 'OPENID_MISSING', message: '获取用户标识失败' }
    }

    // 参数验证
    const nickName = event && typeof event.nickName === 'string' ? event.nickName.trim() : ''
    const avatar = event && typeof event.avatarUrl === 'string' ? event.avatarUrl.trim() : ''

    // 验证至少有一个字段需要更新
    if (!nickName && !avatar) {
      return { ok: false, error: 'NO_CHANGES', message: '没有需要更新的内容' }
    }

    // 验证昵称长度和格式
    if (nickName && nickName.length > 32) {
      return { ok: false, error: 'NICKNAME_TOO_LONG', message: '昵称不能超过32个字符' }
    }

    if (nickName && !/^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/.test(nickName)) {
      return { ok: false, error: 'NICKNAME_INVALID', message: '昵称包含非法字符' }
    }

    // 验证头像URL长度
    if (avatar && avatar.length > 500) {
      return { ok: false, error: 'AVATARURL_TOO_LONG', message: '头像地址过长' }
    }

    const now = Date.now()
    const update = { updatedAt: now }
    if (nickName) update.nickName = nickName
    if (avatar) {
      update.avatarUrl = avatar
      update.avatarUpdatedAt = now
    }

    const users = db.collection('users')

    // 检查用户是否存在
    const existing = await users.where({ _openid: openid }).limit(1).get()

    if (existing && existing.data && existing.data.length) {
      const id = existing.data[0]._id
      await users.doc(id).update({ data: update })
      const latest = await users.doc(id).get()
      return { ok: true, user: latest.data, message: '更新成功' }
    }

    // 用户不存在，创建新用户
    const addRes = await users.add({
      data: {
        _openid: openid,
        openid,
        nickName: update.nickName || '微信用户',
        avatarUrl: update.avatarUrl || '',
        createdAt: now,
        updatedAt: now,
        avatarUpdatedAt: update.avatarUrl ? now : null
      }
    })
    const latest = await users.doc(addRes._id).get()
    return { ok: true, user: latest.data, message: '创建成功' }
  } catch (error) {
    console.error('[updateProfile error]', error)
    return { ok: false, error: 'SERVER_ERROR', message: '服务器错误，请稍后重试' }
  }
}
