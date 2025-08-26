const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitHubPagesDeployer {
  constructor(rootDir = null) {
    // 使用传入的rootDir或者寻找项目根目录，避免.deploy-temp无限嵌套问题
    const projectRoot = rootDir || this.findProjectRoot();
    this.tempDir = path.join(projectRoot, '.deploy-temp');
  }

  // 寻找项目根目录（包含package.json或.git的目录）
  findProjectRoot(startDir = process.cwd()) {
    let currentDir = startDir;
    
    while (currentDir !== path.dirname(currentDir)) {
      // 检查是否存在package.json或.git目录
      if (fs.existsSync(path.join(currentDir, 'package.json')) || 
          fs.existsSync(path.join(currentDir, '.git'))) {
        return currentDir;
      }
      
      // 如果当前目录包含.deploy-temp，向上查找
      if (path.basename(currentDir) === '.deploy-temp') {
        currentDir = path.dirname(currentDir);
        continue;
      }
      
      // 向上查找
      currentDir = path.dirname(currentDir);
    }
    
    // 如果找不到项目根目录，使用当前工作目录，但排除.deploy-temp路径
    let cwd = process.cwd();
    while (cwd.includes('.deploy-temp')) {
      cwd = path.dirname(cwd);
    }
    return cwd;
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

  // 清理临时目录
  cleanupTempDir() {
    if (fs.existsSync(this.tempDir)) {
      try {
        this.log(`清理临时目录: ${this.tempDir}`);
        // 强制删除临时目录，包括只读文件
        if (process.platform === 'win32') {
          // Windows系统使用attrib命令移除只读属性
          try {
            execSync(`attrib -R "${this.tempDir}\\*.*" /S`, { stdio: 'ignore' });
          } catch (e) {
            // 忽略attrib命令错误
          }
        }
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      } catch (error) {
        this.log(`临时目录清理失败: ${error.message}`, 'warning');
        // 如果删除失败，尝试重命名为删除标记
        try {
          const deleteMark = `${this.tempDir}_DELETE_${Date.now()}`;
          fs.renameSync(this.tempDir, deleteMark);
          this.log(`临时目录已标记为删除: ${deleteMark}`, 'warning');
        } catch (renameError) {
          this.log(`无法标记临时目录删除: ${renameError.message}`, 'error');
        }
      }
    }
  }

  // 准备部署文件
  prepareFiles(config, rootDir) {
    this.log('准备部署文件...');
    
    // 清理临时目录
    this.cleanupTempDir();
    
    // 确保临时目录不在自身内部创建
    if (this.tempDir.includes(rootDir) && rootDir.includes('.deploy-temp')) {
      throw new Error('检测到.deploy-temp路径嵌套问题，请检查项目根目录设置');
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
      this.cleanupTempDir();

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
      try {
        process.chdir(rootDir);
        this.cleanupTempDir();
      } catch (cleanupError) {
        this.log(`清理异常: ${cleanupError.message}`, 'warning');
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
    const deployer = new GitHubPagesDeployer(rootDir);
    return await deployer.deploy(config, rootDir);
  }
};