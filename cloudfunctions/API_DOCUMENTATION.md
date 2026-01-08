# 用户登录和头像修改功能 API 文档

## 一、云函数 API

### 1. login - 用户注册/登录

**功能：** 用户注册和登录，支持微信授权登录

**调用方法：**
```javascript
wx.cloud.callFunction({
  name: 'login',
  data: {
    user: {
      nickName: '用户昵称',
      avatarUrl: '头像URL',
      gender: 1,
      province: '省份',
      city: '城市'
    }
  }
})
```

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| user.nickName | String | 否 | 用户昵称（最长32字符） |
| user.avatarUrl | String | 否 | 头像URL（最长500字符） |
| user.gender | Number | 否 | 性别（0:未知 1:男 2:女） |
| user.province | String | 否 | 省份（最长32字符） |
| user.city | String | 否 | 城市（最长32字符） |

**返回结果：**
```javascript
{
  ok: true,                    // 操作是否成功
  user: {                      // 用户信息对象
    _id: '用户ID',
    _openid: 'openid',
    nickName: '昵称',
    avatarUrl: '头像URL',
    sessionToken: '会话令牌',
    // ...其他字段
  },
  message: '注册成功/登录成功'
}
```

**错误码：**
- `OPENID_MISSING`: 获取用户标识失败
- `SERVER_ERROR`: 服务器错误

---

### 2. validateAvatar - 头像文件验证

**功能：** 验证上传的头像文件是否符合要求

**调用方法：**
```javascript
wx.cloud.callFunction({
  name: 'validateAvatar',
  data: {
    tempFilePath: '临时文件路径',
    fileSize: 123456,          // 文件大小（字节）
    fileType: 'image/jpeg'     // 文件类型
  }
})
```

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| tempFilePath | String | 是 | 临时文件路径 |
| fileSize | Number | 是 | 文件大小（字节） |
| fileType | String | 否 | 文件MIME类型 |

**限制条件：**
- 文件大小：1KB ~ 5MB
- 支持格式：JPEG、PNG、GIF、WebP
- 每天最多上传10次头像

**返回结果：**
```javascript
{
  ok: true,
  message: '文件验证通过',
  data: {
    maxSize: 5242880,          // 最大文件大小
    minSize: 1024,             // 最小文件大小
    allowedTypes: ['image/jpeg', 'image/png', ...],
    allowedExtensions: ['jpg', 'png', ...],
    ext: 'jpg'                 // 文件扩展名
  }
}
```

**错误码：**
- `MISSING_FILEPATH`: 缺少文件路径
- `FILE_TOO_LARGE`: 文件大小超过5MB
- `FILE_TOO_SMALL`: 文件大小小于1KB
- `INVALID_FILE_TYPE`: 不支持的文件格式
- `INVALID_EXTENSION`: 不支持的文件扩展名
- `UPLOAD_LIMIT_EXCEEDED`: 今日上传次数已达上限

---

### 3. uploadAvatar - 头像上传

**功能：** 上传用户头像并更新用户信息

**调用方法：**
```javascript
wx.cloud.callFunction({
  name: 'uploadAvatar',
  data: {
    fileID: 'cloud://xxx.avatars/xxx.jpg',
    filePath: 'avatars/xxx.jpg'
  }
})
```

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| fileID | String | 是 | 云存储文件ID |
| filePath | String | 否 | 文件存储路径 |

**返回结果：**
```javascript
{
  ok: true,
  uploadId: '上传记录ID',
  user: {                      // 更新后的用户信息
    _id: '用户ID',
    avatarUrl: '头像URL',
    avatarUpdatedAt: 1234567890,
    // ...其他字段
  },
  message: '头像更新成功'
}
```

**错误码：**
- `OPENID_MISSING`: 获取用户标识失败
- `MISSING_FILEID`: 缺少文件ID
- `FILEID_TOO_LONG`: 文件ID过长
- `INVALID_FILE_TYPE`: 不支持的文件格式
- `SERVER_ERROR`: 服务器错误

---

### 4. updateProfile - 更新用户资料

**功能：** 更新用户昵称和头像

**调用方法：**
```javascript
wx.cloud.callFunction({
  name: 'updateProfile',
  data: {
    nickName: '新昵称',
    avatarUrl: '新头像URL'
  }
})
```

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickName | String | 否 | 新昵称（最长32字符） |
| avatarUrl | String | 否 | 新头像URL（最长500字符） |

**限制条件：**
- 昵称只支持中文、英文、数字、下划线和空格
- 至少提供 nickName 或 avatarUrl 其中一个

**返回结果：**
```javascript
{
  ok: true,
  user: {                      // 更新后的用户信息
    _id: '用户ID',
    nickName: '新昵称',
    avatarUrl: '新头像URL',
    avatarUpdatedAt: 1234567890,
    // ...其他字段
  },
  message: '更新成功'
}
```

**错误码：**
- `OPENID_MISSING`: 获取用户标识失败
- `NO_CHANGES`: 没有需要更新的内容
- `NICKNAME_TOO_LONG`: 昵称不能超过32个字符
- `NICKNAME_INVALID`: 昵称包含非法字符
- `AVATARURL_TOO_LONG`: 头像地址过长
- `SERVER_ERROR`: 服务器错误

---

### 5. userOperation - 用户操作管理

**功能：** 提供多种用户操作（获取信息、删除旧头像、清理历史、验证会话）

#### 5.1 获取用户信息

```javascript
wx.cloud.callFunction({
  name: 'userOperation',
  data: { action: 'get' }
})
```

