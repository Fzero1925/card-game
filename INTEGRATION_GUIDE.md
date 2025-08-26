# 🔧 Universal Web Deployer 集成指南

这个指南帮助您将本项目的部署工具集成到其他项目中。

## 📦 什么是 Universal Web Deployer？

Universal Web Deployer 是从本项目中提取的独立部署工具，具有以下特性：

- ✅ **完全独立** - 可在任何项目中使用
- ✅ **智能错误处理** - 详细的诊断和解决方案
- ✅ **多平台支持** - GitHub Pages 和 Vercel
- ✅ **预部署验证** - 自动检查环境配置
- ✅ **零依赖** - 仅使用Node.js内置模块

## 🚀 集成方法

### 方法一：直接复制（推荐用于单个项目）

```bash
# 从本项目复制到目标项目
cp -r universal-deployer /path/to/your-project/

# Windows
xcopy universal-deployer C:\path\to\your-project\universal-deployer\ /E /I

# 进入目标项目
cd /path/to/your-project

# 初始化配置
node universal-deployer/bin/cli.js --init

# 开始部署
node universal-deployer/bin/cli.js
```

### 方法二：使用安装脚本

#### Linux/Mac
```bash
cd /path/to/your-project
curl -sSL https://raw.githubusercontent.com/username/universal-web-deployer/main/quick-install.sh | bash
```

#### Windows
```cmd
cd C:\path\to\your-project
curl -sSL https://raw.githubusercontent.com/username/universal-web-deployer/main/quick-install.bat -o install.bat && install.bat
```

### 方法三：NPM 全局安装（发布后可用）

```bash
# 全局安装
npm install -g universal-web-deployer

# 在任意项目中使用
cd your-project
web-deploy --init
web-deploy
```

### 方法四：NPX 临时使用

```bash
cd your-project
npx universal-web-deployer --init
npx universal-web-deployer
```

## 📝 配置文件示例

初始化后会创建 `web-deploy.config.js`：

```javascript
// Universal Web Deployer 配置文件
module.exports = {
  project: {
    name: "my-new-project",
    description: "My awesome new project",
    author: "Your Name",
    version: "1.0.0"
  },
  
  github: {
    enabled: true,
    username: "your-username",
    repository: "my-new-project",
    branch: "gh-pages"
  },
  
  vercel: {
    enabled: true,
    projectName: "my-new-project",
    regions: ["hkg1", "sfo1"]
  },
  
  build: {
    beforeBuild: [],
    afterBuild: [],
    ignore: [
      "node_modules/**",
      ".git/**",
      "universal-deployer/**"
    ]
  },
  
  general: {
    autoOpen: true,
    showLogs: true,
    confirm: true
  }
};
```

## 🔧 自定义集成

### 添加到现有项目的 package.json

```json
{
  "scripts": {
    "deploy": "node universal-deployer/bin/cli.js",
    "deploy:init": "node universal-deployer/bin/cli.js --init",
    "deploy:github": "node universal-deployer/bin/cli.js github",
    "deploy:vercel": "node universal-deployer/bin/cli.js vercel",
    "deploy:all": "node universal-deployer/bin/cli.js all"
  }
}
```

### 自定义部署器

如果需要支持其他平台，可以创建自定义部署器：

```javascript
// universal-deployer/lib/deployers/netlify.js
module.exports = {
  deploy: async (config, rootDir) => {
    try {
      // 自定义部署逻辑
      console.log('正在部署到 Netlify...');
      
      // 返回结果
      return {
        success: true,
        url: 'https://your-site.netlify.app',
        platform: 'Netlify'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        platform: 'Netlify'
      };
    }
  }
};
```

然后在配置文件中启用：

```javascript
module.exports = {
  // ... 其他配置
  netlify: {
    enabled: true,
    siteName: "my-site"
  }
};
```

## 🌟 最佳实践

### 1. 环境变量管理

创建 `.env` 文件管理敏感信息：

```bash
# .env
GITHUB_TOKEN=ghp_your_github_token
VERCEL_TOKEN=your_vercel_token
```

### 2. CI/CD 集成

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: node universal-deployer/bin/cli.js all
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

#### GitLab CI
```yaml
# .gitlab-ci.yml
deploy:
  stage: deploy
  image: node:18
  script:
    - node universal-deployer/bin/cli.js all
  variables:
    GITHUB_TOKEN: $GITHUB_TOKEN
    VERCEL_TOKEN: $VERCEL_TOKEN
  only:
    - main
```

### 3. 多环境部署

```javascript
// web-deploy.config.js
const env = process.env.NODE_ENV || 'production';

module.exports = {
  project: {
    name: env === 'production' ? 'my-app' : `my-app-${env}`,
    // ... 其他配置
  },
  
  github: {
    enabled: env === 'production',
    branch: env === 'production' ? 'gh-pages' : `gh-pages-${env}`
  },
  
  vercel: {
    enabled: true,
    projectName: env === 'production' ? 'my-app' : `my-app-${env}`
  }
};
```

## 🔍 故障排除

### 常见问题

1. **权限问题**
   ```bash
   chmod +x universal-deployer/bin/cli.js
   ```

2. **配置文件不存在**
   ```bash
   node universal-deployer/bin/cli.js --init
   ```

3. **路径问题**
   ```bash
   # 确保在项目根目录执行
   pwd
   ls universal-deployer/
   ```

### 调试模式

```bash
# 显示详细日志
DEBUG=* node universal-deployer/bin/cli.js

# 或修改配置文件
general: {
  showLogs: true
}
```

## 📚 更多资源

- [完整文档](universal-deployer/README.md)
- [部署器API](universal-deployer/lib/deployers/)
- [配置选项](universal-deployer/lib/index.js)

---

**🎯 现在您可以在任何项目中享受智能化的部署体验！**