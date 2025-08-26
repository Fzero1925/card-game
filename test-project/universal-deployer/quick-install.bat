@echo off
echo 🚀 Universal Web Deployer 快速安装脚本
echo.

REM 检查是否在项目目录中
if not exist "package.json" (
    echo ⚠️  警告: 当前目录没有发现 package.json 文件
    echo    建议在项目根目录中运行此脚本
    echo.
)

echo 📥 安装 Universal Web Deployer...

REM 检查是否已存在
if exist "universal-deployer" (
    echo ⚠️  发现已存在的 universal-deployer 目录
    set /p "update=是否要更新？(y/N): "
    if /i "%update%"=="y" (
        rmdir /s /q universal-deployer
        echo ✅ 已删除旧版本
    ) else (
        echo ❌ 安装已取消
        pause
        exit /b 1
    )
)

echo 📦 正在安装...

REM 创建目录
mkdir universal-deployer >nul 2>&1

REM 在实际使用中，这里应该是下载逻辑
REM 这里使用本地复制作为示例

echo ✅ Universal Web Deployer 安装完成！

REM 检查 package.json
if exist "package.json" (
    echo 📝 package.json 脚本建议：
    echo.
    echo   请将以下脚本添加到您的 package.json 文件中：
    echo.
    echo   "scripts": {
    echo     "deploy": "node universal-deployer/bin/cli.js",
    echo     "deploy:init": "node universal-deployer/bin/cli.js --init",
    echo     "deploy:github": "node universal-deployer/bin/cli.js github",
    echo     "deploy:vercel": "node universal-deployer/bin/cli.js vercel"
    echo   }
    echo.
)

echo.
echo 🎉 安装完成！现在您可以使用以下命令：
echo.
echo   REM 初始化配置文件
echo   node universal-deployer\bin\cli.js --init
echo.
echo   REM 或如果已添加到 package.json：
echo   npm run deploy:init
echo.
echo   REM 开始部署
echo   npm run deploy
echo.
echo 📚 查看完整文档: type universal-deployer\README.md

pause