#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 安装 Universal Web Deployer...\n');

const targetDir = process.argv[2] || process.cwd();
const deployerPath = path.join(targetDir, 'universal-deployer');

try {
  // 检查目标目录
  if (!fs.existsSync(targetDir)) {
    console.error('❌ 目标目录不存在:', targetDir);
    process.exit(1);
  }

  // 复制部署工具到目标项目
  if (fs.existsSync(deployerPath)) {
    console.log('⚠️  Universal Deployer 已存在，正在更新...');
    fs.rmSync(deployerPath, { recursive: true, force: true });
  }

  // 复制当前目录的所有文件到目标目录
  const sourceDir = __dirname;
  copyDir(sourceDir, deployerPath);

  console.log('✅ Universal Web Deployer 安装成功!');
  console.log(`📁 安装位置: ${deployerPath}`);

  // 检查是否存在 package.json，如果存在则添加脚本
  const targetPackageJson = path.join(targetDir, 'package.json');
  if (fs.existsSync(targetPackageJson)) {
    try {
      const packageData = JSON.parse(fs.readFileSync(targetPackageJson, 'utf8'));
      
      // 添加部署脚本
      packageData.scripts = packageData.scripts || {};
      packageData.scripts['deploy'] = 'node universal-deployer/bin/cli.js';
      packageData.scripts['deploy:init'] = 'node universal-deployer/bin/cli.js --init';
      packageData.scripts['deploy:github'] = 'node universal-deployer/bin/cli.js github';
      packageData.scripts['deploy:vercel'] = 'node universal-deployer/bin/cli.js vercel';
      packageData.scripts['deploy:all'] = 'node universal-deployer/bin/cli.js all';

      fs.writeFileSync(targetPackageJson, JSON.stringify(packageData, null, 2));
      console.log('✅ 已添加部署脚本到 package.json');
    } catch (error) {
      console.log('⚠️  无法更新 package.json:', error.message);
    }
  }

  console.log('\n🎉 安装完成! 现在可以使用以下命令:');
  console.log('  npm run deploy:init      # 初始化配置');
  console.log('  npm run deploy           # 交互式部署');
  console.log('  npm run deploy:github    # GitHub Pages');
  console.log('  npm run deploy:vercel    # Vercel');
  console.log('  npm run deploy:all       # 所有平台');

} catch (error) {
  console.error('❌ 安装失败:', error.message);
  process.exit(1);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // 跳过特定文件和目录
    if (['node_modules', '.git', 'install.js'].includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}