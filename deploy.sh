#!/bin/bash

# 智慧农业管理平台部署脚本
# 用于部署到 opc@arm.ajiu.lol

set -e

SERVER="opc@138.2.81.121"
PROJECT_DIR="/home/opc/smart-agriculture"

echo "=== 智慧农业管理平台部署脚本 ==="
echo ""

# 检查是否可以SSH连接
echo "检查服务器连接..."
if ! ssh -o ConnectTimeout=5 $SERVER "echo '连接成功'" 2>/dev/null; then
    echo "错误: 无法连接到服务器 $SERVER"
    echo "请确保已配置SSH密钥认证"
    exit 1
fi

echo "服务器连接正常"
echo ""

# 同步代码到服务器
echo "同步代码到服务器..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '*.log' \
    --exclude '.env' --exclude '.env.local' \
    ./ $SERVER:$PROJECT_DIR/

echo "代码同步完成"
echo ""

# 在服务器上执行部署命令
echo "在服务器上构建和启动容器..."
ssh $SERVER << 'EOF'
cd /home/opc/smart-agriculture

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker未运行"
    exit 1
fi

# 停止并删除旧容器
docker-compose down --remove-orphans 2>/dev/null || true

# 构建并启动新容器
docker-compose up -d --build

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
docker-compose ps

echo ""
echo "部署完成!"
echo ""
echo "访问地址: https://arm.ajiu.lol:12350"
echo ""
echo "默认管理员账号:"
echo "  用户名: admin"
echo "  密码: 请查看 docker-compose.yml 中的 ADMIN_PASSWORD"
echo ""
EOF

echo ""
echo "=== 部署完成 ==="