**返回结果：**
```javascript
{
  ok: true,
  user: { ... },               // 用户信息
  message: '获取成功'
}
```

#### 5.2 删除旧头像

```javascript
wx.cloud.callFunction({
  name: 'userOperation',
  data: {
    action: 'deleteOldAvatar',
    fileID: 'cloud://xxx.avatars/xxx.jpg'
  }
})
```

**返回结果：**
```javascript
{
  ok: true,
  message: '旧头像删除成功'
}
```

#### 5.3 清理上传历史（保留最近5条）

```javascript
wx.cloud.callFunction({
  name: 'userOperation',
  data: { action: 'cleanUploadHistory' }
})
```

**返回结果：**
```javascript
{
  ok: true,
  message: '清理完成，保留最近5条记录'
}
```

#### 5.4 验证会话令牌

```javascript
wx.cloud.callFunction({
  name: 'userOperation',
  data: {
    action: 'verifySession',
    sessionToken: '会话令牌'
  }
})
```

**返回结果：**
```javascript
{
  ok: true,
  valid: true,                 // 会话是否有效
  user: { ... },               // 用户信息
  message: '会话有效'
}
```

**错误码：**
- `OPENID_MISSING`: 获取用户标识失败
- `USER_NOT_FOUND`: 用户不存在
- `MISSING_FILEID`: 缺少文件ID
- `MISSING_TOKEN`: 缺少会话令牌
- `INVALID_TOKEN`: 会话令牌无效
- `INVALID_ACTION`: 无效的操作
- `SERVER_ERROR`: 服务器错误

---

## 二、前端工具方法

### userService 工具类

位于 `utils/userService.js`

#### 可用方法：

1. `getUser()` - 获取本地存储的用户信息
2. `setUser(user)` - 保存用户信息到本地
3. `clearUser()` - 清除本地用户信息
4. `fetchProfile()` - 获取微信用户资料并登录
5. `updateProfile({ nickName, avatarUrl })` - 更新用户资料
6. `validateAvatar(tempFilePath)` - 验证头像文件
7. `uploadAvatar(tempFilePath)` - 上传头像
8. `getUserInfo()` - 从云端获取用户信息
9. `verifySession(sessionToken)` - 验证会话令牌
10. `deleteOldAvatar(fileID)` - 删除旧头像
11. `cleanUploadHistory()` - 清理上传历史

---

## 三、使用示例

### 示例1：用户登录

```javascript
const userService = require('../../utils/userService')

userService.fetchProfile()
  .then(user => {
    console.log('登录成功', user)
    // 保存用户信息到全局
    getApp().setUser(user)
  })
  .catch(err => {
    console.error('登录失败', err)
    wx.showToast({ title: err.message, icon: 'none' })
  })
```

### 示例2：上传头像

```javascript
const userService = require('../../utils/userService')

// 选择图片
wx.chooseImage({
  count: 1,
  sizeType: ['compressed'],
  sourceType: ['album', 'camera'],
  success(res) {
    const tempFilePath = res.tempFilePaths[0]

    // 上传头像
    userService.uploadAvatar(tempFilePath)
      .then(user => {
        console.log('头像上传成功', user)
        wx.showToast({ title: '上传成功', icon: 'success' })
      })
      .catch(err => {
        console.error('头像上传失败', err)
        wx.showToast({ title: err.message, icon: 'none' })
      })
  }
})
```

### 示例3：更新昵称

```javascript
const userService = require('../../utils/userService')

userService.updateProfile({
  nickName: '新昵称'
})
  .then(user => {
    console.log('更新成功', user)
    wx.showToast({ title: '更新成功', icon: 'success' })
  })
  .catch(err => {
    console.error('更新失败', err)
    wx.showToast({ title: err.message, icon: 'none' })
  })
```

### 示例4：验证会话

```javascript
const userService = require('../../utils/userService')

const user = userService.getUser()
if (user && user.sessionToken) {
  userService.verifySession(user.sessionToken)
    .then(valid => {
      if (valid) {
        console.log('会话有效')
      } else {
        console.log('会话已过期，需要重新登录')
      }
    })
    .catch(err => {
      console.error('会话验证失败', err)
    })
}
```

---

## 四、安全说明

### 1. 数据验证
- 所有输入参数都经过严格验证和清理
- 字符串长度限制防止溢出攻击
- 文件格式和大小验证防止恶意文件上传

### 2. 访问控制
- 所有云函数都使用 `cloud.getWXContext()` 获取真实的用户OpenID
- 数据库集合使用安全规则，用户只能访问自己的数据
- 会话令牌机制用于验证用户身份

### 3. 频率限制
- 每天最多上传10次头像，防止滥用
- 每次上传前都会验证文件大小和格式

### 4. 数据清理
- `cleanUploadHistory` 方法可以清理旧的头像文件
- 保留最近5条上传记录，其他自动删除

---

## 五、部署说明

### 1. 云函数部署
需要部署以下云函数：
- `login` - 用户登录
- `uploadAvatar` - 头像上传
- `updateProfile` - 更新用户资料
- `validateAvatar` - 头像文件验证
- `userOperation` - 用户操作管理

### 2. 数据库配置
在微信云开发控制台创建以下集合并配置安全规则：
- `users` - 用户信息表
- `user-uploads` - 用户上传记录表

### 3. 云存储配置
在微信云开发控制台创建存储目录：
- `avatars/` - 用户头像存储目录

### 4. 安全规则配置
参考 `cloudfunctions/database_rules/README.md` 配置数据库和云存储安全规则。
