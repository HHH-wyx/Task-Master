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

    // 使用数据库存储头像数据（不使用云存储）
    const avatarBase64 = event && typeof event.avatarBase64 === 'string' ? event.avatarBase64.trim() : ''
    const avatarUrl = event && typeof event.avatarUrl === 'string' ? event.avatarUrl.trim() : ''

    if (!avatarBase64 && !avatarUrl) {
      return { ok: false, error: 'MISSING_AVATAR_DATA', message: '缺少头像数据' }
    }

    // 验证Base64数据大小（限制在500KB以内）
    if (avatarBase64 && avatarBase64.length > 700000) {
      return { ok: false, error: 'AVATAR_TOO_LARGE', message: '头像数据过大，请选择较小的图片' }
    }

    const now = Date.now()
    const users = db.collection('users')

    // 检查用户是否存在
    const existing = await users.where({ _openid: openid }).limit(1).get()

    // 准备更新数据
    const updateData = {
      updatedAt: now,
      avatarUpdatedAt: now
    }

    if (avatarBase64) {
      // 如果是Base64数据，直接存储
      updateData.avatarBase64 = avatarBase64
      updateData.avatarUrl = ''
    } else if (avatarUrl) {
      // 如果是URL，存储URL
      updateData.avatarUrl = avatarUrl
      updateData.avatarBase64 = ''
    }

    if (existing && existing.data && existing.data.length) {
      const id = existing.data[0]._id

      // 更新用户头像
      await users.doc(id).update({
        data: updateData
      })

      const latest = await users.doc(id).get()
      return {
        ok: true,
        user: latest.data,
        message: '头像更新成功'
      }
    }

    // 用户不存在，创建新用户
    const addUserRes = await users.add({
      data: {
        _openid: openid,
        openid,
        nickName: '微信用户',
        avatarUrl: updateData.avatarUrl || '',
        avatarBase64: updateData.avatarBase64 || '',
        createdAt: now,
        updatedAt: now,
        avatarUpdatedAt: now
      }
    })

    const latest = await users.doc(addUserRes._id).get()
    return {
      ok: true,
      user: latest.data,
      message: '头像设置成功'
    }
  } catch (error) {
    console.error('[uploadAvatar error]', error)
    return { ok: false, error: 'SERVER_ERROR', message: '服务器错误，请稍后重试' }
  }
}
