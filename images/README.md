# 默认头像图片说明

## 📝 当前配置

在 `pages/profile/index.wxml` 中，默认头像路径为：
```
/images/default-avatar.png
```

## 🖼️ 添加默认头像

### 选项1：使用纯色背景
修改 `pages/profile/index.wxss`，添加默认头像样式：

```css
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #e5e7eb;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 当没有头像时显示默认样式 */
.avatar[src="/images/default-avatar.png"] {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #fff;
  font-weight: 800;
}
```

### 选项2：使用 Base64 内嵌图片
在 `pages/profile/index.js` 中添加默认头像数据：

```javascript
Page({
  data: {
    user: userService.getUser(),
    defaultAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyIiB2aWV3Qm94PSIwIDAgMTIgMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjUiIGZpbGw9IiNlN2V7ZWIiLz48L3N2Zz4='
  },

  // ... 其他代码
})
```

然后在 WXML 中使用：
```xml
<image
  class="avatar"
  src="{{user && user.avatarBase64 ? user.avatarBase64 : defaultAvatar}}"
  mode="aspectFill"
/>
```

### 选项3：使用图片文件（推荐）
1. 在 `images/` 文件夹中添加 `default-avatar.png` 文件
2. 可以下载免费的头像图标：
   - Flat Avatar: https://www.flaticon.com/
   - Heroicons: https://heroicons.com/
   - 直接使用纯色或渐变背景的图片

## 📸 推荐的默认头像

### 使用在线占位图服务
```xml
<image
  class="avatar"
  src="{{user && user.avatarBase64 ? user.avatarBase64 : 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff&size=256'}}"
  mode="aspectFill"
/>
```

### 使用 SVG Base64
在 `pages/profile/index.js` 中添加：

```javascript
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI4MCIgZmlsbD0idXJsKCNncmFkKSIvPjxkZWZzPjxyYWRpYWxHcmFkaWVudCBpZD0iZ3JhZCIgY3g9IjUwJSIgY3k9IjUwJSIgZng9IjEwMCUiIGZ5PSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjY3ZWVhIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PC9zdmc+'

Page({
  data: {
    user: userService.getUser(),
    defaultAvatar: DEFAULT_AVATAR
  },

  // ... 其他代码
})
```

然后在 WXML 中：
```xml
<image
  class="avatar"
  src="{{user && user.avatarBase64 ? user.avatarBase64 : defaultAvatar}}"
  mode="aspectFill"
/>
```

## ✅ 快速解决方案

如果您不想添加图片文件，可以直接使用在线头像服务：

修改 `pages/profile/index.wxml`：

```xml
<image
  class="avatar"
  src="{{user && user.avatarBase64 ? user.avatarBase64 : 'https://ui-avatars.com/api/?name=U&background=667eea&color=fff&size=256&rounded=true'}}"
  mode="aspectFill"
  bindtap="onChooseAvatar"
/>
```

这样就会自动显示一个好看的默认头像！
