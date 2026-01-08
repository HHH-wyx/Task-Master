# 任务同步功能说明

## 📋 功能概述

实现退出登录后清除本地任务，登录后自动恢复云端任务的功能。

---

## 🔧 需要创建的云函数

### 1. syncTasks - 同步任务到云端
**功能：** 将本地任务上传到云端，替换云端旧任务

**调用方法：**
```javascript
wx.cloud.callFunction({
  name: 'syncTasks',
  data: {
    tasks: [
      {
        title: '任务标题',
        done: false,
        priority: 'high',
        createdAt: 1234567890
      }
    ]
  }
})
```

**返回结果：**
```javascript
{
  ok: true,
  message: '已同步 5 个任务',
  count: 5
}
```

---

### 2. pullTasks - 从云端拉取任务
**功能：** 获取用户的所有云端任务

**调用方法：**
```javascript
wx.cloud.callFunction({
  name: 'pullTasks',
  data: {}
})
```

**返回结果：**
```javascript
{
  ok: true,
  tasks: [
    {
      _id: 'xxx',
      title: '任务标题',
      done: false,
      priority: 'high',
      createdAt: 1234567890
    }
  ],
  count: 5,
  message: '获取到 5 个任务'
}
```

---

## 📊 需要创建的数据库集合

### tasks 集合（任务表）
创建步骤：
1. 打开「云开发」→「数据库」
2. 点击「添加集合」
3. 集合名称：`tasks`（小写）
4. 点击「确定」

**权限配置：**
```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

**字段说明：**
- `_id` - 任务ID
- `_openid` - 用户OpenID（系统创建）
- `title` - 任务标题
- `done` - 是否完成（true/false）
- `priority` - 优先级（high/medium/low）
- `createdAt` - 创建时间
- `syncedAt` - 同步时间

---

## 🔄 工作流程

### 退出登录流程
```
1. 用户点击「退出登录」
   ↓
2. 获取本地任务数据
   ↓
3. 调用 syncTasks 云函数同步到云端
   ↓
4. 清除本地任务数据（storage.set(TASKS_KEY, [])）
   ↓
5. 清除用户信息（clearUser()）
   ↓
6. 刷新界面
```

### 登录流程
```
1. 用户点击「微信登录」
   ↓
2. 微信授权获取用户信息
   ↓
3. 调用 fetchProfile 登录
   ↓
4. 调用 pullTasks 云函数拉取云端任务
   ↓
5. 将云端任务保存到本地（storage.set(TASKS_KEY, tasks)）
   ↓
6. 刷新界面统计数据
   ↓
7. 显示"已恢复 X 个任务"
```

---

## 📤 上传云函数

在微信开发者工具中，右键上传以下云函数：

1. **syncTasks**
   - 右键 `cloudfunctions/syncTasks`
   - 选择「上传并部署：云端安装依赖」

2. **pullTasks**
   - 右键 `cloudfunctions/pullTasks`
   - 选择「上传并部署：云端安装依赖」

---

## ✅ 完整部署清单

### 云函数（7个）
- [ ] `login` - 用户登录
- [ ] `uploadAvatar` - 头像上传
- [ ] `updateProfile` - 更新资料
- [ ] `validateAvatar` - 文件验证
- [ ] `userOperation` - 用户操作
- [ ] `syncTasks` - 同步任务 ← 新增
- [ ] `pullTasks` - 拉取任务 ← 新增

### 数据库集合（3个）
- [ ] `users` - 用户信息
- [ ] `user-uploads` - 用户上传记录
- [ ] `tasks` - 任务数据 ← 新增

---

## 🧪 测试步骤

### 测试1：同步任务到云端
```javascript
const storage = require('../../utils/storage')

// 先添加一些测试任务
const testTasks = [
  { title: '测试任务1', done: false, priority: 'high', createdAt: Date.now() },
  { title: '测试任务2', done: true, priority: 'medium', createdAt: Date.now() }
]

storage.set('tm_tasks_v1', testTasks)

// 同步到云端
syncTasksToCloud(testTasks)
  .then(res => console.log('同步成功', res))
  .catch(err => console.error('同步失败', err))
```

### 测试2：从云端拉取任务
```javascript
pullTasksFromCloud()
  .then(res => {
    console.log('拉取成功', res)
    console.log('任务数量：', res.count)
    console.log('任务列表：', res.tasks)
  })
  .catch(err => console.error('拉取失败', err))
```

### 测试3：完整流程
1. 创建几个任务
2. 点击「微信登录」（首次）
3. 应该显示"已恢复 X 个任务"
4. 点击「退出登录」
5. 应该显示"退出成功，任务已保存"
6. 本地任务应该被清除
7. 再次点击「微信登录」
8. 应该再次恢复任务

---

## 🎯 功能特点

### ✅ 自动同步
- 退出登录时自动同步任务到云端
- 登录时自动恢复任务

### ✅ 数据安全
- 用户只能访问自己的任务
- 基于OpenID隔离数据

### ✅ 容错处理
- 同步失败可以重试
- 即使同步失败也可以选择继续退出

### ✅ 友好提示
- 显示同步中/拉取中/恢复数量
- 所有操作都有明确的反馈

---

## 📝 注意事项

1. **首次登录**
   - 如果是首次登录，云端没有任务
   - 会显示"云端暂无任务"

2. **网络异常**
   - 如果网络有问题，同步会失败
   - 用户可以选择继续退出或重试

3. **数据覆盖**
   - 每次同步会清空云端旧任务
   - 然后添加新任务
   - 确保云端和本地一致

4. **时间戳**
   - 所有任务应该有 `createdAt` 字段
   - 用于排序和显示

---

## 🎊 总结

实现了完整的任务同步功能：

✅ 退出登录时同步任务到云端
✅ 登录时自动恢复云端任务
✅ 友好的提示和加载状态
✅ 完善的错误处理
✅ 数据安全和隔离
