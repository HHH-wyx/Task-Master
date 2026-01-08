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

    const user = event && event.user ? event.user : {}
    const now = Date.now()

    // 数据验证
    const nickName = typeof user.nickName === 'string' ? user.nickName.trim().slice(0, 32) : '微信用户'
    const avatarUrl = typeof user.avatarUrl === 'string' ? user.avatarUrl.trim().slice(0, 500) : ''

    // 验证性别 0:未知 1:男 2:女
    const gender = [0, 1, 2].includes(user.gender) ? user.gender : 0
    const province = typeof user.province === 'string' ? user.province.trim().slice(0, 32) : ''
    const city = typeof user.city === 'string' ? user.city.trim().slice(0, 32) : ''

    // 构建用户数据
    const doc = {
      _openid: openid,
      openid,
      nickName,
      avatarUrl,
      gender,
      province,
      city,
      createdAt: now,
      updatedAt: now,
      // 登录凭证令牌，用于验证
      sessionToken: `${openid}_${now}_${Math.random().toString(36).substr(2, 16)}`,
      lastLoginAt: now
    }

    const users = db.collection('users')

    // 检查用户是否已存在
    const existing = await users.where({ _openid: openid }).limit(1).get()

    if (existing && existing.data && existing.data.length) {
      const id = existing.data[0]._id
      // 更新用户信息
      await users.doc(id).update({
        data: {
          nickName: doc.nickName,
          avatarUrl: doc.avatarUrl,
          gender: doc.gender,
          province: doc.province,
          city: doc.city,
          sessionToken: doc.sessionToken,
          lastLoginAt: doc.lastLoginAt,
          updatedAt: now
        }
      })
      const latest = await users.doc(id).get()
      return { ok: true, user: latest.data, message: '登录成功' }
    }

    // 新用户注册
    const addRes = await users.add({ data: doc })
    const latest = await users.doc(addRes._id).get()
    return { ok: true, user: latest.data, message: '注册成功' }
  } catch (error) {
    console.error('[login error]', error)
    return { ok: false, error: 'SERVER_ERROR', message: '服务器错误，请稍后重试' }
  }
}
