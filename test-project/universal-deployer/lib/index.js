const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

class UniversalDeployer {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.configPath = options.configPath || path.join(this.rootDir, 'web-deploy.config.js');
    this.deployDir = options.deployDir || path.join(__dirname, '../lib/deployers');
    this.config = this.loadConfig();
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // 加载配置文件
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        delete require.cache[require.resolve(this.configPath)];
        return require(this.configPath);
      } else {
        console.log('⚠️  未找到配置文件，使用默认配置');
        return this.getDefaultConfig();
      }
    } catch (error) {
      console.error('❌ 配置文件加载失败:', error.message);
      return this.getDefaultConfig();
    }
  }

  // 默认配置
  getDefaultConfig() {
    return {
      project: { name: "web-app", description: "Web Application", version: "1.0.0" },
      github: { enabled: true, branch: "gh-pages" },
      vercel: { enabled: true },
      build: { ignore: ["node_modules/**", ".git/**"] },
      general: { autoOpen: true, showLogs: true, confirm: true }
    };
  }

  // 日志输出
  log(message, type = 'info') {
    if (!this.config.general.showLogs && type === 'info') return;
    
    const colors = {
      info: '\x1b[36m',    // 青色
      success: '\x1b[32m', // 绿色
      warning: '\x1b[33m', // 黄色
      error: '\x1b[31m',   // 红色
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

  // 执行命令
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

  // 检查必要工具
  checkRequirements() {
    this.log('检查部署环境...');
    
    const checks = [];
    
    // 检查Git
    const gitCheck = this.exec('git --version', { silent: true });
    if (gitCheck.success) {
      this.log('✓ Git 已安装');
      
      // 检查是否为Git仓库
      const gitRepoCheck = this.exec('git rev-parse --git-dir', { silent: true });
      if (!gitRepoCheck.success) {
        this.log('⚠️ 当前目录不是Git仓库', 'warning');
        checks.push('not-git-repo');
      } else {
        this.log('✓ Git 仓库已初始化');
        
        // 检查是否有远程仓库
        const remoteCheck = this.exec('git remote -v', { silent: true });
        if (!remoteCheck.output || remoteCheck.output.trim() === '') {
          this.log('⚠️ 未配置远程仓库', 'warning');
          checks.push('no-remote');
        } else {
          this.log('✓ 远程仓库已配置');
        }
      }
    } else {
      checks.push('git-missing');
    }

    // 检查Node.js
    const nodeCheck = this.exec('node --version', { silent: true });
    if (nodeCheck.success) {
      this.log('✓ Node.js 已安装');
    } else {
      checks.push('nodejs-missing');
    }

    if (checks.length > 0) {
      this.log('环境检查发现问题:', 'warning');
      this.showEnvironmentSolutions(checks);
      
      // 对于某些问题，我们可以提供自动修复选项
      const canContinue = this.canContinueWithIssues(checks);
      if (!canContinue) {
        process.exit(1);
      }
    }

    this.log('环境检查通过', 'success');
  }

  // 显示环境问题的解决方案
  showEnvironmentSolutions(issues) {
    issues.forEach(issue => {
      switch (issue) {
        case 'git-missing':
          this.log('Git未安装解决方案:', 'error');
          this.log('  Windows: 访问 https://git-scm.com/download/win 下载安装', 'error');
          this.log('  Linux: sudo apt-get install git 或 sudo yum install git', 'error');
          this.log('  Mac: brew install git 或从 App Store 安装 Xcode', 'error');
          break;
          
        case 'nodejs-missing':
          this.log('Node.js未安装解决方案:', 'error');
          this.log('  访问 https://nodejs.org 下载最新LTS版本', 'error');
          this.log('  或使用包管理器: brew install node (Mac) / choco install nodejs (Windows)', 'error');
          break;
          
        case 'not-git-repo':
          this.log('Git仓库初始化解决方案:', 'warning');
          this.log('  1. 初始化Git仓库: git init', 'warning');
          this.log('  2. 添加文件: git add .', 'warning');
          this.log('  3. 提交更改: git commit -m "Initial commit"', 'warning');
          break;
          
        case 'no-remote':
          this.log('远程仓库配置解决方案:', 'warning');
          this.log('  1. 在GitHub/GitLab等平台创建新仓库', 'warning');
          this.log('  2. 添加远程仓库: git remote add origin <仓库URL>', 'warning');
          this.log('  3. 推送代码: git push -u origin main', 'warning');
          break;
      }
    });
  }

  // 判断是否可以在存在问题的情况下继续
  canContinueWithIssues(issues) {
    const criticalIssues = ['git-missing', 'nodejs-missing'];
    const hasCriticalIssue = issues.some(issue => criticalIssues.includes(issue));
    
    if (hasCriticalIssue) {
      this.log('发现关键问题，无法继续部署。请解决上述问题后重试。', 'error');
      return false;
    }
    
    // 对于非关键问题，询问用户是否继续
    if (issues.includes('not-git-repo') || issues.includes('no-remote')) {
      this.log('检测到Git配置问题，但可以尝试继续部署。', 'warning');
      this.log('注意：GitHub Pages部署需要Git仓库和远程仓库配置。', 'warning');
      return true;
    }
    
    return true;
  }

  // 获取用户输入
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

  // 确认部署
  async confirmDeploy(platforms) {
    if (!this.config.general.confirm) return true;
    
    console.log('\n📋 部署信息:');
    console.log(`   项目: ${this.config.project.name}`);
    console.log(`   平台: ${platforms.join(', ')}`);
    
    const confirm = await this.prompt('确认部署吗？(y/N)', 'N');
    return confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes';
  }

  // 平台特定的预检查
  async performPlatformPreCheck(platform) {
    try {
      switch (platform) {
        case 'github':
          return this.checkGitHubPrerequisites();
        case 'vercel':
          return this.checkVercelPrerequisites();
        default:
          return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // GitHub预检查
  checkGitHubPrerequisites() {
    const issues = [];
    const autoFixableIssues = [];
    const manualFixIssues = [];
    
    // 检查Git仓库状态
    const gitRepoCheck = this.exec('git rev-parse --git-dir', { silent: true });
    if (!gitRepoCheck.success) {
      const issue = {
        type: 'no_git_repo',
        message: '项目未初始化为Git仓库',
        autoFixable: true,
        fixFunction: 'autoFixGitRepository'
      };
      issues.push(issue);
      autoFixableIssues.push(issue);
    }
    
    // 检查远程仓库
    const remoteCheck = this.exec('git remote -v', { silent: true });
    if (!remoteCheck.output || remoteCheck.output.trim() === '') {
      const issue = {
        type: 'no_remote_repo',
        message: '未配置GitHub远程仓库',
        autoFixable: false,
        fixFunction: 'setupGitHubRepository'
      };
      issues.push(issue);
      manualFixIssues.push(issue);
    }
    
    // 检查认证配置
    const hasToken = this.config.github.token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!hasToken) {
      const sshCheck = this.exec('ssh -T git@github.com', { silent: true });
      if (!sshCheck.success && !sshCheck.output?.includes('successfully authenticated')) {
        const issue = {
          type: 'no_github_auth',
          message: 'GitHub认证未配置（需要Token或SSH密钥）',
          autoFixable: false,
          fixFunction: 'setupGitHubAuthentication'
        };
        issues.push(issue);
        manualFixIssues.push(issue);
      }
    }
    
    if (issues.length > 0) {
      return {
        success: false,
        issues: issues,
        autoFixableIssues: autoFixableIssues,
        manualFixIssues: manualFixIssues,
        error: `GitHub部署预检查失败:\n${issues.map(issue => `- ${issue.message}`).join('\n')}`
      };
    }
    
    return { success: true };
  }

  // Vercel预检查
  checkVercelPrerequisites() {
    const issues = [];
    const autoFixableIssues = [];
    const manualFixIssues = [];
    
    // 检查认证配置
    const hasToken = this.config.vercel.token || process.env.VERCEL_TOKEN;
    if (!hasToken) {
      const cliCheck = this.exec('vercel whoami', { silent: true });
      if (!cliCheck.success) {
        const issue = {
          type: 'no_vercel_auth',
          message: 'Vercel认证未配置（需要Token或CLI登录）',
          autoFixable: false,
          fixFunction: 'setupVercelAuthentication'
        };
        issues.push(issue);
        manualFixIssues.push(issue);
      }
    }
    
    if (issues.length > 0) {
      return {
        success: false,
        issues: issues,
        autoFixableIssues: autoFixableIssues,
        manualFixIssues: manualFixIssues,
        error: `Vercel部署预检查失败:\n${issues.map(issue => `- ${issue.message}`).join('\n')}`
      };
    }
    
    return { success: true };
  }

  // 显示平台特定的错误解决方案
  showPlatformErrorSolutions(platform, error) {
    console.log('\n💡 错误解决建议:');
    
    switch (platform) {
      case 'github':
        if (error.includes('认证') || error.includes('authentication')) {
          console.log('GitHub认证问题解决方案:');
          console.log('1. 设置GitHub Token: https://github.com/settings/tokens');
          console.log('2. 或配置SSH密钥: https://github.com/settings/ssh');
          console.log('3. 参考文档: https://docs.github.com/en/authentication');
        } else if (error.includes('repository') || error.includes('仓库')) {
          console.log('GitHub仓库问题解决方案:');
          console.log('1. 创建GitHub仓库: https://github.com/new');
          console.log('2. 添加远程仓库: git remote add origin <仓库URL>');
          console.log('3. 推送代码: git push -u origin main');
        } else if (error.includes('git')) {
          console.log('Git相关问题解决方案:');
          console.log('1. 初始化仓库: git init');
          console.log('2. 添加文件: git add .');
          console.log('3. 提交更改: git commit -m "Initial commit"');
        }
        break;
        
      case 'vercel':
        if (error.includes('认证') || error.includes('authentication')) {
          console.log('Vercel认证问题解决方案:');
          console.log('1. 获取Token: https://vercel.com/account/tokens');
          console.log('2. 或CLI登录: vercel login');
          console.log('3. 验证登录: vercel whoami');
        } else if (error.includes('CLI') || error.includes('command not found')) {
          console.log('Vercel CLI问题解决方案:');
          console.log('1. 安装CLI: npm install -g vercel');
          console.log('2. 验证安装: vercel --version');
        } else if (error.includes('project') || error.includes('项目')) {
          console.log('Vercel项目问题解决方案:');
          console.log('1. 检查项目配置: vercel.json');
          console.log('2. 重新链接项目: vercel --force');
          console.log('3. 检查团队权限: vercel teams list');
        }
        break;
        
      default:
        console.log('通用解决方案:');
        console.log('1. 检查网络连接');
        console.log('2. 验证配置文件: web-deploy.config.js');
        console.log('3. 查看详细日志获取更多信息');
    }
    
    console.log('\n📚 需要帮助？访问项目文档或提交issue获取支持。');
  }

  // 主部署函数
  async deploy(platforms = []) {
    console.log('🚀 Universal Web Deployer 启动...\n');
    
    this.checkRequirements();
    
    // 确定部署平台
    const availablePlatforms = [];
    if (this.config.github.enabled) availablePlatforms.push('github');
    if (this.config.vercel.enabled) availablePlatforms.push('vercel');
    
    if (platforms.length === 0) {
      console.log('📦 可用部署平台:');
      availablePlatforms.forEach((platform, index) => {
        console.log(`   ${index + 1}. ${platform}`);
      });
      
      const choice = await this.prompt('选择部署平台 (1-' + availablePlatforms.length + ',或all)', 'all');
      
      if (choice.toLowerCase() === 'all') {
        platforms = availablePlatforms;
      } else {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < availablePlatforms.length) {
          platforms = [availablePlatforms[index]];
        } else {
          this.log('无效选择', 'error');
          process.exit(1);
        }
      }
    }

    // 确认部署
    const confirmed = await this.confirmDeploy(platforms);
    if (!confirmed) {
      this.log('部署已取消', 'warning');
      this.rl.close();
      return;
    }

    // 执行部署前命令
    if (this.config.build.beforeBuild && this.config.build.beforeBuild.length > 0) {
      this.log('执行构建前命令...');
      for (const cmd of this.config.build.beforeBuild) {
        const result = this.exec(cmd);
        if (!result.success) {
          this.log(`命令执行失败: ${cmd}`, 'error');
          process.exit(1);
        }
      }
    }

    // 执行各平台部署（带自动修复）
    const results = {};
    for (const platform of platforms) {
      this.log(`\n开始部署到 ${platform.toUpperCase()}...`);
      
      try {
        // 执行预检查和自动修复循环
        const platformResult = await this.deployWithAutoFix(platform);
        results[platform] = platformResult;
        
        if (platformResult.success) {
          this.log(`${platform} 部署成功!`, 'success');
          if (platformResult.url) {
            this.log(`访问地址: ${platformResult.url}`);
          }
        } else {
          this.log(`${platform} 部署失败: ${platformResult.error}`, 'error');
          this.showPlatformErrorSolutions(platform, platformResult.error);
        }
      } catch (error) {
        this.log(`${platform} 部署过程异常: ${error.message}`, 'error');
        results[platform] = { success: false, error: error.message };
      }
    }

    // 执行部署后命令
    if (this.config.build.afterBuild && this.config.build.afterBuild.length > 0) {
      this.log('执行构建后命令...');
      for (const cmd of this.config.build.afterBuild) {
        this.exec(cmd);
      }
    }

    // 输出部署结果
    console.log('\n📊 部署结果汇总:');
    Object.entries(results).forEach(([platform, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${platform}: ${result.success ? (result.url || '成功') : result.error}`);
    });

    // 自动打开浏览器
    if (this.config.general.autoOpen) {
      const successfulDeployments = Object.entries(results)
        .filter(([, result]) => result.success && result.url);
      
      if (successfulDeployments.length > 0) {
        const [platform, result] = successfulDeployments[0];
        this.log(`正在打开 ${platform} 部署地址...`);
        
        try {
          const open = require('open');
          await open(result.url);
        } catch (error) {
          this.log(`无法自动打开浏览器: ${error.message}`, 'warning');
        }
      }
    }

    this.rl.close();
    this.log('\n🎉 部署完成!', 'success');
  }

  // ===========================================
  // 部署流程和自动修复
  // ===========================================

  // 带自动修复的部署流程
  async deployWithAutoFix(platform, maxRetries = 3) {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      this.log(`🔍 第${retryCount + 1}次预检查 ${platform.toUpperCase()}...`);
      
      // 执行预检查
      const preCheckResult = await this.performPlatformPreCheck(platform);
      
      if (preCheckResult.success) {
        // 预检查通过，执行部署
        this.log(`✅ ${platform} 预检查通过，开始部署...`, 'success');
        
        try {
          const deployer = require(path.join(__dirname, 'deployers', `${platform}.js`));
          const result = await deployer.deploy(this.config, this.rootDir);
          return result;
        } catch (error) {
          return { success: false, error: `部署器执行失败: ${error.message}` };
        }
      }
      
      // 预检查失败，尝试修复
      const fixResult = await this.attemptAutoFix(platform, preCheckResult);
      
      if (!fixResult.anyFixed) {
        // 没有任何问题被修复，无法继续
        return {
          success: false,
          error: `${platform} 预检查失败，无法自动修复所有问题:\n${preCheckResult.error}`
        };
      }
      
      retryCount++;
      
      if (retryCount >= maxRetries) {
        return {
          success: false,
          error: `${platform} 在${maxRetries}次尝试后仍有未解决的问题:\n${preCheckResult.error}`
        };
      }
      
      this.log(`🔄 问题已部分修复，准备重新检查...`, 'info');
    }
    
    return {
      success: false,
      error: `${platform} 超过最大重试次数 (${maxRetries})`
    };
  }

  // 尝试自动修复问题
  async attemptAutoFix(platform, preCheckResult) {
    let anyFixed = false;
    let fixedCount = 0;
    let skippedCount = 0;
    
    if (!preCheckResult.issues || preCheckResult.issues.length === 0) {
      return { anyFixed: false, fixedCount: 0, skippedCount: 0 };
    }

    this.log(`\n🔧 发现 ${preCheckResult.issues.length} 个问题，正在尝试修复...`);
    
    // 首先处理可以自动修复的问题
    if (preCheckResult.autoFixableIssues && preCheckResult.autoFixableIssues.length > 0) {
      this.log(`\n🤖 自动修复 ${preCheckResult.autoFixableIssues.length} 个可修复的问题:`);
      
      for (const issue of preCheckResult.autoFixableIssues) {
        this.log(`⚡ 正在修复: ${issue.message}`, 'info');
        
        try {
          let fixResult;
          
          // 调用对应的修复函数
          switch (issue.fixFunction) {
            case 'autoFixGitRepository':
              fixResult = await this.autoFixGitRepository();
              break;
            default:
              this.log(`⚠️ 未知的修复函数: ${issue.fixFunction}`, 'warning');
              continue;
          }
          
          if (fixResult && fixResult.success) {
            this.log(`✅ ${issue.message} - 已修复`, 'success');
            fixedCount++;
            anyFixed = true;
          } else {
            this.log(`❌ ${issue.message} - 修复失败: ${fixResult?.error || '未知错误'}`, 'error');
          }
        } catch (error) {
          this.log(`❌ ${issue.message} - 修复异常: ${error.message}`, 'error');
        }
      }
    }
    
    // 处理需要手动配置的问题
    if (preCheckResult.manualFixIssues && preCheckResult.manualFixIssues.length > 0) {
      this.log(`\n👤 交互式配置 ${preCheckResult.manualFixIssues.length} 个需要手动处理的问题:`);
      
      for (const issue of preCheckResult.manualFixIssues) {
        this.log(`\n🔧 需要配置: ${issue.message}`, 'warning');
        
        // 询问用户是否要配置此问题
        const shouldFix = await this.prompt(`是否现在配置此问题？(y/N/s=跳过所有)`, 'y');
        
        if (shouldFix.toLowerCase() === 's') {
          this.log('用户选择跳过所有剩余的手动配置', 'warning');
          skippedCount += preCheckResult.manualFixIssues.length - preCheckResult.manualFixIssues.indexOf(issue);
          break;
        }
        
        if (shouldFix.toLowerCase() !== 'y') {
          this.log(`跳过: ${issue.message}`, 'warning');
          skippedCount++;
          continue;
        }
        
        try {
          let fixResult;
          
          // 调用对应的修复函数
          switch (issue.fixFunction) {
            case 'setupGitHubRepository':
              fixResult = await this.setupGitHubRepository();
              break;
            case 'setupGitHubAuthentication':
              fixResult = await this.setupGitHubAuthentication();
              break;
            case 'setupVercelAuthentication':
              fixResult = await this.setupVercelAuthentication();
              break;
            default:
              this.log(`⚠️ 未知的配置函数: ${issue.fixFunction}`, 'warning');
              continue;
          }
          
          if (fixResult && fixResult.success) {
            this.log(`✅ ${issue.message} - 已配置`, 'success');
            fixedCount++;
            anyFixed = true;
          } else {
            this.log(`❌ ${issue.message} - 配置失败: ${fixResult?.error || '用户未完成配置'}`, 'error');
            skippedCount++;
          }
        } catch (error) {
          this.log(`❌ ${issue.message} - 配置异常: ${error.message}`, 'error');
          skippedCount++;
        }
      }
    }
    
    // 输出修复结果总结
    this.log(`\n📊 修复结果总结:`, 'info');
    this.log(`   ✅ 已修复: ${fixedCount} 个`, fixedCount > 0 ? 'success' : 'info');
    this.log(`   ⚠️ 已跳过: ${skippedCount} 个`, skippedCount > 0 ? 'warning' : 'info');
    
    return { anyFixed, fixedCount, skippedCount };
  }

  // ===========================================
  // 自动修复功能
  // ===========================================

  // 自动修复Git仓库
  async autoFixGitRepository() {
    this.log('🔧 正在自动初始化Git仓库...', 'info');
    
    try {
      // 初始化Git仓库
      const initResult = this.exec('git init');
      if (!initResult.success) {
        throw new Error('Git仓库初始化失败: ' + initResult.error);
      }
      this.log('✅ Git仓库初始化完成', 'success');

      // 检查是否有文件需要提交
      const statusResult = this.exec('git status --porcelain', { silent: true });
      if (!statusResult.success) {
        this.log('⚠️ 无法检查Git状态，跳过自动提交', 'warning');
        return { success: true, message: 'Git仓库已初始化，但未自动提交文件' };
      }

      // 如果有未跟踪的文件，自动添加和提交
      if (statusResult.output && statusResult.output.trim()) {
        const addResult = this.exec('git add .');
        if (!addResult.success) {
          this.log('⚠️ 自动添加文件失败，请手动执行: git add .', 'warning');
          return { success: true, message: 'Git仓库已初始化，请手动添加文件' };
        }

        const commitResult = this.exec('git commit -m "Initial commit by Universal Web Deployer"');
        if (!commitResult.success) {
          this.log('⚠️ 自动提交失败，请手动执行提交', 'warning');
          return { success: true, message: 'Git仓库已初始化并添加文件，请手动提交' };
        }
        
        this.log('✅ 自动提交完成', 'success');
        return { success: true, message: 'Git仓库已初始化并完成首次提交' };
      }

      return { success: true, message: 'Git仓库已初始化' };
    } catch (error) {
      this.log(`❌ Git仓库自动修复失败: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // GitHub仓库配置向导
  async setupGitHubRepository() {
    this.log('\n🔧 GitHub仓库配置向导', 'info');
    
    try {
      console.log('\n请按以下步骤配置GitHub远程仓库:');
      
      // 获取项目信息
      const projectName = this.config.project.name || 'my-project';
      const username = this.config.github.username || await this.prompt('GitHub用户名');

      console.log('\n📋 GitHub仓库设置步骤:');
      console.log(`1. 访问 https://github.com/new`);
      console.log(`2. 创建新仓库，建议名称: ${projectName}`);
      console.log(`3. 复制仓库URL (HTTPS或SSH格式)`);
      console.log(`   HTTPS: https://github.com/${username}/${projectName}.git`);
      console.log(`   SSH: git@github.com:${username}/${projectName}.git`);

      const repoUrl = await this.prompt('\n请输入GitHub仓库URL');
      
      if (!repoUrl) {
        return { success: false, error: '未提供仓库URL' };
      }

      // 添加远程仓库
      const remoteResult = this.exec(`git remote add origin "${repoUrl}"`);
      if (!remoteResult.success) {
        if (remoteResult.error.includes('already exists')) {
          // 如果remote已存在，尝试更新
          const setUrlResult = this.exec(`git remote set-url origin "${repoUrl}"`);
          if (!setUrlResult.success) {
            throw new Error('更新远程仓库URL失败: ' + setUrlResult.error);
          }
          this.log('✅ 远程仓库URL已更新', 'success');
        } else {
          throw new Error('添加远程仓库失败: ' + remoteResult.error);
        }
      } else {
        this.log('✅ 远程仓库已添加', 'success');
      }

      // 询问是否立即推送
      const shouldPush = await this.prompt('是否立即推送代码到GitHub？(y/N)', 'N');
      if (shouldPush.toLowerCase() === 'y') {
        this.log('正在推送到远程仓库...', 'info');
        const pushResult = this.exec('git push -u origin HEAD', { timeout: 30000 });
        if (!pushResult.success) {
          this.log('⚠️ 推送失败，可能需要先进行认证配置', 'warning');
          this.log('推送命令: git push -u origin HEAD', 'info');
          return { success: true, message: '远程仓库已配置，请稍后手动推送或配置认证' };
        }
        this.log('✅ 代码推送成功', 'success');
      }

      return { success: true, message: 'GitHub远程仓库配置完成' };
    } catch (error) {
      this.log(`❌ GitHub仓库配置失败: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // GitHub认证配置向导
  async setupGitHubAuthentication() {
    this.log('\n🔑 GitHub认证配置向导', 'info');
    
    console.log('\n请选择GitHub认证方式:');
    console.log('1. GitHub Personal Access Token (推荐)');
    console.log('2. SSH密钥认证');
    console.log('3. 跳过认证配置');

    const authChoice = await this.prompt('请选择 (1/2/3)', '1');

    switch (authChoice) {
      case '1':
        return await this.setupGitHubToken();
      case '2':
        return await this.setupGitHubSSH();
      case '3':
        this.log('已跳过认证配置', 'warning');
        return { success: true, message: '已跳过GitHub认证配置' };
      default:
        return await this.setupGitHubToken(); // 默认使用Token
    }
  }

  // GitHub Token配置
  async setupGitHubToken() {
    try {
      console.log('\n📋 GitHub Token 获取步骤:');
      console.log('1. 访问 https://github.com/settings/tokens');
      console.log('2. 点击 "Generate new token" → "Generate new token (classic)"');
      console.log('3. 设置Token名称 (如: Universal Web Deployer)');
      console.log('4. 选择权限: 勾选 "repo" 和 "workflow"');
      console.log('5. 点击 "Generate token"');
      console.log('6. 复制生成的token (形如: ghp_xxxxxxxxxxxx)');

      const token = await this.prompt('\n请输入GitHub Token (输入时不会显示)');
      
      if (!token || !token.startsWith('ghp_')) {
        this.log('⚠️ Token格式不正确，应以 "ghp_" 开头', 'warning');
        const confirm = await this.prompt('是否仍要继续设置此Token？(y/N)', 'N');
        if (confirm.toLowerCase() !== 'y') {
          return { success: false, error: '用户取消Token设置' };
        }
      }

      // 设置环境变量方式
      console.log('\n💾 Token保存方式:');
      console.log('1. 设置为环境变量 (推荐)');
      console.log('2. 保存到配置文件中');

      const saveChoice = await this.prompt('请选择保存方式 (1/2)', '1');

      if (saveChoice === '1') {
        // 显示环境变量设置命令
        console.log('\n📝 请在命令行中执行以下命令设置环境变量:');
        if (process.platform === 'win32') {
          console.log(`set GITHUB_TOKEN=${token}`);
          console.log('或在PowerShell中: $env:GITHUB_TOKEN="' + token + '"');
        } else {
          console.log(`export GITHUB_TOKEN=${token}`);
        }
        console.log('\n💡 建议将此命令添加到您的 .bashrc 或 .zshrc 文件中');
        
        const envSet = await this.prompt('已设置环境变量？(y/N)', 'N');
        if (envSet.toLowerCase() === 'y') {
          // 重新加载环境变量 (仅对当前进程有效)
          process.env.GITHUB_TOKEN = token;
          this.log('✅ GitHub Token 环境变量已设置', 'success');
          return { success: true, message: 'GitHub Token 认证已配置' };
        }
      } else {
        // 保存到配置文件
        this.config.github.token = token;
        await this.saveConfig();
        this.log('✅ GitHub Token 已保存到配置文件', 'success');
        return { success: true, message: 'GitHub Token 认证已配置' };
      }

      return { success: false, error: '用户未完成Token设置' };
    } catch (error) {
      return { success: false, error: 'GitHub Token配置失败: ' + error.message };
    }
  }

  // GitHub SSH配置
  async setupGitHubSSH() {
    try {
      console.log('\n📋 GitHub SSH密钥配置步骤:');
      console.log('1. 生成SSH密钥: ssh-keygen -t ed25519 -C "your_email@example.com"');
      console.log('2. 启动SSH agent: eval "$(ssh-agent -s)"');
      console.log('3. 添加密钥: ssh-add ~/.ssh/id_ed25519');
      console.log('4. 复制公钥: cat ~/.ssh/id_ed25519.pub');
      console.log('5. 访问 https://github.com/settings/ssh');
      console.log('6. 点击 "New SSH key"，粘贴公钥内容');
      console.log('7. 测试连接: ssh -T git@github.com');

      const completed = await this.prompt('\n已完成SSH密钥配置？(y/N)', 'N');
      
      if (completed.toLowerCase() === 'y') {
        // 测试SSH连接
        this.log('正在测试SSH连接...', 'info');
        const sshTest = this.exec('ssh -T git@github.com', { silent: true, timeout: 10000 });
        
        if (sshTest.success || (sshTest.output && sshTest.output.includes('successfully authenticated'))) {
          this.log('✅ SSH认证配置成功', 'success');
          return { success: true, message: 'GitHub SSH认证已配置' };
        } else {
          this.log('⚠️ SSH连接测试失败，请检查配置', 'warning');
          console.log('测试命令: ssh -T git@github.com');
          return { success: false, error: 'SSH认证测试失败' };
        }
      }

      return { success: false, error: '用户未完成SSH配置' };
    } catch (error) {
      return { success: false, error: 'GitHub SSH配置失败: ' + error.message };
    }
  }

  // Vercel认证配置向导
  async setupVercelAuthentication() {
    this.log('\n🔑 Vercel认证配置向导', 'info');
    
    console.log('\n请选择Vercel认证方式:');
    console.log('1. Vercel CLI 登录 (推荐)');
    console.log('2. Vercel Token');
    console.log('3. 跳过认证配置');

    const authChoice = await this.prompt('请选择 (1/2/3)', '1');

    switch (authChoice) {
      case '1':
        return await this.setupVercelCLI();
      case '2':
        return await this.setupVercelToken();
      case '3':
        this.log('已跳过认证配置', 'warning');
        return { success: true, message: '已跳过Vercel认证配置' };
      default:
        return await this.setupVercelCLI(); // 默认使用CLI
    }
  }

  // Vercel CLI配置
  async setupVercelCLI() {
    try {
      // 检查Vercel CLI是否已安装
      const cliCheck = this.exec('vercel --version', { silent: true });
      
      if (!cliCheck.success) {
        this.log('Vercel CLI未安装，正在自动安装...', 'info');
        const installResult = this.exec('npm install -g vercel');
        
        if (!installResult.success) {
          console.log('\n❌ 自动安装失败，请手动安装Vercel CLI:');
          console.log('npm install -g vercel');
          return { success: false, error: 'Vercel CLI安装失败' };
        }
        
        this.log('✅ Vercel CLI安装成功', 'success');
      }

      // 检查是否已登录
      const whoamiResult = this.exec('vercel whoami', { silent: true });
      if (whoamiResult.success) {
        const username = whoamiResult.output.trim();
        this.log(`✅ 已登录Vercel，用户: ${username}`, 'success');
        return { success: true, message: `Vercel认证已配置 (用户: ${username})` };
      }

      // 引导用户登录
      console.log('\n📝 Vercel CLI登录步骤:');
      console.log('1. 在新的终端窗口中运行: vercel login');
      console.log('2. 选择登录方式 (GitHub/GitLab/Email)');
      console.log('3. 按照提示完成登录');

      const loginCompleted = await this.prompt('\n已完成Vercel登录？(y/N)', 'N');
      
      if (loginCompleted.toLowerCase() === 'y') {
        // 重新检查登录状态
        const recheckResult = this.exec('vercel whoami', { silent: true });
        if (recheckResult.success) {
          const username = recheckResult.output.trim();
          this.log(`✅ Vercel登录验证成功，用户: ${username}`, 'success');
          return { success: true, message: `Vercel认证已配置 (用户: ${username})` };
        } else {
          this.log('❌ 登录验证失败，请重新尝试', 'error');
          return { success: false, error: 'Vercel登录验证失败' };
        }
      }

      return { success: false, error: '用户未完成Vercel登录' };
    } catch (error) {
      return { success: false, error: 'Vercel CLI配置失败: ' + error.message };
    }
  }

  // Vercel Token配置
  async setupVercelToken() {
    try {
      console.log('\n📋 Vercel Token 获取步骤:');
      console.log('1. 访问 https://vercel.com/account/tokens');
      console.log('2. 点击 "Create Token"');
      console.log('3. 输入token名称 (如: Universal Web Deployer)');
      console.log('4. 选择过期时间');
      console.log('5. 点击 "Create"');
      console.log('6. 复制生成的token');

      const token = await this.prompt('\n请输入Vercel Token');
      
      if (!token) {
        return { success: false, error: '未提供Vercel Token' };
      }

      // 测试Token有效性
      this.log('正在验证Token...', 'info');
      const testCommand = `vercel whoami --token ${token}`;
      const testResult = this.exec(testCommand, { silent: true });
      
      if (!testResult.success) {
        return { success: false, error: 'Token验证失败，请检查Token是否正确' };
      }

      // 保存Token
      console.log('\n💾 Token保存方式:');
      console.log('1. 设置为环境变量 (推荐)');
      console.log('2. 保存到配置文件中');

      const saveChoice = await this.prompt('请选择保存方式 (1/2)', '1');

      if (saveChoice === '1') {
        console.log('\n📝 请执行以下命令设置环境变量:');
        if (process.platform === 'win32') {
          console.log(`set VERCEL_TOKEN=${token}`);
        } else {
          console.log(`export VERCEL_TOKEN=${token}`);
        }
        
        const envSet = await this.prompt('已设置环境变量？(y/N)', 'N');
        if (envSet.toLowerCase() === 'y') {
          process.env.VERCEL_TOKEN = token;
          this.log('✅ Vercel Token 环境变量已设置', 'success');
          return { success: true, message: 'Vercel Token 认证已配置' };
        }
      } else {
        this.config.vercel.token = token;
        await this.saveConfig();
        this.log('✅ Vercel Token 已保存到配置文件', 'success');
        return { success: true, message: 'Vercel Token 认证已配置' };
      }

      return { success: false, error: '用户未完成Token设置' };
    } catch (error) {
      return { success: false, error: 'Vercel Token配置失败: ' + error.message };
    }
  }

  // 保存配置文件
  async saveConfig() {
    try {
      const configContent = `// Universal Web Deployer 配置文件
module.exports = ${JSON.stringify(this.config, null, 2)};
`;
      fs.writeFileSync(this.configPath, configContent);
      this.log('✅ 配置文件已更新', 'success');
    } catch (error) {
      this.log(`⚠️ 配置文件保存失败: ${error.message}`, 'warning');
    }
  }
}

module.exports = UniversalDeployer;