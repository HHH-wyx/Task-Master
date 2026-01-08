// 部署辅助工具 - 在微信开发者工具控制台运行此脚本
// 使用方法：复制此脚本内容到微信开发者工具的调试器（F12）中运行

console.log('===================================');
console.log('TaskMaster 云函数部署辅助工具');
console.log('===================================');
console.log('');

// 检查云开发是否已初始化
function checkCloudInit() {
  if (!wx.cloud) {
    console.error('❌ 云开发未初始化，请确保 app.js 中已初始化云开发');
    return false;
  }
  console.log('✅ 云开发已初始化');
  return true;
}

// 测试云函数
async function testCloudFunction(name, data = {}) {
  try {
    console.log(`\n📤 测试云函数: ${name}`);
    console.log('📦 传入数据:', JSON.stringify(data, null, 2));

    const result = await wx.cloud.callFunction({
      name: name,
      data: data
    });

    console.log('✅ 调用成功');
    console.log('📥 返回数据:', JSON.stringify(result.result, null, 2));
    return { success: true, result: result.result };
  } catch (error) {
    console.error('❌ 调用失败:', error);
    return { success: false, error: error };
  }
}

// 测试登录云函数
async function testLogin() {
  console.log('\n===================================');
  console.log('测试登录功能');
  console.log('===================================');

  const result = await testCloudFunction('login', {
    user: {
      nickName: '测试用户',
      avatarUrl: '',
      gender: 1,
      province: '广东省',
      city: '深圳市'
    }
  });

  return result;
}

// 测试更新资料云函数
async function testUpdateProfile() {
  console.log('\n===================================');
  console.log('测试更新资料功能');
  console.log('===================================');

  const result = await testCloudFunction('updateProfile', {
    nickName: '新昵称',
    avatarUrl: 'test-avatar-url'
  });

  return result;
}

// 测试获取用户信息
async function testGetUserInfo() {
  console.log('\n===================================');
  console.log('测试获取用户信息');
  console.log('===================================');

  const result = await testCloudFunction('userOperation', {
    action: 'get'
  });

  return result;
}

// 测试文件验证
async function testValidateAvatar() {
  console.log('\n===================================');
  console.log('测试文件验证功能');
  console.log('===================================');

  // 注意：这里使用虚拟数据，实际测试需要先选择图片
  const result = await testCloudFunction('validateAvatar', {
    tempFilePath: 'test-avatar.jpg',
    fileSize: 50000,
    fileType: 'image/jpeg'
  });

  return result;
}

// 主测试流程
async function runTests() {
  if (!checkCloudInit()) {
    return;
  }

  console.log('\n===================================');
  console.log('开始测试所有云函数');
  console.log('===================================');

  // 测试登录
  await testLogin();

  // 测试获取用户信息
  await testGetUserInfo();

  // 测试更新资料
  await testUpdateProfile();

  // 测试文件验证
  await testValidateAvatar();

  console.log('\n===================================');
  console.log('测试完成！');
  console.log('===================================');
}

// 提供便捷的测试命令
window.taskMasterTests = {
  testAll: runTests,
  testLogin: testLogin,
  testUpdateProfile: testUpdateProfile,
  testGetUserInfo: testGetUserInfo,
  testValidateAvatar: testValidateAvatar
};

console.log('\n📋 可用测试命令：');
console.log('  taskMasterTests.testAll()      - 测试所有功能');
console.log('  taskMasterTests.testLogin()    - 测试登录');
console.log('  taskMasterTests.testUpdateProfile() - 测试更新资料');
console.log('  taskMasterTests.testGetUserInfo() - 测试获取用户信息');
console.log('  taskMasterTests.testValidateAvatar() - 测试文件验证');
console.log('\n💡 在控制台输入命令即可开始测试，例如：taskMasterTests.testLogin()');
console.log('');
