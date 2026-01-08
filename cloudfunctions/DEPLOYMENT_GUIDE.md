# 云开发部署指南

## 第一步：开通云开发

### 1. 在微信开发者工具中开通云开发
1. 打开微信开发者工具
2. 点击顶部菜单栏「云开发」按钮
3. 如果是第一次使用，点击「开通云开发」
4. 选择环境名称（例如：taskmaster-dev）
5. 选择基础版或按量付费（免费额度足够开发使用）
6. 点击「开通」

### 2. 获取环境信息
开通后，您会看到：
- 环境名称：taskmaster-dev
- 环境ID：cloud1-xxx...

记下这个环境ID，后面会用到。

---

## 第二步：上传并部署云函数

### 方法一：右键上传（推荐）

#### 1. 登录云函数
1. 在微信开发者工具左侧目录树中，找到 `cloudfunctions` 文件夹
2. 右键点击 `cloudfunctions` 文件夹
3. 选择「当前环境：taskmaster-dev」
4. 确认环境选择正确

#### 2. 逐个上传云函数
对每个云函数文件夹进行以下操作：

**login 云函数：**
1. 右键点击 `cloudfunctions/login` 文件夹
2. 选择「上传并部署：云端安装依赖（不上传 node_modules）」
3. 等待上传完成（约10-30秒）
4. 看到绿色提示「上传并安装依赖成功」即完成

**uploadAvatar 云函数：**
1. 右键点击 `cloudfunctions/uploadAvatar` 文件夹
2. 选择「上传并部署：云端安装依赖（不上传 node_modules）」
3. 等待上传完成

**updateProfile 云函数：**
1. 右键点击 `cloudfunctions/updateProfile` 文件夹
2. 选择「上传并部署：云端安装依赖（不上传 node_modules）」
3. 等待上传完成

**validateAvatar 云函数：**
1. 右键点击 `cloudfunctions/validateAvatar` 文件夹
2. 选择「上传并部署：云端安装依赖（不上传 node_modules）」
3. 等待上传完成

**userOperation 云函数：**
1. 右键点击 `cloudfunctions/userOperation` 文件夹
2. 选择「上传并部署：云端安装依赖（不上传 node_modules）」
3. 等待上传完成

### 方法二：云开发控制台上传

如果右键上传不成功，可以使用网页控制台：

1. 打开浏览器，访问：https://cloud.weixin.qq.com/
2. 扫码登录微信开发者工具账号
3. 选择「云开发」→「云函数」
4. 点击「新建云函数」
5. 填写云函数名称（例如：login）
6. 创建后，点击「函数代码」→「文件」→「上传文件」
7. 上传对应文件夹中的 `index.js` 和 `package.json`

---

## 第三步：创建数据库集合

### 1. 打开数据库管理
1. 在微信开发者工具中，点击顶部「云开发」按钮
2. 选择「数据库」标签页
3. 或者访问 https://cloud.weixin.qq.com/ →「云开发」→「数据库」

### 2. 创建 users 集合
1. 点击「添加集合」
2. 集合名称输入：`users`
3. 点击「确定」

### 3. 创建 user-uploads 集合
1. 点击「添加集合」
2. 集合名称输入：`user-uploads`
3. 点击「确定」

### 4. 配置安全规则

**users 集合安全规则：**
1. 在数据库列表中找到 `users` 集合
2. 点击「权限设置」
3. 选择「自定义」
4. 输入以下规则：

