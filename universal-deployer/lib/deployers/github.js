const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitHubPagesDeployer {
  constructor() {
    this.tempDir = path.join(process.cwd(), '.deploy-temp');
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

    console.log(`${colors[type]}${prefix[type]} [GitHub] ${message}${colors.reset}`);
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

  // 获取Git用户信息
  getGitUserInfo() {
    try {
      const name = execSync('git config user.name', { encoding: 'utf8' }).trim();
      const email = execSync('git config user.email', { encoding: 'utf8' }).trim();
      return { name, email };
    } catch (error) {
      return { name: 'Deploy Bot', email: 'noreply@github.com' };
    }
  }

  // 获取GitHub仓库信息
  getRepoInfo(config) {
    let repoUrl = '';
    let username = config.github.username;
    let repository = config.github.repository;

    // 尝试从git remote获取信息
    try {
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      if (remoteUrl.includes('github.com')) {
        const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
        if (match) {
          username = username || match[1];
          repository = repository || match[2];
          repoUrl = `https://github.com/${username}/${repository}.git`;
        }
      }
    } catch (error) {
      // 忽略错误，使用配置中的值
    }

    // 如果仍然没有仓库信息，使用项目名称
    if (!repository) {
      repository = config.project.name;
    }

    if (!username) {
      const userInfo = this.getGitUserInfo();
      username = userInfo.name.toLowerCase().replace(/\s+/g, '-');
    }

    if (!repoUrl) {
      repoUrl = `https://github.com/${username}/${repository}.git`;
    }

    return { username, repository, repoUrl };
  }

  // 检查GitHub认证
  checkGitHubAuth(config) {
    const token = config.github.token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    
    if (!token) {
      this.log('未找到GitHub Token，将尝试使用SSH认证', 'warning');
      
      // 检查SSH密钥
      const sshCheck = this.exec('ssh -T git@github.com', { silent: true });
      if (!sshCheck.success && !sshCheck.output?.includes('successfully authenticated')) {
        const errorMessage = this.getGitHubAuthErrorMessage();
        throw new Error(errorMessage);
      }
      
      return { method: 'ssh', token: null };
    }

    return { method: 'token', token };
  }

  // 获取详细的GitHub认证错误信息和解决方案
  getGitHubAuthErrorMessage() {
    return `GitHub认证失败。请选择以下任一方法进行配置：

方法一：使用GitHub Token (推荐)
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Generate new token (classic)"
3. 勾选 "repo" 和 "workflow" 权限
4. 复制生成的token
5. 设置环境变量：
   Windows: set GITHUB_TOKEN=your_token_here
   Linux/Mac: export GITHUB_TOKEN=your_token_here
6. 或在 deploy.config.js 中设置：
   github: { token: "your_token_here", ... }

方法二：配置SSH密钥
1. 生成SSH密钥：ssh-keygen -t ed25519 -C "your_email@example.com"
2. 添加到SSH agent：ssh-add ~/.ssh/id_ed25519
3. 复制公钥内容：cat ~/.ssh/id_ed25519.pub
4. 访问 https://github.com/settings/ssh 添加SSH密钥
5. 测试连接：ssh -T git@github.com

方法三：初始化Git仓库 (如果项目未关联GitHub)
1. 在GitHub创建新仓库
2. 本地初始化：git init
3. 添加远程仓库：git remote add origin https://github.com/username/repo.git
4. 然后使用上述方法一或方法二进行认证`;
  }

  // 准备部署文件
  prepareFiles(config, rootDir) {
    this.log('准备部署文件...');
    
    // 清理临时目录
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(this.tempDir, { recursive: true });

    // 获取要部署的文件
    const buildDir = path.resolve(rootDir, config.github.buildDir || './');
    const ignore = config.build.ignore || [];

    // 创建忽略模式的正则表达式
    const ignorePatterns = ignore.map(pattern => {
      const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      return new RegExp(`^${escaped}$`);
    });

    const copyDir = (src, dest) => {
      if (!fs.existsSync(src)) return;
      
      const items = fs.readdirSync(src);
      
      for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        const relativePath = path.relative(rootDir, srcPath).replace(/\\/g, '/');
        
        // 检查是否应该忽略
        const shouldIgnore = ignorePatterns.some(pattern => pattern.test(relativePath));
        if (shouldIgnore) continue;
        
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };

    copyDir(buildDir, this.tempDir);

    // 创建.nojekyll文件（GitHub Pages需要）
    fs.writeFileSync(path.join(this.tempDir, '.nojekyll'), '');

    // 如果有自定义域名，创建CNAME文件
    if (config.github.customDomain) {
      fs.writeFileSync(path.join(this.tempDir, 'CNAME'), config.github.customDomain);
    }

    this.log('文件准备完成');
  }

  // 部署到GitHub Pages
  async deploy(config, rootDir) {
    try {
      const { username, repository, repoUrl } = this.getRepoInfo(config);
      const auth = this.checkGitHubAuth(config);
      const branch = config.github.branch || 'gh-pages';
      const message = config.github.message || `🚀 Deploy to GitHub Pages`;
      
      this.log(`部署到仓库: ${username}/${repository}`);
      this.log(`目标分支: ${branch}`);

      // 准备文件
      this.prepareFiles(config, rootDir);

      // 进入临时目录并初始化git
      process.chdir(this.tempDir);
      
      const userInfo = this.getGitUserInfo();
      this.exec(`git init`);
      this.exec(`git config user.name "${userInfo.name}"`);
      this.exec(`git config user.email "${userInfo.email}"`);
      
      // 添加文件
      this.exec('git add .');
      this.exec(`git commit -m "${message}"`);

      // 设置远程仓库URL
      let remoteUrl = repoUrl;
      if (auth.method === 'token') {
        remoteUrl = repoUrl.replace('https://', `https://${auth.token}@`);
      } else {
        remoteUrl = repoUrl.replace('https://github.com/', 'git@github.com:');
      }

      this.exec(`git remote add origin "${remoteUrl}"`);

      // 推送到GitHub Pages分支
      this.log(`推送到 ${branch} 分支...`);
      const pushResult = this.exec(`git push -f origin HEAD:${branch}`);
      
      if (!pushResult.success) {
        throw new Error(`推送失败: ${pushResult.error}`);
      }

      // 清理临时目录
      process.chdir(rootDir);
      fs.rmSync(this.tempDir, { recursive: true, force: true });

      const url = `https://${username}.github.io/${repository}`;
      
      return {
        success: true,
        url: url,
        platform: 'GitHub Pages',
        repository: `${username}/${repository}`,
        branch: branch
      };

    } catch (error) {
      // 清理临时目录
      if (fs.existsSync(this.tempDir)) {
        try {
          process.chdir(rootDir);
          fs.rmSync(this.tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          // 忽略清理错误
        }
      }

      return {
        success: false,
        error: error.message,
        platform: 'GitHub Pages'
      };
    }
  }
}

module.exports = {
  deploy: async (config, rootDir) => {
    const deployer = new GitHubPagesDeployer();
    return await deployer.deploy(config, rootDir);
  }
};