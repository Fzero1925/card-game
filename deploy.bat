@echo off
echo 🚀 Universal Web Deployer
echo.

if "%1"=="" (
    echo 使用方法:
    echo   deploy.bat setup      - 运行设置向导
    echo   deploy.bat            - 交互式部署
    echo   deploy.bat github     - 部署到GitHub Pages
    echo   deploy.bat vercel     - 部署到Vercel
    echo   deploy.bat all        - 部署到所有平台
    echo   deploy.bat help       - 显示帮助
    echo.
    node universal-deployer/bin/cli.js
) else if "%1"=="setup" (
    node scripts/setup.js
) else if "%1"=="help" (
    node universal-deployer/bin/cli.js --help
) else (
    node universal-deployer/bin/cli.js %*
)

pause