```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

5. 点击「确定」

**user-uploads 集合安全规则：**
1. 在数据库列表中找到 `user-uploads` 集合
2. 点击「权限设置」
3. 选择「自定义」
4. 输入以下规则：

```json
{
  "read": "auth.openid == doc.openid",
  "write": "auth.openid == doc.openid"
}
```

5. 点击「确定」

---

## 第四步：创建云存储目录

### 1. 打开云存储管理
1. 在微信开发者工具中，点击顶部「云开发」按钮
2. 选择「存储」标签页
3. 或者访问 https://cloud.weixin.qq.com/ →「云开发」→「存储」

### 2. 创建文件夹
1. 点击「新建文件夹」
2. 文件夹名称输入：`avatars`
3. 点击「确定」

### 3. 配置存储安全规则
1. 点击「权限设置」标签页
2. 选择「自定义」
3. 输入以下规则：

```json
{
  "read": true,
  "write": "auth != null"
}
```

4. 点击「确定」

---

## 第五步：配置小程序权限

### 1. 修改 project.config.json
确保 `project.config.json` 中配置了云开发：

```json
{
  "cloudfunctionRoot": "cloudfunctions/",
  "cloudbaseRoot": "",
  "miniprogramRoot": "./",
  "cloudfunctionTemplateRoot": "cloudfunctionTemplate"
}
```

### 2. 在 app.js 中初始化云开发
确保 `app.js` 中有以下代码（通常已自动生成）：

```javascript
// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会请求到哪个环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   使用环境 ID 默认使用第一个环境
        // env: 'your-env-id', // 可选，不填则使用第一个环境
        traceUser: true,
      })
    }

    this.globalData = {}
  }
})
```

如果 `env` 参数留空，会自动使用第一个云开发环境。

### 3. 配置用户信息权限
在 `project.config.json` 中确保配置了用户信息获取权限：

```json
{
  "permission": {
    "scope.userLocation": {
      "desc": "您的位置信息将用于小程序位置接口的效果展示"
    }
  }
}
```

---

## 第六步：测试云函数

### 1. 在微信开发者工具中测试

打开调试器（F12），在 Console 中输入：

```javascript
// 测试登录
wx.cloud.callFunction({
  name: 'login',
  data: {
    user: {
      nickName: '测试用户',
      avatarUrl: '',
      gender: 1
    }
  }
}).then(res => {
  console.log('登录结果', res)
}).catch(err => {
  console.error('登录失败', err)
})
```

### 2. 测试头像上传

```javascript
// 测试文件验证
wx.chooseImage({
  count: 1,
  success(res) {
    wx.cloud.callFunction({
      name: 'validateAvatar',
      data: {
        tempFilePath: res.tempFilePaths[0],
        fileSize: 50000,
        fileType: 'image/jpeg'
      }
    }).then(res => {
      console.log('验证结果', res)
    }).catch(err => {
      console.error('验证失败', err)
    })
  }
})
```

### 3. 查看数据库
在云开发控制台的数据库页面，查看是否有数据写入。

---

## 第七步：常见问题排查

### 问题1：云函数上传失败
**原因：**
- 网络连接问题
- 云函数名称或路径错误
- package.json 依赖版本不兼容

**解决方法：**
1. 检查网络连接
2. 确认文件夹名称正确（如 `login` 不是 `Login`）
3. 检查 package.json 中的 wx-server-sdk 版本

### 问题2：调用云函数报错 "cloud function does not exist"
**原因：**
- 云函数未上传成功
- 环境选择错误

**解决方法：**
1. 重新上传云函数
2. 确认选择的环境名称正确

### 问题3：数据库权限错误
**原因：**
- 集合未创建
- 安全规则配置错误

**解决方法：**
1. 检查集合是否已创建
2. 检查安全规则配置

### 问题4：云存储上传失败
**原因：**
- 云存储未开通
- 权限配置错误

**解决方法：**
1. 确认云存储已开通
2. 检查存储安全规则

### 问题5：云函数调用超时
**原因：**
- 云函数执行时间过长（超过20秒）
- 数据库查询慢

**解决方法：**
1. 优化云函数代码
2. 添加数据库索引

---

## 第八步：监控和日志

### 1. 查看云函数日志
1. 打开云开发控制台
2. 选择「云函数」→「日志」
3. 选择云函数名称
4. 查看调用日志和错误信息

### 2. 查看数据库操作日志
1. 打开云开发控制台
2. 选择「数据库」→「监控」
3. 查看操作记录

### 3. 查看存储使用情况
1. 打开云开发控制台
2. 选择「存储」→「监控」
3. 查看存储空间使用情况

---

## 第九步：正式环境部署

### 1. 创建正式环境
1. 在云开发控制台，点击「新建环境」
2. 环境名称：taskmaster-prod
3. 选择正式版或按量付费
4. 点击「开通」

### 2. 重复部署步骤
在正式环境中重复以下步骤：
- 上传云函数
- 创建数据库集合
- 配置安全规则
- 创建云存储目录
- 配置存储安全规则

### 3. 修改 app.js 配置
```javascript
wx.cloud.init({
  env: 'taskmaster-prod',  // 使用正式环境ID
  traceUser: true,
})
```

---

## 快速检查清单

部署完成后，使用以下清单检查：

- [ ] 云开发已开通
- [ ] 环境ID已记录
- [ ] 所有云函数已上传并部署成功
- [ ] users 集合已创建
- [ ] user-uploads 集合已创建
- [ ] 数据库安全规则已配置
- [ ] avatars 文件夹已创建
- [ ] 云存储安全规则已配置
- [ ] app.js 中已初始化云开发
- [ ] 在开发者工具中测试云函数调用成功
- [ ] 数据库能正常读写
- [ ] 能正常上传文件到云存储

---

## 附录：云函数完整列表

需要部署的云函数：

1. **login** - 用户注册/登录
   - 文件：`cloudfunctions/login/index.js`
   - 依赖：`wx-server-sdk`

2. **uploadAvatar** - 头像上传
   - 文件：`cloudfunctions/uploadAvatar/index.js`
   - 依赖：`wx-server-sdk`

3. **updateProfile** - 更新用户资料
   - 文件：`cloudfunctions/updateProfile/index.js`
   - 依赖：`wx-server-sdk`

4. **validateAvatar** - 头像文件验证
   - 文件：`cloudfunctions/validateAvatar/index.js`
   - 依赖：`wx-server-sdk`

5. **userOperation** - 用户操作管理
   - 文件：`cloudfunctions/userOperation/index.js`
   - 依赖：`wx-server-sdk`

---

## 技术支持

如有问题，请参考：
1. 微信云开发文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html
2. 微信开放社区：https://developers.weixin.qq.com/community/
3. 云函数日志：查看详细错误信息
