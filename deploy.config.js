// 部署配置文件
module.exports = {
  "project": {
    "name": "card-game",
    "description": "card-game",
    "author": "Fzero1925",
    "version": "1.0.0"
  },
  "github": {
    "enabled": true,
    "username": "Fzero1925",
    "repository": "card-game",
    "branch": "gh-pages",
    "customDomain": "card-game",
    "message": "🚀 Deploy to GitHub Pages"
  },
  "vercel": {
    "enabled": true,
    "projectName": "card-game",
    "regions": [
      "hkg1",
      "sfo1"
    ],
    "alias": []
  },
  "build": {
    "beforeBuild": [],
    "afterBuild": [],
    "ignore": [
      "node_modules/**",
      ".git/**",
      ".DS_Store",
      "*.log",
      ".env*",
      "deploy.config.js",
      "web-deploy.config.js",
      "package*.json",
      "universal-deployer/**",
      "test-project/**",
      "scripts/**",
      "README.md",
      "AUTOMATION_GUIDE.md",
      "INTEGRATION_GUIDE.md",
      "deploy.bat"
    ]
  },
  "general": {
    "autoOpen": true,
    "showLogs": true,
    "backup": false,
    "confirm": true
  }
};