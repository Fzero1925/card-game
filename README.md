# 🚀 通用Web部署工具

一键部署静态网站到 GitHub Pages 和 Vercel 的自动化工具。

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

## 🚀 快速开始

### 🆕 独立部署工具

本项目已将部署功能提取为独立的可复用工具包！您可以：

#### 方法一：在当前项目中使用
```bash
# 使用本项目的部署工具
npm run deploy:init    # 初始化配置
npm run deploy         # 开始部署
```

#### 方法二：在其他项目中复用
```bash
# 复制部署工具到新项目
cp -r universal-deployer /path/to/your-new-project/

# 或者使用NPX
npx universal-web-deployer --init
npx universal-web-deployer
```

#### 方法三：全局安装（推荐）
```bash
# 全局安装（发布到NPM后）
npm install -g universal-web-deployer

# 在任意项目中使用
web-deploy --init
web-deploy
```

### 1. 传统安装和设置

```bash
# 进入项目目录
cd your-project

# 运行设置向导（首次使用）
npm run setup

# 或手动安装依赖
npm install
```

> **🆕 智能部署体验**：新版本包含智能错误处理系统，会自动检查环境配置，并在遇到问题时提供详细的解决指导！
> 
> **📦 独立工具包**：部署功能已提取为独立的 `universal-deployer` 工具包，可在任何项目中复用！

### 2. 配置部署

运行设置向导会自动创建 `deploy.config.js` 配置文件：

```javascript
module.exports = {
  project: {
    name: "my-awesome-app",
    description: "My awesome web application",
    author: "Your Name"
  },
  
  github: {
    enabled: true,
    username: "your-username",
    repository: "your-repo",
    branch: "gh-pages",
    customDomain: "your-domain.com" // 可选
  },
  
  vercel: {
    enabled: true,
    projectName: "my-awesome-app",
    regions: ["hkg1", "sfo1"],
    alias: ["your-domain.com"] // 可选
  }
}
```

### 3. 部署网站

```bash
# 交互式选择部署平台
npm run deploy

# 部署到 GitHub Pages
npm run deploy:github

# 部署到 Vercel  
npm run deploy:vercel

# 部署到所有平台
npm run deploy:all
```

## 🔑 认证设置

### GitHub Pages 认证

**方式一：环境变量（推荐）**
```bash
# 设置 GitHub Token
export GITHUB_TOKEN=ghp_your_token_here
```

**方式二：本地Git配置**
```bash
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

**获取GitHub Token：**
1. 访问 [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 选择 `repo` 权限
4. 复制生成的token

### Vercel 认证

**方式一：环境变量（推荐）**
```bash
export VERCEL_TOKEN=your_vercel_token_here
```

**方式二：本地登录**
```bash
vercel login
```

**获取Vercel Token：**
1. 访问 [Vercel Account Tokens](https://vercel.com/account/tokens)  
2. 点击 "Create"
3. 输入token名称
4. 复制生成的token

## 📁 文件结构

### 项目结构
```
blackJack/
├── universal-deployer/        # 🆕 独立部署工具包
│   ├── lib/
│   │   ├── index.js          # 主部署逻辑
│   │   └── deployers/        # 平台部署器
│   │       ├── github.js     # GitHub Pages
│   │       └── vercel.js     # Vercel
│   ├── bin/
│   │   └── cli.js           # 命令行接口
│   ├── install.js           # 安装脚本
│   ├── quick-install.sh     # Linux/Mac安装
│   ├── quick-install.bat    # Windows安装
│   ├── package.json         # NPM包配置
│   └── README.md            # 独立工具文档
├── deploy/                  # 原部署脚本（兼容性保留）
│   ├── deploy.js
│   ├── github.js
│   └── vercel.js
├── scripts/
│   └── setup.js
├── deploy.config.js         # 部署配置
├── package.json
└── ... # 项目文件
```

### 独立使用时的结构
```
your-new-project/
├── universal-deployer/      # 复制的部署工具
│   └── ... (同上)
├── web-deploy.config.js     # 新项目的部署配置
├── package.json
└── ... # 新项目文件
```

## ⚙️ 高级配置

### 构建命令

```javascript
module.exports = {
  build: {
    beforeBuild: ["npm run build"],     // 部署前执行
    afterBuild: ["npm run cleanup"],    // 部署后执行
    ignore: [                           // 忽略文件
      "node_modules/**",
      ".git/**", 
      "src/**"
    ]
  }
}
```

### 自定义域名

**GitHub Pages：**
```javascript
github: {
  customDomain: "yourdomain.com"
}
```

**Vercel：**  
```javascript
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

