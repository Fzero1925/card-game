# 🚀 Universal Web Deployer

一个智能的Web项目部署工具，支持GitHub Pages和Vercel平台，具备完善的错误处理和用户指导功能。

## ✨ 特性

- 🎯 **一键部署** - 支持 GitHub Pages 和 Vercel
- 🔧 **智能配置** - 自动检测项目信息和Git设置  
- 🌐 **多平台支持** - 同时部署到多个平台
- 📱 **响应式友好** - 完美支持静态网站和SPA应用
- 🔒 **安全认证** - 支持Token和本地认证
- 📊 **详细日志** - 清晰的部署进度和结果反馈
- 🛠️ **智能错误处理** - 详细的错误诊断和解决方案指导
- ✅ **预部署验证** - 自动检查环境和认证配置
- 💡 **用户友好提示** - 分步骤的问题解决指南
- 📦 **独立可复用** - 可轻松集成到任何项目中

## 🚀 快速开始

### 方法一：NPM全局安装（推荐）

```bash
# 全局安装
npm install -g universal-web-deployer

# 在任意项目中使用
cd your-project
web-deploy --init    # 初始化配置
web-deploy          # 开始部署
```

### 方法二：项目内安装

```bash
# 在项目根目录运行
npx universal-web-deployer --init
npx universal-web-deployer
```

### 方法三：手动集成

```bash
# 下载部署工具到项目中
curl -L https://github.com/username/universal-web-deployer/archive/main.zip -o deployer.zip
unzip deployer.zip
mv universal-web-deployer-main/universal-deployer ./
rm -rf universal-web-deployer-main deployer.zip

# 或使用安装脚本
node universal-deployer/install.js
```

## 📋 配置文件

首次使用时，运行初始化命令创建配置文件：

```bash
web-deploy --init
```

这将创建 `web-deploy.config.js` 配置文件：

```javascript
// Universal Web Deployer 配置文件
module.exports = {
  project: {
    name: "my-awesome-app",
    description: "My awesome web application",
    author: "Your Name",
    version: "1.0.0"
  },
  
  github: {
    enabled: true,
    username: "your-username",
    repository: "your-repo",
    branch: "gh-pages",
    // token: "ghp_xxxxxxxxxxxx", // 可选，或使用环境变量
    customDomain: "your-domain.com" // 可选
  },
  
  vercel: {
    enabled: true,
    projectName: "my-awesome-app",
    // token: "xxxxxxxxxx", // 可选，或使用环境变量
    // teamId: "team_xxxxx", // 团队项目可选
    regions: ["hkg1", "sfo1"],
    alias: ["your-domain.com"] // 自定义域名别名，可选
  },
  
  build: {
    beforeBuild: [], // 部署前执行的命令
    afterBuild: [],  // 部署后执行的命令
    ignore: [        // 忽略的文件和目录
      "node_modules/**",
      ".git/**",
      ".DS_Store",
      "*.log",
      ".env*",
      "web-deploy.config.js",
      "universal-deployer/**",
      "README.md"
    ]
  },
  
  general: {
    autoOpen: true,    // 部署成功后自动打开网站
    showLogs: true,    // 显示详细日志
    confirm: true      // 部署前需要确认
  }
};
```

## 🔑 认证配置

### GitHub Pages 认证

