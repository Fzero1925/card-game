const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

class VercelDeployer {
  constructor() {
    this.apiUrl = 'https://api.vercel.com';
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

    console.log(`${colors[type]}${prefix[type]} [Vercel] ${message}${colors.reset}`);
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

  // HTTP请求辅助函数
  makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            resolve({ statusCode: res.statusCode, data: result });
          } catch (error) {
            resolve({ statusCode: res.statusCode, data: body });
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  // 检查Vercel CLI
  checkVercelCLI() {
    const cliCheck = this.exec('vercel --version', { silent: true });
    
    if (!cliCheck.success) {
      this.log('Vercel CLI未安装，正在安装...', 'warning');
      
      const installResult = this.exec('npm install -g vercel', { silent: false });
      if (!installResult.success) {
        throw new Error('Vercel CLI安装失败，请手动安装: npm install -g vercel');
      }
      
      this.log('Vercel CLI安装成功', 'success');
    } else {
      this.log('✓ Vercel CLI已安装');
    }
  }

  // 检查认证
  checkVercelAuth(config) {
    const token = config.vercel.token || process.env.VERCEL_TOKEN;
    
    if (!token) {
      this.log('未找到Vercel Token，尝试使用本地认证...', 'warning');
      
      // 检查本地是否已登录
      const authCheck = this.exec('vercel whoami', { silent: true });
      if (!authCheck.success) {
        const errorMessage = this.getVercelAuthErrorMessage();
        throw new Error(errorMessage);
      }
      
      this.log('✓ 使用本地Vercel认证');
      return { method: 'local', token: null };
    }

    return { method: 'token', token };
  }

  // 获取详细的Vercel认证错误信息和解决方案
  getVercelAuthErrorMessage() {
    return `Vercel认证失败。请选择以下任一方法进行配置：

方法一：使用Vercel Token (推荐)
1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token" 创建新token
3. 输入token名称，设置过期时间
4. 复制生成的token
5. 设置环境变量：
   Windows: set VERCEL_TOKEN=your_token_here
   Linux/Mac: export VERCEL_TOKEN=your_token_here
6. 或在 deploy.config.js 中设置：
   vercel: { token: "your_token_here", ... }

方法二：使用Vercel CLI本地登录
1. 确保已安装Vercel CLI：npm install -g vercel
2. 运行登录命令：vercel login
3. 选择登录方式：
   - GitHub: 使用GitHub账户登录
   - GitLab: 使用GitLab账户登录
   - Email: 使用邮箱和密码登录
4. 验证登录状态：vercel whoami

方法三：团队部署配置
1. 如果是团队项目，确保在 deploy.config.js 中设置正确的 teamId
2. 获取团队ID：vercel teams list
3. 在配置文件中设置：vercel: { teamId: "your_team_id" }

注意事项：
- Token方法适合CI/CD自动部署
- CLI登录方法适合本地开发部署
- 首次部署可能需要确认项目设置`;
  }

  // 创建Vercel配置文件
  createVercelConfig(config, rootDir) {
    const vercelConfig = {
      version: 2,
      name: config.vercel.projectName || config.project.name,
      builds: [
        {
          src: "**/*",
          use: "@vercel/static"
        }
      ],
      routes: [
        {
          src: "/(.*)",
          dest: "/$1"
        }
      ]
    };

    // 添加环境变量
    if (config.vercel.env && Object.keys(config.vercel.env).length > 0) {
      vercelConfig.env = config.vercel.env;
    }

    // 添加构建命令
    if (config.vercel.buildCommand) {
      vercelConfig.build = {
        env: config.vercel.env || {}
      };
    }

    // 添加区域设置
    if (config.vercel.regions && config.vercel.regions.length > 0) {
      vercelConfig.regions = config.vercel.regions;
    }

    const configPath = path.join(rootDir, 'vercel.json');
    fs.writeFileSync(configPath, JSON.stringify(vercelConfig, null, 2));
    
    this.log('Vercel配置文件已创建');
    return configPath;
  }

  // 清理文件
  cleanupFiles(filesToCleanup) {
    filesToCleanup.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }

  // 部署到Vercel
  async deploy(config, rootDir) {
    try {
      this.checkVercelCLI();
      const auth = this.checkVercelAuth(config);
      
      const projectName = config.vercel.projectName || config.project.name;
      this.log(`部署项目: ${projectName}`);

      // 进入项目目录
      process.chdir(rootDir);

      // 创建临时配置文件
      const filesToCleanup = [];
      const vercelConfigPath = this.createVercelConfig(config, rootDir);
      filesToCleanup.push(vercelConfigPath);

      // 构建部署命令
      let deployCommand = 'vercel --prod --yes';
      
      if (auth.method === 'token') {
        deployCommand += ` --token ${auth.token}`;
      }
      
      if (config.vercel.teamId) {
        deployCommand += ` --scope ${config.vercel.teamId}`;
      }

      // 执行部署
      this.log('开始部署...');
      const deployResult = this.exec(deployCommand);
      
      if (!deployResult.success) {
        throw new Error(`部署失败: ${deployResult.error}`);
      }

      // 提取部署URL
      const deployOutput = deployResult.output;
      const urlMatch = deployOutput.match(/https:\/\/[^\s]+\.vercel\.app/);
      const deployUrl = urlMatch ? urlMatch[0] : null;

      // 设置自定义域名别名
      if (config.vercel.alias && config.vercel.alias.length > 0) {
        this.log('设置域名别名...');
        
        for (const alias of config.vercel.alias) {
          let aliasCommand = `vercel alias ${deployUrl} ${alias}`;
          
          if (auth.method === 'token') {
            aliasCommand += ` --token ${auth.token}`;
          }
          
          const aliasResult = this.exec(aliasCommand, { silent: true });
          if (aliasResult.success) {
            this.log(`✓ 别名设置成功: ${alias}`);
          } else {
            this.log(`⚠️ 别名设置失败: ${alias}`, 'warning');
          }
        }
      }

      // 清理临时文件
      this.cleanupFiles(filesToCleanup);

      const finalUrl = (config.vercel.alias && config.vercel.alias[0]) 
        ? `https://${config.vercel.alias[0]}` 
        : deployUrl;

      return {
        success: true,
        url: finalUrl,
        deployUrl: deployUrl,
        platform: 'Vercel',
        projectName: projectName,
        aliases: config.vercel.alias || []
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        platform: 'Vercel'
      };
    }
  }

  // 使用API部署（备用方案）
  async deployViaAPI(config, rootDir) {
    try {
      const token = config.vercel.token || process.env.VERCEL_TOKEN;
      if (!token) {
        throw new Error('API部署需要Vercel Token');
      }

      this.log('使用API进行部署...');
      
      // 获取项目文件
      const files = this.getProjectFiles(config, rootDir);
      
      // 创建部署
      const deploymentData = {
        name: config.vercel.projectName || config.project.name,
        files: files,
        version: 2,
        builds: [{ src: "**/*", use: "@vercel/static" }]
      };

      const options = {
        hostname: 'api.vercel.com',
        port: 443,
        path: '/v13/deployments',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };

      const response = await this.makeRequest(options, deploymentData);
      
      if (response.statusCode !== 200) {
        throw new Error(`API部署失败: ${JSON.stringify(response.data)}`);
      }

      const deploymentUrl = `https://${response.data.url}`;
      
      return {
        success: true,
        url: deploymentUrl,
        platform: 'Vercel (API)',
        deploymentId: response.data.id
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        platform: 'Vercel (API)'
      };
    }
  }

  // 获取项目文件（用于API部署）
  getProjectFiles(config, rootDir) {
    const files = {};
    const buildDir = path.resolve(rootDir, config.vercel.buildDir || './');
    const ignore = config.build.ignore || [];

    const addFile = (filePath) => {
      const relativePath = path.relative(buildDir, filePath);
      const content = fs.readFileSync(filePath, 'base64');
      files[relativePath] = { data: content, encoding: 'base64' };
    };

    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const relativePath = path.relative(rootDir, itemPath).replace(/\\/g, '/');
        
        // 检查是否应该忽略
        const shouldIgnore = ignore.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
          return regex.test(relativePath);
        });
        
        if (shouldIgnore) continue;
        
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          scanDir(itemPath);
        } else {
          addFile(itemPath);
        }
      }
    };

    scanDir(buildDir);
    return files;
  }
}

module.exports = {
  deploy: async (config, rootDir) => {
    const deployer = new VercelDeployer();
    return await deployer.deploy(config, rootDir);
  }
};