## 🛠️ 命令行选项

```bash
# 查看帮助
npm run help
node deploy/deploy.js --help

# 查看版本
node deploy/deploy.js --version

# 部署特定平台
node deploy/deploy.js github
node deploy/deploy.js vercel  
node deploy/deploy.js github vercel
```

## 🎨 使用场景

### 静态网站
- HTML/CSS/JS 项目
- 博客和文档站点
- 展示页面和落地页

### 单页应用 (SPA)
- React/Vue/Angular 应用
- 构建后的静态文件部署

### H5游戏
- Canvas 游戏
- WebGL 应用
- 移动端H5游戏

## 🔧 故障排除

### 🆕 智能错误处理系统

本工具现在包含增强的错误处理系统，能够自动诊断常见问题并提供详细的解决方案：

#### 自动环境检查
- ✅ **Git安装检查** - 自动检测Git是否安装和配置
- ✅ **仓库状态验证** - 检查Git仓库初始化和远程配置
- ✅ **认证状态检测** - 验证GitHub和Vercel认证配置
- ✅ **依赖工具检查** - 确认Node.js和必要CLI工具

#### 详细错误指导

**1. Git仓库问题**
```bash
# 系统自动检测到未初始化Git仓库时会提示：
⚠️ 当前目录不是Git仓库
Git仓库初始化解决方案:
  1. 初始化Git仓库: git init
  2. 添加文件: git add .
  3. 提交更改: git commit -m "Initial commit"
```

**2. GitHub认证失败**
```bash
# 系统检测到认证问题时会显示完整指导：
GitHub认证失败。请选择以下任一方法进行配置：

方法一：使用GitHub Token (推荐)
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Generate new token (classic)"
3. 勾选 "repo" 和 "workflow" 权限
4. 复制生成的token
5. 设置环境变量：
   Windows: set GITHUB_TOKEN=your_token_here
   Linux/Mac: export GITHUB_TOKEN=your_token_here

方法二：配置SSH密钥
1. 生成SSH密钥：ssh-keygen -t ed25519 -C "your_email@example.com"
2. 添加到SSH agent：ssh-add ~/.ssh/id_ed25519
3. 复制公钥内容：cat ~/.ssh/id_ed25519.pub
4. 访问 https://github.com/settings/ssh 添加SSH密钥
5. 测试连接：ssh -T git@github.com
```

**3. Vercel认证失败**
```bash
# 系统提供多种认证方案：
Vercel认证失败。请选择以下任一方法进行配置：

方法一：使用Vercel Token (推荐)
1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token" 创建新token
3. 输入token名称，设置过期时间
4. 复制生成的token
5. 设置环境变量：
   Windows: set VERCEL_TOKEN=your_token_here
   Linux/Mac: export VERCEL_TOKEN=your_token_here

方法二：使用Vercel CLI本地登录
1. 确保已安装Vercel CLI：npm install -g vercel
2. 运行登录命令：vercel login
3. 选择登录方式：GitHub/GitLab/Email
4. 验证登录状态：vercel whoami
```

#### 预部署验证
在执行部署前，系统会自动进行以下检查：
- 🔍 平台特定的预检查验证
- 📋 必要条件完整性检查  
- 🚨 潜在问题提前发现
- 💡 针对性解决方案推荐

#### 实时帮助提示
```bash
💡 错误解决建议:
GitHub认证问题解决方案:
1. 设置GitHub Token: https://github.com/settings/tokens
2. 或配置SSH密钥: https://github.com/settings/ssh
3. 参考文档: https://docs.github.com/en/authentication

📚 需要帮助？访问项目文档或提交issue获取支持。
```

### 传统故障排除方法

**部署文件不完整**
```bash
# 检查忽略配置
# 编辑 deploy.config.js 中的 build.ignore
```

### 日志调试

```javascript
general: {
  showLogs: true,    // 显示详细日志
  confirm: false     // 跳过确认提示（CI/CD）
}
```

## 🚀 CI/CD 集成

### GitHub Actions
```yaml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run deploy:all
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### 其他平台可扩展

工具采用模块化设计，可以轻松扩展支持其他部署平台：

1. 在 `deploy/` 目录创建新的部署器（如 `netlify.js`）
2. 在 `deploy.config.js` 中添加平台配置
3. 在主脚本中注册新平台

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**🎉 现在就开始部署你的第一个项目吧！**

```bash
npm run setup
npm run deploy
```