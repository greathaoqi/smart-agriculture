#!/bin/bash

# 智慧农业管理平台部署脚本
# 从 GitHub 拉取代码并自动化部署

set -e

SERVER="opc@138.2.81.121"
PROJECT_DIR="/home/opc/smart-agriculture"
GIT_REPO="https://github.com/greathaoqi/smart-agriculture.git"

echo "=== 智慧农业管理平台部署脚本 ==="
echo ""

# 检查服务器连接
echo "检查服务器连接..."
if ! ssh -o ConnectTimeout=5 $SERVER "echo '连接成功'" 2>/dev/null; then
    echo "错误: 无法连接到服务器 $SERVER"
    echo "请确保已配置SSH密钥认证"
    exit 1
fi
echo "服务器连接正常"
echo ""

# 在服务器上执行部署
echo "从 GitHub 拉取代码并部署..."
ssh $SERVER bash << 'REMOTE_SCRIPT'
set -e

PROJECT_DIR="/home/opc/smart-agriculture"
GIT_REPO="https://github.com/greathaoqi/smart-agriculture.git"

cd $PROJECT_DIR

# 检查是否是 git 仓库，如果不是则克隆
if [ ! -d ".git" ]; then
    echo "初始化 Git 仓库..."
    # 备份现有文件
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml docker-compose.yml.bak
        cp -r database database.bak 2>/dev/null || true
    fi
    # 克隆仓库
    git clone $GIT_REPO . --depth 1
fi

# 拉取最新代码
echo "拉取最新代码..."
git fetch origin
git reset --hard origin/main

# 检查 Docker
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker 未运行"
    exit 1
fi

# 停止旧容器
echo "停止旧容器..."
docker-compose down --remove-orphans 2>/dev/null || true

# 构建并启动
echo "构建并启动容器..."
docker-compose up -d --build

# 等待启动
echo "等待服务启动..."
sleep 15

# 检查状态
docker-compose ps

echo ""
echo "部署完成!"
echo "访问地址: https://arm.ajiu.lol:12350"
REMOTE_SCRIPT

echo ""
echo "=== 部署完成 ==="
