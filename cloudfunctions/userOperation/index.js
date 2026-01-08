const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    if (!openid) {
      return { ok: false, error: 'OPENID_MISSING', message: '获取用户标识失败' }
    }

    const action = event && typeof event.action === 'string' ? event.action : ''

    // 获取用户信息
    if (action === 'get') {
      const users = db.collection('users')
      const existing = await users.where({ _openid: openid }).limit(1).get()

      if (existing && existing.data && existing.data.length) {
        return { ok: true, user: existing.data[0], message: '获取成功' }
      }

      return { ok: false, error: 'USER_NOT_FOUND', message: '用户不存在' }
    }

    // 删除旧头像（不使用云存储）
    if (action === 'deleteOldAvatar') {
      // 清除用户的头像Base64数据
      const users = db.collection('users')
      await users
        .where({ _openid: openid })
        .update({
          data: {
            avatarBase64: '',
            avatarUrl: '',
            updatedAt: Date.now()
          }
        })

      return { ok: true, message: '头像已清除' }
    }

    // 清除用户上传历史（不使用云存储，此功能保留用于未来扩展）
    if (action === 'cleanUploadHistory') {
      // 由于不使用云存储，此功能目前不适用
      return { ok: true, message: '无需清理（当前不使用云存储）' }
    }

    // 验证会话令牌
    if (action === 'verifySession') {
      const sessionToken = event && typeof event.sessionToken === 'string' ? event.sessionToken.trim() : ''

      if (!sessionToken) {
        return { ok: false, error: 'MISSING_TOKEN', message: '缺少会话令牌' }
      }

      const users = db.collection('users')
      const existing = await users
        .where({
          _openid: openid,
          sessionToken: sessionToken
        })
        .limit(1)
        .get()

      if (existing && existing.data && existing.data.length) {
        return { ok: true, valid: true, user: existing.data[0], message: '会话有效' }
      }

      return { ok: false, error: 'INVALID_TOKEN', message: '会话令牌无效' }
    }

    return { ok: false, error: 'INVALID_ACTION', message: '无效的操作' }
  } catch (error) {
    console.error('[userOperation error]', error)
    return { ok: false, error: 'SERVER_ERROR', message: '服务器错误，请稍后重试' }
  }
}
