# 数据库存储方案说明

## 📋 方案变更

由于免费云开发的存储空间有限，我们已将方案改为**完全使用数据库存储**，不再使用云存储。

---

## 🔧 已修改的云函数

### 1. uploadAvatar - 头像上传
**修改前：**
- 上传图片到云存储
- 存储云存储的 fileID

**修改后：**
- 将图片转换为 Base64 格式
- 直接存储 Base64 字符串到数据库
- 不占用云存储空间

### 2. validateAvatar - 文件验证
**修改前：**
- 验证文件大小、格式
- 验证云存储路径

**修改后：**
- 验证 Base64 数据格式
- 验证 Base64 数据大小（限制 500KB 以内）
- 验证图片格式（JPEG、PNG、GIF、WebP）

### 3. userOperation - 用户操作
**修改前：**
- 删除云存储文件
- 清理上传历史

**修改后：**
- 清除数据库中的 Base64 头像数据
- 不涉及云存储操作

---

## 📊 数据库字段变化

### users 集合新增字段：
```javascript
{
  avatarBase64: "data:image/jpeg;base64,/9j/4AAQ...",  // Base64 头像数据
  avatarUrl: "",                                        // 空字符串（不使用云存储）
  avatarUpdatedAt: 1234567890                            // 头像更新时间
}
```

---

## 🚀 使用方法（无需云存储）

### 1. 上传头像
```javascript
const userService = require('../../utils/userService')

wx.chooseImage({
  count: 1,
  sizeType: ['compressed'],
  sourceType: ['album', 'camera'],
  success(res) {
    const tempFilePath = res.tempFilePaths[0]
    userService.uploadAvatar(tempFilePath)
      .then(user => {
        console.log('头像上传成功', user)
        // user.avatarBase64 包含 Base64 数据
      })
      .catch(err => {
        console.error('上传失败', err)
      })
  }
})
```

### 2. 显示头像
```javascript
const userService = require('../../utils/userService')

const user = userService.getUser()

// 在 WXML 中显示
<image src="{{user.avatarBase64 || defaultAvatar}}" mode="aspectFill" />

// 或者使用默认头像
<image src="{{user.avatarBase64 || '/images/default-avatar.png'}}" />
```

### 3. 删除头像
```javascript
const userService = require('../../utils/userService')

userService.deleteOldAvatar()
  .then(() => {
    console.log('头像已删除')
  })
  .catch(err => {
    console.error('删除失败', err)
  })
```

---

## ⚠️ 注意事项

### 1. 文件大小限制
- 头像图片大小：**小于 500KB**
- Base64 数据长度：**小于 700,000 字符**
- 建议选择较小的头像图片

### 2. 性能考虑
- Base64 数据会占用数据库空间
- 每次获取用户信息都会加载头像数据
- 建议缓存用户信息到本地

### 3. 图片格式
支持的格式：
- JPEG / JPG
- PNG
- GIF
- WebP

---

## 🔄 与云存储方案的对比

| 特性 | 云存储方案 | 数据库方案 |
|------|-----------|-----------|
| 存储位置 | 云存储 | 数据库 |
| 存储限制 | 免费版有额度 | 数据库配额 |
| 文件大小 | 最大 10MB | 最大 500KB |
| 访问速度 | 快 | 快 |
| 部署难度 | 需要配置存储 | 只需配置数据库 |
| 适用场景 | 大文件、大量文件 | 小文件、少量文件 |

---

## ✅ 优势

1. **无需云存储配置**
   - 不需要创建 avatars 文件夹
   - 不需要配置云存储权限
   - 不消耗云存储空间

2. **部署简单**
   - 只需上传云函数
   - 只需配置数据库
   - 减少配置步骤

3. **适合免费版**
   - 完全使用免费额度
   - 不产生额外费用
   - 适合小型应用

---

## 📦 需要重新上传的云函数

修改后，需要重新上传以下云函数：

1. ✅ `login` - 用户登录（无需修改，但建议重新上传）
2. ✅ `uploadAvatar` - 头像上传（已修改，必须重新上传）
3. ✅ `updateProfile` - 更新资料（无需修改，但建议重新上传）
4. ✅ `validateAvatar` - 文件验证（已修改，必须重新上传）
5. ✅ `userOperation` - 用户操作（已修改，必须重新上传）

---

## 🎯 下一步操作

1. **重新上传修改过的云函数**
   - 右键 `cloudfunctions/uploadAvatar` →「上传并部署」
   - 右键 `cloudfunctions/validateAvatar` →「上传并部署」
   - 右键 `cloudfunctions/userOperation` →「上传并部署」

2. **测试功能**
   - 测试头像上传
   - 测试头像显示
   - 测试头像删除

---

## 📞 常见问题

**Q: Base64 数据会占用很多数据库空间吗？**
A: 500KB 的图片转换为 Base64 后约 700KB，对于免费版数据库来说完全够用。

**Q: 头像显示会不会很慢？**
A: 不会，Base64 数据直接嵌入页面，加载速度很快。

**Q: 可以换回云存储方案吗？**
A: 可以，后续如果需要云存储，可以随时改回去。

**Q: 支持更换头像吗？**
A: 支持，新上传的头像会覆盖旧的头像数据。
