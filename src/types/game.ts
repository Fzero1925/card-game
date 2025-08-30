// 卡牌花色
export type Suit = '♠' | '♥' | '♦' | '♣'

// 卡牌点数
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

// 卡牌接口
export interface Card {
  suit: Suit
  rank: Rank
  value: number // 用于计算的数值
}

// 玩家接口
export interface Player {
  id: string
  name: string
  chips: number
  cards: Card[]
  isActive: boolean
  isDealer?: boolean
}

// 游戏状态
export type GameStatus = 'waiting' | 'dealing' | 'playing' | 'finished'

// 21点游戏状态
export interface BlackjackState {
  status: GameStatus
  playerCards: Card[]
  dealerCards: Card[]
  playerMoney: number
  currentBet: number
  dealerHidden: boolean
  gameInProgress: boolean
}

// 21点游戏动作
export type BlackjackAction = 'hit' | 'stand' | 'double' | 'deal' | 'new-game'

// 德州扑克动作
export type PokerAction = 'fold' | 'call' | 'raise' | 'check' | 'all-in'

// 德州扑克手牌类型
export type HandRank = 
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-of-a-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-of-a-kind'
  | 'straight-flush'
  | 'royal-flush'

// 德州扑克手牌评估结果
export interface HandEvaluation {
  rank: HandRank
  score: number
  cards: Card[]
  description: string
}

// AI配置
export interface AIConfig {
  name: string
  personality: 'aggressive' | 'conservative' | 'bluffer' | 'mathematical'
  difficulty: 'beginner' | 'intermediate' | 'expert' | 'master'
  chattiness: number // 0-1, 说话频率
}

// 游戏消息
export interface GameMessage {
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: number
}

// 语言类型
export type Language = 'zh-CN' | 'en-US'

// === 德州扑克类型定义 ===

// 德州扑克游戏阶段
export type PokerGamePhase = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown'

// 德州扑克游戏状态
export type PokerGameStatus = 'waiting' | 'dealing' | 'betting' | 'showdown' | 'finished'

// 玩家位置
export type PokerPosition = 'small-blind' | 'big-blind' | 'dealer' | 'player'

// 德州扑克玩家状态
export interface PokerPlayer {
  id: string
  name: string
  chips: number
  holeCards: Card[] // 底牌(2张)
  currentBet: number // 当前下注
  totalBetInRound: number // 本轮总下注
  isActive: boolean // 是否还在牌局中
  isFolded: boolean // 是否已弃牌
  isAllIn: boolean // 是否全押
  position: PokerPosition
  isAI: boolean
  aiConfig?: AIConfig // AI配置
}

// 底池信息
export interface Pot {
  amount: number
  players: string[] // 有资格争夺此底池的玩家ID
  isMain: boolean // 是否为主底池
}

// 德州扑克游戏状态
export interface TexasHoldemState {
  status: PokerGameStatus
  phase: PokerGamePhase
  players: PokerPlayer[]
  communityCards: Card[] // 公共牌(最多5张)
  pots: Pot[] // 底池(可能有多个)
  currentPlayerIndex: number // 当前行动玩家索引
  dealerIndex: number // 庄家位置索引
  smallBlind: number
  bigBlind: number
  minRaise: number
  gameInProgress: boolean
  handNumber: number // 当前手牌局数
}

// 下注动作详情
export interface BettingAction {
  playerId: string
  action: PokerAction
  amount: number // 加注或跟注金额
  timestamp: number
}

// 手牌实力分析
export interface HandStrength {
  evaluation: HandEvaluation
  probability: number // 获胜概率
  outs: number // 改进牌数量
  recommendations: PokerAction[] // 建议动作
}

// AI决策信息
export interface AIDecision {
  action: PokerAction
  amount: number
  reasoning: string // AI决策理由(用于显示)
  confidence: number // 决策信心(0-1)
}

// 游戏统计
export interface GameStats {
  handsPlayed: number
  handsWon: number
  totalWinnings: number
  biggestPot: number
  favoriteHand: HandRank | null
}

// === AI对话系统类型定义 ===

// 对话触发器类型
export type DialogueTrigger = 
  | 'game-start'
  | 'hand-start'
  | 'pre-flop'
  | 'flop'
  | 'turn'
  | 'river'
  | 'showdown'
  | 'win-hand'
  | 'lose-hand'
  | 'fold'
  | 'call'
  | 'raise'
  | 'all-in'
  | 'bluff-caught'
  | 'good-hand'
  | 'bad-hand'
  | 'big-pot'
  | 'low-chips'
  | 'opponent-aggressive'
  | 'opponent-passive'
  | 'lucky-draw'
  | 'unlucky-draw'

// AI对话消息
export interface AIDialogueMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  trigger: DialogueTrigger
  timestamp: number
  personality: AIConfig['personality']
}

// 对话内容配置
export interface DialogueContent {
  trigger: DialogueTrigger
  messages: string[]
  conditions?: {
    minChattiness?: number // 最低聊天频率要求
    gamePhase?: PokerGamePhase[] // 适用的游戏阶段
    handStrength?: ('weak' | 'medium' | 'strong' | 'very_strong')[] // 适用的手牌强度
    potSize?: 'small' | 'medium' | 'large' // 底池大小要求
  }
}

// AI个性对话配置
export interface PersonalityDialogue {
  personality: AIConfig['personality']
  dialogues: DialogueContent[]
}

// 对话历史记录
export interface DialogueHistory {
  playerId: string
  lastMessageTime: number
  messageCount: number
  recentTriggers: DialogueTrigger[]
}