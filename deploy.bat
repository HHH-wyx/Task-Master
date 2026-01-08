@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===================================
echo TaskMaster 云函数部署检查清单
echo ===================================
echo.

:: 检查云函数文件是否存在
echo 📁 检查云函数文件...
set "all_exist=1"

set cloud_functions[0]=login
set cloud_functions[1]=uploadAvatar
set cloud_functions[2]=updateProfile
set cloud_functions[3]=validateAvatar
set cloud_functions[4]=userOperation

for /L %%i in (0,1,4) do (
    set "func=!cloud_functions[%%i]!"
    if exist "cloudfunctions\!func!\index.js" (
        if exist "cloudfunctions\!func!\package.json" (
            echo [√] !func! - 文件完整
        ) else (
            echo [X] !func! - 缺少 package.json
            set "all_exist=0"
        )
    ) else (
        echo [X] !func! - 文件夹或文件不存在
        set "all_exist=0"
    )
)

echo.

if "%all_exist%"=="0" (
    echo [错误] 部分云函数文件不完整，请检查！
    pause
    exit /b 1
)

echo [√] 所有云函数文件检查通过
echo.
echo ===================================
echo 📋 部署步骤说明
echo ===================================
echo.
echo 在微信开发者工具中按以下步骤操作：
echo.
echo 1️⃣  确保云开发已开通
echo    - 点击顶部「云开发」按钮
echo    - 如果未开通，点击「开通云开发」
echo.

echo 2️⃣  选择云开发环境
echo    - 右键点击 cloudfunctions 文件夹
echo    - 选择「当前环境」并选择你的环境
echo.

echo 3️⃣  上传以下云函数（逐个右键上传）：
echo    [1] 右键 cloudfunctions\login
echo        选择「上传并部署：云端安装依赖（不上传 node_modules）」
echo.
echo    [2] 右键 cloudfunctions\uploadAvatar
echo        选择「上传并部署：云端安装依赖（不上传 node_modules）」
echo.
echo    [3] 右键 cloudfunctions\updateProfile
echo        选择「上传并部署：云端安装依赖（不上传 node_modules）」
echo.
echo    [4] 右键 cloudfunctions\validateAvatar
echo        选择「上传并部署：云端安装依赖（不上传 node_modules）」
echo.
echo    [5] 右键 cloudfunctions\userOperation
echo        选择「上传并部署：云端安装依赖（不上传 node_modules）」
echo.

echo 4️⃣  创建数据库集合
echo    - 打开「云开发」→「数据库」
echo    - 添加集合：users
echo    - 添加集合：user-uploads
echo    - 为两个集合配置权限：
echo      {
echo        "read": "auth.openid == doc.openid",
echo        "write": "auth.openid == doc.openid"
echo      }
echo.

echo 5️⃣  创建云存储目录
echo    - 打开「云开发」→「存储」
echo    - 新建文件夹：avatars
echo    - 配置权限：
echo      {
echo        "read": true,
echo        "write": "auth != null"
echo      }
echo.

echo 6️⃣  测试
echo    - 在调试器（F12）中运行测试代码
echo.

echo ===================================
echo 提示：详细部署说明请查看 cloudfunctions\DEPLOYMENT_GUIDE.md
echo ===================================
echo.
echo 按任意键退出...
pause >nul
