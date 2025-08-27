# 🃏 Card Game - 棋牌游戏平台

一个基于Web的棋牌游戏平台，目前支持21点游戏，后续将陆续添加更多经典棋牌游戏。

## 🎮 当前游戏

### 21点 (Blackjack)
- 经典的21点游戏规则
- 智能的A牌计算（1点或11点自动选择最优）
- 支持要牌、停牌、加倍等操作
- 完整的庄家AI逻辑
- 实时的游戏状态和金额显示

## ✨ 游戏特性

- 🎯 **纯JavaScript实现** - 无需任何框架，轻量高效
- 🎨 **响应式设计** - 完美适配桌面和移动设备
- 🎲 **真实游戏体验** - 遵循标准赌场规则
- 💰 **虚拟货币系统** - 安全的游戏金额管理
- 📱 **移动优化** - 触屏友好的操作界面

## 🚀 快速开始

### 本地运行
1. 克隆项目到本地：
   ```bash
   git clone https://github.com/Fzero1925/card-game.git
   cd card-game
   ```

2. 使用任意HTTP服务器运行：
   ```bash
   # 使用Python (推荐)
   python -m http.server 8000
   
   # 或使用Node.js
   npx http-server
   
   # 或使用PHP
   php -S localhost:8000
   ```

3. 在浏览器中访问 `http://localhost:8000`

### 在线体验
- GitHub Pages: https://fzero1925.github.io/card-game
- Vercel: https://card-game.vercel.app

## 🎲 游戏规则 - 21点

### 基本规则
- 游戏目标：使手牌点数尽可能接近21点，但不能超过21点
- A可算作1点或11点（自动选择最优）
- J、Q、K均为10点
- 数字牌按面值计算

### 游戏流程
1. 选择下注金额，点击"发牌"
2. 玩家和庄家各发2张牌，庄家一张牌面朝下
3. 玩家选择操作：
   - **要牌**：再要一张牌
   - **停牌**：不再要牌
   - **加倍**：双倍下注，只能再要一张牌
4. 玩家停牌后，庄家翻开底牌并按规则要牌
5. 比较点数，决定胜负

### 特殊情况
- **黑杰克**：前两张牌为A+10点牌，赔率1:1.5
- **爆牌**：超过21点立即输掉
- **庄家规则**：16点或以下必须要牌，17点或以上必须停牌

## 📁 项目结构

```
card-game/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 游戏逻辑
├── vercel.json         # Vercel部署配置
├── deploy.config.js    # 部署配置
└── README.md           # 项目说明
```

## 🛠️ 技术栈

- **前端**：HTML5、CSS3、原生JavaScript
- **部署**：GitHub Pages、Vercel

## 🔮 未来计划

- [ ] 添加德州扑克游戏
- [ ] 添加斗地主游戏  
- [ ] 添加麻将游戏
- [ ] 增加多人在线模式
- [ ] 添加游戏历史记录
- [ ] 增加更多游戏动效
- [ ] 支持自定义主题

## 🚀 部署

本项目可部署到多个平台：

### GitHub Pages
直接推送到gh-pages分支或使用GitHub Actions自动部署。

### Vercel
连接GitHub仓库，自动检测并部署静态文件。

## 🤝 贡献

欢迎提交Issues和Pull Requests！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🎯 作者

**Fzero** - [GitHub](https://github.com/Fzero1925)

## 🙏 致谢

感谢所有为这个项目贡献代码和想法的朋友们！

---

**🎉 现在就开始游戏吧！祝你好运！**