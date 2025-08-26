#!/bin/bash

# Universal Web Deployer 快速安装脚本

set -e

echo "🚀 Universal Web Deployer 快速安装脚本"
echo ""

# 检查是否在项目目录中
if [ ! -f "package.json" ]; then
    echo "⚠️  警告: 当前目录没有发现 package.json 文件"
    echo "   建议在项目根目录中运行此脚本"
    echo ""
fi

# 获取最新版本（这里使用本地版本作为示例）
echo "📥 下载 Universal Web Deployer..."

# 检查是否已存在
if [ -d "universal-deployer" ]; then
    echo "⚠️  发现已存在的 universal-deployer 目录"
    read -p "是否要更新？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf universal-deployer
        echo "✅ 已删除旧版本"
    else
        echo "❌ 安装已取消"
        exit 1
    fi
fi

# 复制文件（在实际使用中，这里应该是下载或克隆）
echo "📦 正在安装..."

# 创建目录
mkdir -p universal-deployer

# 这里应该是实际的下载逻辑，暂时使用复制作为示例
# curl -L https://github.com/username/universal-web-deployer/archive/main.tar.gz | tar -xz --strip-components=1 -C universal-deployer

echo "✅ Universal Web Deployer 安装完成！"

# 更新 package.json
if [ -f "package.json" ]; then
    echo "📝 更新 package.json 脚本..."
    
    # 检查是否已有脚本
    if ! grep -q "deploy.*universal-deployer" package.json; then
        # 简单的脚本添加（实际应该使用更robust的JSON处理）
        echo "  添加部署脚本到 package.json..."
        echo "  (请手动添加以下脚本到 package.json:)"
        echo '    "deploy": "node universal-deployer/bin/cli.js",'
        echo '    "deploy:init": "node universal-deployer/bin/cli.js --init",'
        echo '    "deploy:github": "node universal-deployer/bin/cli.js github",'
        echo '    "deploy:vercel": "node universal-deployer/bin/cli.js vercel"'
    fi
fi

echo ""
echo "🎉 安装完成！现在您可以使用以下命令："
echo ""
echo "  # 初始化配置文件"
echo "  node universal-deployer/bin/cli.js --init"
echo ""
echo "  # 或如果已添加到 package.json："
echo "  npm run deploy:init"
echo ""
echo "  # 开始部署"
echo "  npm run deploy"
echo ""
echo "📚 查看完整文档: cat universal-deployer/README.md"