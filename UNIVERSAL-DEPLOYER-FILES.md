# 📦 Universal Web Deployer - 工具文件清单

这是一个完整的Universal Web Deployer工具文件清单，包含了所有必要文件以及在其他项目中复用的说明。

## 🗂️ 核心工具文件

### 主要目录结构
```
universal-deployer/
├── lib/                           # 核心逻辑目录
│   ├── index.js                  # 主部署逻辑（必需）
│   └── deployers/                # 平台部署器目录
│       ├── github.js             # GitHub Pages部署器（必需）
│       └── vercel.js             # Vercel部署器（必需）
├── bin/                          # 命令行工具目录
│   └── cli.js                    # 命令行接口（必需）
├── install.js                    # 安装脚本（可选）
├── quick-install.sh              # Linux/Mac安装脚本（可选）
├── quick-install.bat             # Windows安装脚本（可选）
├── package.json                  # NPM包配置（必需）
└── README.md                     # 工具文档（推荐）
```

## 📋 文件详细说明

### ✅ 必需文件 (7个)

#### 1. `universal-deployer/lib/index.js`
- **作用**: 主部署逻辑和智能错误处理系统
- **功能**: 
  - 环境检查和预检查验证
  - 部署流程管理
  - 智能错误诊断和自动修复
  - 用户交互和配置向导
- **文件大小**: ~30KB
- **依赖**: Node.js内置模块

#### 2. `universal-deployer/lib/deployers/github.js`
- **作用**: GitHub Pages部署器
- **功能**:
  - GitHub认证检查（Token/SSH）
  - 临时目录管理（已修复嵌套问题）
  - 文件准备和Git操作
  - GitHub Pages分支部署
- **文件大小**: ~12KB
- **重要**: 包含最新的.deploy-temp嵌套问题修复

#### 3. `universal-deployer/lib/deployers/vercel.js`
- **作用**: Vercel平台部署器
- **功能**:
  - Vercel CLI检查和安装
  - Token和本地认证支持
  - 项目配置生成
  - 自定义域名设置
- **文件大小**: ~11KB

#### 4. `universal-deployer/bin/cli.js`
- **作用**: 命令行接口入口
- **功能**:
  - 命令行参数解析
  - 帮助信息显示
  - 初始化配置创建
- **文件大小**: ~3KB

#### 5. `universal-deployer/package.json`
- **作用**: NPM包配置文件
- **内容**: 包信息、依赖关系、命令定义
- **文件大小**: ~1KB

#### 6. `deploy.config.js` 或 `web-deploy.config.js`
- **作用**: 部署配置文件（项目根目录）
- **功能**: 平台设置、构建配置、忽略文件等
- **位置**: 使用工具的项目根目录
- **文件大小**: ~2KB

#### 7. `universal-deployer/README.md`
- **作用**: 工具使用文档
- **内容**: 安装指南、使用方法、配置说明
- **文件大小**: ~15KB

### ⚡ 可选增强文件 (3个)

#### 8. `universal-deployer/install.js`
- **作用**: 智能安装脚本
- **功能**: 自动配置、依赖检查、向导引导
- **文件大小**: ~5KB

#### 9. `universal-deployer/quick-install.sh`
- **作用**: Linux/Mac一键安装脚本
- **功能**: 自动下载、解压、配置
- **文件大小**: ~2KB

#### 10. `universal-deployer/quick-install.bat`
- **作用**: Windows一键安装脚本
- **功能**: 自动下载、解压、配置
- **文件大小**: ~2KB

## 📊 文件统计

| 类型 | 文件数量 | 总大小 | 说明 |
|------|----------|--------|------|
| **必需文件** | 7个 | ~64KB | 完整功能所需 |
| **可选文件** | 3个 | ~9KB | 增强用户体验 |
| **总计** | 10个 | ~73KB | 完整工具包 |

## 🚀 在新项目中使用

### 方法一：完整复制（推荐）
```bash
# 复制整个universal-deployer目录到新项目
cp -r universal-deployer /path/to/your-new-project/

# 复制配置文件模板
cp deploy.config.js /path/to/your-new-project/web-deploy.config.js

# 在新项目的package.json中添加脚本
"scripts": {
  "deploy": "node universal-deployer/bin/cli.js",
  "deploy:init": "node universal-deployer/bin/cli.js --init",
  "deploy:github": "node universal-deployer/bin/cli.js github",
  "deploy:vercel": "node universal-deployer/bin/cli.js vercel",
  "deploy:all": "node universal-deployer/bin/cli.js all"
}
```

### 方法二：最小安装
仅复制必需的7个文件，总大小约64KB。

### 方法三：使用安装脚本
```bash
# Linux/Mac
curl -o quick-install.sh https://your-repo/quick-install.sh && bash quick-install.sh

# Windows  
curl -o quick-install.bat https://your-repo/quick-install.bat && quick-install.bat
```

## 🔧 配置文件模板

创建新项目时的`web-deploy.config.js`模板：

```javascript
// Universal Web Deployer 配置文件
module.exports = {
  project: {
    name: "your-project-name",
    description: "Your project description",
    author: "Your Name",
    version: "1.0.0"
  },
  github: {
    enabled: true,
    username: "your-github-username",
    repository: "your-repo-name", 
    branch: "gh-pages"
  },
  vercel: {
    enabled: true,
    projectName: "your-project-name"
  },
  build: {
    ignore: [
      "node_modules/**",
      ".git/**",
      "universal-deployer/**",
      "web-deploy.config.js",
      "*.log"
    ]
  },
  general: {
    autoOpen: true,
    showLogs: true,
    confirm: true
  }
};
```

## 📝 重要修复说明

### ⚠️ .deploy-temp嵌套问题修复
在本版本中，我们修复了关键的`.deploy-temp`无限嵌套问题：

**问题**: 之前版本在某些情况下会创建嵌套的`.deploy-temp`目录，导致路径过长错误。

**解决方案**: 
- 重构了`github.js`中的临时目录创建逻辑
- 添加了项目根目录智能查找功能
- 增强了临时目录清理机制
- 添加了路径嵌套检测和预防

**影响文件**: `universal-deployer/lib/deployers/github.js`

## ✅ 兼容性

- **Node.js**: >= 14.0.0
- **操作系统**: Windows、Linux、macOS
- **项目类型**: 静态网站、SPA应用、H5游戏
- **部署平台**: GitHub Pages、Vercel

## 📚 使用示例

部署到不同项目类型：

### React/Vue项目
```javascript
build: {
  beforeBuild: ["npm run build"],
  ignore: ["src/**", "public/**", "node_modules/**"]
}
```

### 静态HTML项目  
```javascript
build: {
  ignore: ["*.md", ".git/**", "node_modules/**"]
}
```

### H5游戏项目
```javascript
build: {
  ignore: ["assets/raw/**", ".git/**", "*.psd"]
}
```

---

**📦 这个工具包总大小约73KB，包含完整的双平台部署功能和智能错误处理系统，可以在任何静态网站项目中使用！**