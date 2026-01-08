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

    const tasks = event && event.tasks ? event.tasks : []

    if (!Array.isArray(tasks)) {
      return { ok: false, error: 'INVALID_TASKS', message: '任务数据格式错误' }
    }

    // 清空该用户的所有旧任务
    const cloudTasks = db.collection('tasks')
    await cloudTasks.where({ _openid: openid }).remove()

    // 如果有新任务，批量添加
    if (tasks.length > 0) {
      // 为每个任务添加 _openid 字段
      const tasksWithOpenid = tasks.map(task => ({
        ...task,
        _openid: openid,
        syncedAt: Date.now()
      }))

      // 批量添加任务
      await cloudTasks.add({
        data: tasksWithOpenid
      })
    }

    return {
      ok: true,
      message: tasks.length > 0 ? `已同步 ${tasks.length} 个任务` : '任务已清空',
      count: tasks.length
    }
  } catch (error) {
    console.error('[syncTasks error]', error)
    return { ok: false, error: 'SERVER_ERROR', message: '服务器错误，请稍后重试' }
  }
}
