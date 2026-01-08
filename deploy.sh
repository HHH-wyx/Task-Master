#!/bin/bash

# TaskMaster 云函数部署辅助脚本
# 使用说明：将此脚本放在项目根目录，在微信开发者工具打开项目后运行

echo "==================================="
echo "TaskMaster 云函数部署检查清单"
echo "==================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查云函数文件是否存在
echo "📁 检查云函数文件..."
cloud_functions=("login" "uploadAvatar" "updateProfile" "validateAvatar" "userOperation")

all_exist=true
for func in "${cloud_functions[@]}"; do
    if [ -d "cloudfunctions/$func" ]; then
        if [ -f "cloudfunctions/$func/index.js" ] && [ -f "cloudfunctions/$func/package.json" ]; then
            echo -e "${GREEN}✓${NC} $func - 文件完整"
        else
            echo -e "${RED}✗${NC} $func - 缺少必要文件"
            all_exist=false
        fi
    else
        echo -e "${RED}✗${NC} $func - 文件夹不存在"
        all_exist=false
    fi
done

echo ""

if [ "$all_exist" = false ]; then
    echo -e "${RED}错误：部分云函数文件不完整，请检查！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 所有云函数文件检查通过${NC}"
echo ""
echo "==================================="
echo "📋 部署步骤说明"
echo "==================================="
echo ""
echo "在微信开发者工具中按以下步骤操作："
echo ""
echo "1️⃣  确保云开发已开通"
echo "   - 点击顶部「云开发」按钮"
echo "   - 如果未开通，点击「开通云开发」"
echo ""

echo "2️⃣  选择云开发环境"
echo "   - 右键点击 cloudfunctions 文件夹"
echo "   - 选择「当前环境」并选择你的环境"
echo ""

echo "3️⃣  上传以下云函数（逐个右键上传）："
for func in "${cloud_functions[@]}"; do
    echo "   - 右键 cloudfunctions/$func"
    echo "   - 选择「上传并部署：云端安装依赖（不上传 node_modules）」"
    echo ""
done

echo "4️⃣  创建数据库集合"
echo "   - 打开「云开发」→「数据库」"
echo "   - 添加集合：users"
echo "   - 添加集合：user-uploads"
echo "   - 为两个集合配置权限："
echo "     {"
echo "       \"read\": \"auth.openid == doc.openid\","
echo "       \"write\": \"auth.openid == doc.openid\""
echo "     }"
echo ""

echo "5️⃣  创建云存储目录"
echo "   - 打开「云开发」→「存储」"
echo "   - 新建文件夹：avatars"
echo "   - 配置权限："
echo "     {"
echo "       \"read\": true,"
echo "       \"write\": \"auth != null\""
echo "     }"
echo ""

echo "6️⃣  测试"
echo "   - 在调试器（F12）中运行测试代码"
echo ""

echo "==================================="
echo -e "${YELLOW}提示：详细部署说明请查看 cloudfunctions/DEPLOYMENT_GUIDE.md${NC}"
echo "==================================="
