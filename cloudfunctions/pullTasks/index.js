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

    // 从云端获取用户的所有任务
    const cloudTasks = db.collection('tasks')
    const result = await cloudTasks.where({ _openid: openid }).orderBy('createdAt', 'desc').get()

    if (result && result.data) {
      return {
        ok: true,
        tasks: result.data,
        count: result.data.length,
        message: `获取到 ${result.data.length} 个任务`
      }
    }

    return {
      ok: true,
      tasks: [],
      count: 0,
      message: '暂无云端任务'
    }
  } catch (error) {
    console.error('[pullTasks error]', error)
    return { ok: false, error: 'SERVER_ERROR', message: '服务器错误，请稍后重试' }
  }
}
