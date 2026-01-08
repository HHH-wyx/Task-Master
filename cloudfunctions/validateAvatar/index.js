const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    if (!openid) {
      return { ok: false, error: 'OPENID_MISSING', message: '获取用户标识失败' }
    }

    // Base64数据大小限制（字符数）- 500KB图片约700KB的Base64字符串
    const MAX_BASE64_SIZE = 700000
    // 最小Base64大小 - 1KB图片约1.5KB的Base64字符串
    const MIN_BASE64_SIZE = 1500

    // 支持的图片格式
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']

    const avatarBase64 = event && typeof event.avatarBase64 === 'string' ? event.avatarBase64.trim() : ''
    const fileSize = event && typeof event.fileSize === 'number' ? event.fileSize : 0
    const fileType = event && typeof event.fileType === 'string' ? event.fileType.trim() : ''

    if (!avatarBase64) {
      return { ok: false, error: 'MISSING_AVATAR_DATA', message: '缺少头像数据' }
    }

    // 验证是否是Base64格式
    const base64Regex = /^data:image\/([a-zA-Z]+);base64,/
    const match = avatarBase64.match(base64Regex)

    if (!match) {
      return { ok: false, error: 'INVALID_BASE64_FORMAT', message: '无效的Base64格式' }
    }

    const mimeType = `image/${match[1]}`
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return { ok: false, error: 'INVALID_FILE_TYPE', message: '不支持的文件格式，仅支持 JPG、PNG、GIF、WebP' }
    }

    // 验证Base64数据大小
    if (avatarBase64.length > MAX_BASE64_SIZE) {
      return { ok: false, error: 'AVATAR_TOO_LARGE', message: '图片过大，请选择小于500KB的图片' }
    }

    if (avatarBase64.length < MIN_BASE64_SIZE) {
      return { ok: false, error: 'AVATAR_TOO_SMALL', message: '图片过小，请选择大于1KB的图片' }
    }

    // 如果提供了文件大小信息，也验证一下
    if (fileSize > 0 && fileSize > 512000) {
      return { ok: false, error: 'AVATAR_TOO_LARGE', message: '图片过大，请选择小于500KB的图片' }
    }

    // 验证文件类型
    if (fileType && !ALLOWED_MIME_TYPES.includes(fileType)) {
      return { ok: false, error: 'INVALID_FILE_TYPE', message: '不支持的文件格式，仅支持 JPG、PNG、GIF、WebP' }
    }

    // 验证通过
    return {
      ok: true,
      message: '文件验证通过',
      data: {
        maxSize: MAX_BASE64_SIZE,
        minSize: MIN_BASE64_SIZE,
        allowedTypes: ALLOWED_MIME_TYPES,
        mimeType
      }
    }
  } catch (error) {
    console.error('[validateAvatar error]', error)
    return { ok: false, error: 'SERVER_ERROR', message: '服务器错误，请稍后重试' }
  }
}
