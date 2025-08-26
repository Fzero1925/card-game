#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const UniversalDeployer = require('../lib/index.js');

// 查找项目根目录的配置文件
function findConfigFile() {
  const possiblePaths = [
    path.join(process.cwd(), 'deploy.config.js'),
    path.join(process.cwd(), 'web-deploy.config.js'),
    path.join(process.cwd(), 'deployer.config.js')
  ];
  
  for (const configPath of possiblePaths) {
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
  
  return null;
}

// 命令行参数解析
const args = process.argv.slice(2);
const platforms = args.filter(arg => !arg.startsWith('--'));
const flags = args.filter(arg => arg.startsWith('--'));

// 主函数
async function main() {
  // 处理命令行标志
  if (flags.includes('--help') || flags.includes('-h')) {
    console.log(`
🚀 Universal Web Deployer

用法:
  web-deploy [platforms] [options]
  npx universal-web-deployer [platforms] [options]

平台:
  github    - 部署到 GitHub Pages
  vercel    - 部署到 Vercel
  all       - 部署到所有启用的平台 (默认)

选项:
  --help, -h    - 显示帮助信息
  --version, -v - 显示版本信息
  --init        - 初始化配置文件

示例:
  web-deploy                    # 交互式选择平台
  web-deploy github             # 仅部署到 GitHub Pages
  web-deploy vercel             # 仅部署到 Vercel
  web-deploy github vercel      # 部署到两个平台
  web-deploy --init             # 创建配置文件
    `);
    return;
  }

  if (flags.includes('--version') || flags.includes('-v')) {
    const pkg = require('../package.json');
    console.log(`v${pkg.version}`);
    return;
  }

  if (flags.includes('--init')) {
    await initializeConfig();
    return;
  }

  // 查找配置文件
  const configPath = findConfigFile();
  if (!configPath) {
    console.error('❌ 未找到配置文件。请运行 "web-deploy --init" 创建配置文件。');
    process.exit(1);
  }

  try {
    // 创建部署器实例
    const deployer = new UniversalDeployer({
      configPath,
      rootDir: process.cwd()
    });
    
    await deployer.deploy(platforms);
  } catch (error) {
    console.error('❌ 部署过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 初始化配置文件
async function initializeConfig() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const prompt = (question, defaultValue = '') => {
    return new Promise((resolve) => {
      const promptText = defaultValue 
        ? `${question} (默认: ${defaultValue}): `
        : `${question}: `;
        
      rl.question(promptText, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  };

  try {
    console.log('🚀 初始化 Universal Web Deployer 配置...\n');

    const projectName = await prompt('项目名称', path.basename(process.cwd()));
    const projectDesc = await prompt('项目描述', 'Web应用');
    const author = await prompt('作者', 'Developer');

    const enableGitHub = await prompt('启用GitHub Pages部署? (y/N)', 'y');
    let githubConfig = { enabled: false };
    
    if (enableGitHub.toLowerCase() === 'y') {
      const username = await prompt('GitHub用户名');
      const repository = await prompt('GitHub仓库名', projectName);
      const branch = await prompt('GitHub Pages分支', 'gh-pages');
      const customDomain = await prompt('自定义域名 (可选)');

      githubConfig = {
        enabled: true,
        username,
        repository,
        branch,
        ...(customDomain && { customDomain })
      };
    }

    const enableVercel = await prompt('启用Vercel部署? (y/N)', 'y');
    let vercelConfig = { enabled: false };
    
    if (enableVercel.toLowerCase() === 'y') {
      const vercelProjectName = await prompt('Vercel项目名称', projectName);
      const regions = await prompt('部署区域 (逗号分隔)', 'hkg1,sfo1');
      const alias = await prompt('域名别名 (可选,逗号分隔)');

      vercelConfig = {
        enabled: true,
        projectName: vercelProjectName,
        regions: regions.split(',').map(r => r.trim()).filter(r => r),
        ...(alias && { alias: alias.split(',').map(a => a.trim()).filter(a => a) })
      };
    }

    const configContent = `// Universal Web Deployer 配置文件
module.exports = {
  project: {
    name: "${projectName}",
    description: "${projectDesc}",
    author: "${author}",
    version: "1.0.0"
  },
  
  github: ${JSON.stringify(githubConfig, null, 4)},
  
  vercel: ${JSON.stringify(vercelConfig, null, 4)},
  
  build: {
    beforeBuild: [],
    afterBuild: [],
    ignore: [
      "node_modules/**",
      ".git/**",
      ".DS_Store",
      "*.log",
      ".env*",
      "deploy.config.js",
      "web-deploy.config.js",
      "package*.json",
      "deploy/**",
      "universal-deployer/**",
      "README.md"
    ]
  },
  
  general: {
    autoOpen: true,
    showLogs: true,
    confirm: true
  }
};
`;

    const configPath = path.join(process.cwd(), 'web-deploy.config.js');
    fs.writeFileSync(configPath, configContent);

    console.log(`\n✅ 配置文件已创建: ${configPath}`);
    console.log('\n🚀 现在可以运行部署命令:');
    console.log('  web-deploy              # 交互式部署');
    console.log('  web-deploy github       # GitHub Pages');
    console.log('  web-deploy vercel       # Vercel');
    
  } catch (error) {
    console.error('❌ 配置初始化失败:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 启动
if (require.main === module) {
  main().catch(console.error);
}