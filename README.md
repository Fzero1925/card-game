# 🃏 Card Game Platform - 棋牌游戏平台 v2.1.0

一个基于 Vue 3 + TypeScript 的现代化棋牌游戏平台，现已支持21点和德州扑克两款经典游戏，提供完整的智能AI对战体验和沉浸式AI对话系统。

## 🎮 当前游戏

### 21点 (Blackjack)
- 经典的21点游戏规则，包含软17规则
- 智能的A牌计算（1点或11点自动选择最优）
- 支持要牌、停牌、加倍等操作
- 完整的庄家AI逻辑
- 实时的游戏状态和金额显示
- 多语言支持（中文/英文）

### 德州扑克 (Texas Hold'em) - 完整可玩 🎉
- ✅ **完整游戏体验**: 从翻牌前到摊牌的完整流程
- ✅ **智能AI对手**: 3种不同个性AI（保守型🛡️、激进型⚔️、数学型🧮）
- ✅ **AI对话系统**: 22种智能对话触发器，3种个性化聊天风格
- ✅ **专业游戏界面**: 真实扑克桌设计，完整操作控制
- ✅ **手牌评估系统**: 9种牌型识别和比較算法
- ✅ **实时游戏状态**: 底池、筹码、游戏阶段显示
- ✅ **响应式设计**: 完美适配桌面和移动设备
- ✅ **多语言支持**: 中英文界面切换
- ✅ **全面测试覆盖**: 84个单元测试全部通过

## ✨ 技术特性

- 🚀 **Vue 3** - 使用最新的组合式API
- 📝 **TypeScript** - 完整的类型安全
- 🏪 **Pinia** - 现代状态管理
- 🌍 **Vue I18n** - 国际化支持
- 🎨 **Sass** - 样式预处理器
- 🧪 **Vitest** - 单元测试框架
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎯 **TypeScript严格模式** - 类型安全保障

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm >= 7

### 本地开发
1. 克隆项目到本地：
   ```bash
   git clone https://github.com/Fzero1925/card-game.git
   cd card-game
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中访问 `http://localhost:5173`

### 构建和部署
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 代码格式化和检查
npm run lint
npm run format
```

### 在线体验
- Vercel: https://card-game.vercel.app

## 🎲 游戏规则 - 21点

### 基本规则
- **游戏目标**：使手牌点数尽可能接近21点，但不能超过21点
- **A牌规则**：可算作1点或11点（自动选择最优值）
- **面牌规则**：J、Q、K均为10点
- **数字牌**：按面值计算

### 游戏流程
1. 选择下注金额，点击"发牌"
2. 玩家和庄家各发2张牌，庄家第二张牌面朝下
3. 玩家选择操作：
   - **要牌 (Hit)**：再要一张牌
   - **停牌 (Stand)**：不再要牌
   - **加倍 (Double)**：双倍下注，只能再要一张牌
4. 玩家停牌后，庄家翻开底牌并按规则要牌
5. 比较点数，决定胜负

### 特殊规则
- **黑杰克 (Blackjack)**：前两张牌为A+10点牌，赔率1:1.5
- **爆牌 (Bust)**：超过21点立即输掉
- **庄家规则**：
  - 16点或以下必须要牌
  - **软17必须要牌**（A+6的组合）
  - 硬17或以上必须停牌

### 快捷键
- `Space` - 发牌
- `H` - 要牌
- `S` - 停牌  
- `D` - 加倍
- `N` - 新游戏
- `R` - 显示规则

## 📁 项目结构

```
card-game/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件
│   │   ├── images/        # 图片资源
│   │   ├── locales/       # 国际化文件
│   │   └── styles/        # 全局样式
│   ├── components/        # Vue组件
│   │   ├── blackjack/     # 21点游戏组件
│   │   ├── common/        # 通用组件
│   │   └── texas-holdem/  # 德州扑克组件
│   ├── composables/       # 组合式函数
│   │   ├── useCardDeck.ts # 牌堆管理
│   │   └── useGameRules.ts# 游戏规则
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia状态管理
│   │   ├── blackjack.ts   # 21点状态
│   │   └── texasHoldem.ts # 德州扑克状态
│   ├── types/             # TypeScript类型定义
│   │   └── game.ts        # 游戏类型(含德州扑克)
│   ├── utils/             # 工具函数
│   │   ├── ai/            # AI决策引擎
│   │   │   ├── pokerAI.ts    # 德州扑克AI算法
│   │   │   └── aiDialogue.ts # AI对话系统
│   │   └── poker/         # 德州扑克算法
│   │       └── handEvaluator.ts # 手牌评估器
│   ├── views/             # 页面组件
│   └── main.ts            # 应用入口
├── tests/                 # 测试文件
│   ├── useCardDeck.test.ts       # 牌堆测试
│   ├── useGameRules.test.ts      # 游戏规则测试
│   ├── pokerHandEvaluator.test.ts # 德州扑克算法测试
│   └── aiDialogue.test.ts        # AI对话系统测试
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
└── vitest.config.ts       # Vitest配置
```

## 🛠️ 技术栈

- **前端框架**：Vue 3 + TypeScript
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **国际化**：Vue I18n
- **构建工具**：Vite
- **测试框架**：Vitest + Vue Test Utils
- **代码规范**：ESLint + Prettier
- **样式**：Sass/SCSS
- **部署**：Vercel

## 🔮 未来计划

### 德州扑克游戏优化
- [x] ~~AI对话系统（根据游戏情况生成聊天内容）~~ ✅ **已完成**
- [ ] 游戏动画效果（发牌、筹码移动动画）
- [ ] 高级AI策略优化（结合真实数据训练）
- [ ] 游戏历史和统计数据
- [ ] 多种游戏变体（奥马哈、短牌德州等）

### 新游戏添加
- [ ] 斗地主游戏
- [ ] 中国麻将游戏
- [ ] 百家乐游戏

### 技术功能增强
- [ ] 多人在线对战模式
- [ ] 实时聊天系统
- [ ] 游戏录像回放功能

### 用户体验优化
- [ ] PWA支持（离线游戏、桌面应用）
- [ ] 动画效果和过渡优化
- [ ] 音效和背景音乐系统
- [ ] 多主题支持（深色模式、个性化配色）
- [ ] 更多辅助功能（游戏提示、策略建议）

## 🧪 测试

项目包含全面的单元测试，当前测试覆盖：

### 21点游戏测试
- **牌堆管理逻辑测试** (11个测试)
- **游戏规则测试** (29个测试)
- **A牌软硬转换测试**

### 德州扑克游戏测试
- **手牌评估算法测试** (29个测试)
- **9种牌型识别测试**
- **特殊情况处理测试**
- **AI决策引擎测试**
- **AI对话系统测试** (15个测试)

**总计84个测试用例，全部通过✅**

运行测试：
```bash
npm run test           # 运行测试
npm run test:coverage  # 生成覆盖率报告
```

## 🚀 部署

### Vercel (推荐)
1. 连接GitHub仓库到Vercel
2. 自动检测为Vue项目并部署
3. 每次推送自动重新部署

### 手动部署
```bash
npm run build
# 将 dist 文件夹部署到任意静态文件托管服务
```

## 🤝 贡献

欢迎提交Issues和Pull Requests！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 开发规范
- 使用TypeScript编写代码
- 遵循ESLint和Prettier配置
- 为新功能编写测试用例
- 保持良好的代码注释

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🎯 作者

**Fzero** - [GitHub](https://github.com/Fzero1925)

## 🙏 致谢

感谢所有为这个项目贡献代码和想法的朋友们！

---

**🎉 现在就开始游戏吧！祝你好运！**