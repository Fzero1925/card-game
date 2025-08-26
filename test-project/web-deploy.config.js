// Universal Web Deployer 配置文件
module.exports = {
  project: {
    name: "test-project",
    description: "Test project for Universal Web Deployer",
    author: "Test Author",
    version: "1.0.0"
  },
  
  github: {
    enabled: true,
    username: "testuser",
    repository: "test-project",
    branch: "gh-pages"
  },
  
  vercel: {
    enabled: true,
    projectName: "test-project",
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
    autoOpen: false,  // 测试时不自动打开浏览器
    showLogs: true,
    confirm: false    // 测试时不需要确认
  }
};