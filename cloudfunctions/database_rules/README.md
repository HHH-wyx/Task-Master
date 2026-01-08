# 数据库集合安全规则配置

## users 集合（用户信息表）

```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

**字段说明：**
- `_openid`: 用户OpenID（系统自动创建）
- `openid`: 用户OpenID
- `nickName`: 昵称（字符串，最长32字符）
- `avatarUrl`: 头像URL（字符串，最长500字符）
- `gender`: 性别（0:未知 1:男 2:女）
- `province`: 省份
- `city`: 城市
- `sessionToken`: 会话令牌
- `lastLoginAt`: 最后登录时间戳
- `createdAt`: 创建时间戳
- `updatedAt`: 更新时间戳
- `avatarUpdatedAt`: 头像更新时间戳

## user-uploads 集合（用户上传记录表）

```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

**字段说明：**
- `_openid`: 用户OpenID（系统自动创建）
- `openid`: 用户OpenID
- `fileID`: 云存储文件ID
- `filePath`: 文件存储路径
- `type`: 文件类型（avatar等）
- `fileType`: 文件格式（jpg、png等）
- `createdAt`: 创建时间戳

## 云存储安全规则

```json
{
  "read": true,
  "write": "auth != null"
}
```

**目录结构：**
- `avatars/`: 用户头像目录
  - 命名规则: `avatars/{timestamp}_{random}.{ext}`
