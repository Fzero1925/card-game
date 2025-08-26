#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

class DeploymentSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.rootDir = process.cwd();
    this.configPath = path.join(this.rootDir, 'deploy.config.js');
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
  }

  async prompt(question, defaultValue = '') {
    return new Promise((resolve) => {
      const promptText = defaultValue 
        ? `${question} (默认: ${defaultValue}): `
        : `${question}: `;
        
      this.rl.question(promptText, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  async promptYesNo(question, defaultValue = 'y') {
    const answer = await this.prompt(`${question} (y/N)`, defaultValue);
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
  }

  exec(command, options = {}) {
    try {
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options 
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  // 检测项目信息
  detectProjectInfo() {
    let projectName = path.basename(this.rootDir);
    let gitRepo = '';
    let gitUser = '';

    try {
      // 获取package.json信息
      const packagePath = path.join(this.rootDir, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        projectName = pkg.name || projectName;
      }
    } catch (error) {
      // 忽略错误
    }

    try {
      // 获取Git信息
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      if (remoteUrl.includes('github.com')) {
        const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
        if (match) {
          gitUser = match[1];
          gitRepo = match[2];
        }
      }
    } catch (error) {
      // 忽略错误
    }

    try {
      if (!gitUser) {
        gitUser = execSync('git config user.name', { encoding: 'utf8' }).trim();
      }
    } catch (error) {
      // 忽略错误
    }

    return { projectName, gitRepo, gitUser };
  }

  // 安装依赖
  async installDependencies() {
    this.log('检查和安装必要依赖...');
    
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    let needsPackageJson = false;
    
    if (!fs.existsSync(packageJsonPath)) {
      const createPackageJson = await this.promptYesNo('未找到package.json，是否创建？', 'y');
      if (createPackageJson) {
        needsPackageJson = true;
      }
    }

    if (needsPackageJson) {
      const projectInfo = this.detectProjectInfo();
      const packageJson = {
        name: projectInfo.projectName,
        version: "1.0.0",
        description: "Web Application",
        main: "index.html",
        scripts: {
          deploy: "node deploy/deploy.js"
        },
        dependencies: {
          open: "^8.4.0"
        }
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      this.log('package.json 已创建');
    }

    // 安装依赖
    const installCmd = fs.existsSync(path.join(this.rootDir, 'yarn.lock')) ? 'yarn install' : 'npm install';
    this.log(`运行 ${installCmd}...`);
    
    const installResult = this.exec(installCmd);
    if (installResult.success) {
      this.log('依赖安装完成', 'success');
    } else {
      this.log('依赖安装失败，请手动运行: ' + installCmd, 'warning');
    }
  }

  // 配置向导
  async configWizard() {
    console.log('\n🔧 部署配置向导\n');
    
    const projectInfo = this.detectProjectInfo();
    
    // 项目基本信息
    const projectName = await this.prompt('项目名称', projectInfo.projectName);
    const description = await this.prompt('项目描述', 'Web Application');
    const author = await this.prompt('作者', projectInfo.gitUser || 'Anonymous');

    // GitHub Pages配置
    console.log('\n📦 GitHub Pages 配置:');
    const enableGithub = await this.promptYesNo('启用GitHub Pages部署？');
    
    let githubConfig = { enabled: enableGithub };
    if (enableGithub) {
      const githubUser = await this.prompt('GitHub用户名', projectInfo.gitUser);
      const githubRepo = await this.prompt('GitHub仓库名', projectInfo.gitRepo || projectName);
      const githubBranch = await this.prompt('部署分支', 'gh-pages');
      const customDomain = await this.prompt('自定义域名（可选）', '');
      
      githubConfig = {
        enabled: true,
        username: githubUser,
        repository: githubRepo,
        branch: githubBranch,
        customDomain: customDomain || '',
        message: '🚀 Deploy to GitHub Pages'
      };
    }

    // Vercel配置
    console.log('\n🚀 Vercel 配置:');
    const enableVercel = await this.promptYesNo('启用Vercel部署？');
    
    let vercelConfig = { enabled: enableVercel };
    if (enableVercel) {
      const vercelProject = await this.prompt('Vercel项目名', projectName);
      const vercelRegions = await this.prompt('部署区域（逗号分隔）', 'hkg1,sfo1');
      const customAlias = await this.prompt('自定义域名别名（可选）', '');
      
      vercelConfig = {
        enabled: true,
        projectName: vercelProject,
        regions: vercelRegions.split(',').map(r => r.trim()),
        alias: customAlias ? customAlias.split(',').map(a => a.trim()) : []
      };
    }

    // 生成配置文件
    const config = {
      project: {
        name: projectName,
        description: description,
        author: author,
        version: "1.0.0"
      },
      github: githubConfig,
      vercel: vercelConfig,
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
          "package*.json",
          "deploy/**",
          "README.md"
        ]
      },
      general: {
        autoOpen: true,
        showLogs: true,
        backup: false,
        confirm: true
      }
    };

    return config;
  }

  // 创建环境变量模板
  createEnvTemplate() {
    const envTemplate = `# 部署环境变量模板
# 复制为 .env 并填入实际值

# GitHub Token (可选，用于私有仓库或提高API限制)
GITHUB_TOKEN=ghp_your_github_token_here

# Vercel Token (可选，用于API部署)
VERCEL_TOKEN=your_vercel_token_here

# GitHub Token 获取方法:
# 1. 访问 https://github.com/settings/tokens
# 2. 点击 "Generate new token (classic)"
# 3. 选择 "repo" 权限
# 4. 复制生成的token

# Vercel Token 获取方法:
# 1. 访问 https://vercel.com/account/tokens
# 2. 点击 "Create"
# 3. 输入token名称
# 4. 复制生成的token
`;

    const envPath = path.join(this.rootDir, '.env.example');
    fs.writeFileSync(envPath, envTemplate);
    this.log('环境变量模板已创建: .env.example');
  }

  // 创建Git忽略文件
  createGitignore() {
    const gitignorePath = path.join(this.rootDir, '.gitignore');
    let gitignoreContent = '';

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    const deployIgnores = [
      '# 部署相关',
      '.deploy-temp/',
      '.env',
      '*.log'
    ];

    let needsUpdate = false;
    for (const ignore of deployIgnores) {
      if (!gitignoreContent.includes(ignore)) {
        gitignoreContent += gitignoreContent ? '\n' + ignore : ignore;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      fs.writeFileSync(gitignorePath, gitignoreContent);
      this.log('.gitignore 已更新');
    }
  }

  // 主设置函数
  async setup() {
    console.log('🚀 通用Web部署工具设置向导\n');
    
    try {
      // 检查现有配置
      if (fs.existsSync(this.configPath)) {
        const overwrite = await this.promptYesNo('已存在配置文件，是否重新配置？', 'n');
        if (!overwrite) {
          this.log('设置取消');
          this.rl.close();
          return;
        }
      }

      // 安装依赖
      await this.installDependencies();

      // 配置向导
      const config = await this.configWizard();

      // 保存配置
      const configContent = `// 部署配置文件\nmodule.exports = ${JSON.stringify(config, null, 2)};`;
      fs.writeFileSync(this.configPath, configContent);
      this.log('配置文件已保存: deploy.config.js', 'success');

      // 创建辅助文件
      this.createEnvTemplate();
      this.createGitignore();

      // 设置完成提示
      console.log('\n🎉 设置完成！');
      console.log('\n📖 使用方法:');
      console.log('  npm run deploy           - 交互式选择平台');
      console.log('  npm run deploy:github    - 仅部署到GitHub Pages');
      console.log('  npm run deploy:vercel    - 仅部署到Vercel');
      console.log('  npm run deploy:all       - 部署到所有平台');
      
      console.log('\n🔑 认证设置:');
      console.log('  GitHub: 设置GITHUB_TOKEN环境变量或运行 git config');
      console.log('  Vercel: 设置VERCEL_TOKEN环境变量或运行 vercel login');
      
      console.log('\n💡 提示:');
      console.log('  - 查看 .env.example 了解环境变量设置');
      console.log('  - 编辑 deploy.config.js 自定义配置');
      console.log('  - 运行 npm run help 查看详细帮助');

      this.rl.close();

    } catch (error) {
      this.log(`设置失败: ${error.message}`, 'error');
      this.rl.close();
      process.exit(1);
    }
  }
}

// 启动设置向导
if (require.main === module) {
  const setup = new DeploymentSetup();
  setup.setup().catch(console.error);
}

module.exports = DeploymentSetup;