#### 方法一：GitHub Token（推荐）
1. 访问 [GitHub Token Settings](https://github.com/settings/tokens)
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 选择 `repo` 和 `workflow` 权限
4. 复制生成的token并设置环境变量：
   ```bash
   # Windows
   set GITHUB_TOKEN=ghp_your_token_here
   
   # Linux/Mac
   export GITHUB_TOKEN=ghp_your_token_here
   ```

#### 方法二：SSH密钥
1. 生成SSH密钥：`ssh-keygen -t ed25519 -C "your_email@example.com"`
2. 添加到SSH agent：`ssh-add ~/.ssh/id_ed25519`
3. 在 [GitHub SSH Settings](https://github.com/settings/ssh) 添加公钥
4. 测试连接：`ssh -T git@github.com`

### Vercel 认证

#### 方法一：Vercel Token（推荐）
1. 访问 [Vercel Token Settings](https://vercel.com/account/tokens)
2. 点击 "Create Token" 创建新token
3. 设置环境变量：
   ```bash
   # Windows
   set VERCEL_TOKEN=your_token_here
   
   # Linux/Mac
   export VERCEL_TOKEN=your_token_here
   ```

#### 方法二：CLI登录
```bash
npm install -g vercel
vercel login
vercel whoami  # 验证登录状态
```

## 💻 使用方法

### 基本命令

```bash
# 查看帮助
web-deploy --help

# 初始化配置文件
web-deploy --init

# 交互式部署（推荐）
web-deploy

# 部署到特定平台
web-deploy github    # GitHub Pages
web-deploy vercel    # Vercel
web-deploy all       # 所有启用的平台

# 查看版本
web-deploy --version
```

### NPM脚本集成

如果使用项目内安装，可以在 `package.json` 中添加：

```json
{
  "scripts": {
    "deploy": "web-deploy",
    "deploy:init": "web-deploy --init",
    "deploy:github": "web-deploy github",
    "deploy:vercel": "web-deploy vercel",
    "deploy:all": "web-deploy all"
  }
}
```

然后使用：
```bash
npm run deploy:init
npm run deploy
npm run deploy:github
```

## 🛠️ 智能错误处理

本工具具备完善的错误处理系统，会自动检测常见问题并提供解决方案：

### 自动环境检查
- ✅ Git安装和配置检查
- ✅ Node.js环境验证  
- ✅ Git仓库状态检测
- ✅ 远程仓库配置验证
- ✅ 平台认证状态检查

### 智能错误提示
当遇到问题时，工具会显示详细的解决方案：

```bash
⚠️ 当前目录不是Git仓库
Git仓库初始化解决方案:
  1. 初始化Git仓库: git init
  2. 添加文件: git add .
  3. 提交更改: git commit -m "Initial commit"
```

### 认证失败处理
```bash
GitHub认证失败。请选择以下任一方法进行配置：

方法一：使用GitHub Token (推荐)
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Generate new token (classic)"
3. 勾选 "repo" 和 "workflow" 权限
[... 详细步骤]
```

## 🎯 使用场景

### 静态网站
- HTML/CSS/JS 项目
- 博客和文档站点
- 展示页面和落地页

### 单页应用 (SPA)
- React/Vue/Angular 应用
- 构建后的静态文件部署

### H5游戏和应用
- Canvas 游戏
- WebGL 应用
- 移动端H5项目

## 🔧 高级配置

### 构建命令配置
```javascript
build: {
  beforeBuild: ["npm run build"],     // 部署前执行
  afterBuild: ["npm run cleanup"],    // 部署后执行
  ignore: [                           // 忽略文件
    "node_modules/**",
    ".git/**", 
    "src/**"
  ]
}
```

### 自定义域名
```javascript
github: {
  customDomain: "yourdomain.com"
},
vercel: {
  alias: ["yourdomain.com", "www.yourdomain.com"]
}
```

### 环境变量
```javascript
vercel: {
  env: {
    NODE_ENV: "production",
    API_URL: "https://api.yourdomain.com"
  }
}
```

## 🚀 CI/CD 集成

### GitHub Actions
```yaml
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
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
        
      - name: Build project
        run: npm run build
        
      - name: Deploy
        run: npx universal-web-deployer all
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### GitLab CI
```yaml
deploy:
  stage: deploy
  image: node:18
  script:
    - npm install
    - npm run build
    - npx universal-web-deployer all
  variables:
    GITHUB_TOKEN: $GITHUB_TOKEN
    VERCEL_TOKEN: $VERCEL_TOKEN
  only:
    - main
```

## 📁 目录结构

```
your-project/
├── universal-deployer/         # 部署工具（如果项目内安装）
│   ├── lib/
│   │   ├── index.js           # 主部署逻辑
│   │   └── deployers/         # 平台部署器
│   │       ├── github.js      # GitHub Pages
│   │       └── vercel.js      # Vercel
│   ├── bin/
│   │   └── cli.js            # 命令行接口
│   ├── templates/            # 配置模板
│   └── README.md
├── web-deploy.config.js       # 部署配置文件
├── package.json
└── ... # 你的项目文件
```

## 🆕 扩展支持

工具采用模块化设计，可轻松扩展支持其他平台：

1. 在 `lib/deployers/` 目录创建新的部署器（如 `netlify.js`）
2. 在配置文件中添加平台配置
3. 实现部署接口：
   ```javascript
   module.exports = {
     deploy: async (config, rootDir) => {
       // 部署逻辑
       return { success: true, url: 'https://...' };
     }
   };
   ```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 更多信息

- [GitHub Pages 文档](https://docs.github.com/pages)
- [Vercel 文档](https://vercel.com/docs)
- [项目主页](https://github.com/username/universal-web-deployer)

---

**🎉 现在就开始部署你的第一个项目吧！**

```bash
npx universal-web-deployer --init
npx universal-web-deployer
```