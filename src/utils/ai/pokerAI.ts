import type { PokerPlayer, Card, PokerAction, AIConfig, PokerGamePhase } from '@/types/game'

// AI决策引擎接口
export interface AIDecision {
  action: PokerAction
  amount?: number
  reasoning: string
}

// 手牌强度评估
export interface HandStrength {
  score: number
  category: 'weak' | 'medium' | 'strong' | 'very_strong'
}

// 评估手牌强度
export function evaluateHandStrength(
  holeCards: Card[], 
  communityCards: Card[], 
  gamePhase: PokerGamePhase
): HandStrength {
  const allCards = [...holeCards, ...communityCards]
  
  // 基础评分系统
  let score = 0
  
  if (holeCards.length === 2) {
    const [card1, card2] = holeCards
    
    // 对子奖励
    if (card1.rank === card2.rank) {
      const rankValue = getRankValue(card1.rank)
      score += 50 + rankValue * 2 // 对子基础分+牌面大小
    }
    
    // 同花奖励
    if (card1.suit === card2.suit) {
      score += 10
    }
    
    // 连牌奖励
    const rank1 = getRankValue(card1.rank)
    const rank2 = getRankValue(card2.rank)
    if (Math.abs(rank1 - rank2) <= 1) {
      score += 8
    }
    
    // 高牌奖励
    score += Math.max(rank1, rank2)
    
    // 特殊组合奖励
    if ((card1.rank === 'A' && card2.rank === 'K') || 
        (card1.rank === 'K' && card2.rank === 'A')) {
      score += 20 // AK
    }
  }
  
  // 根据公共牌调整评分
  if (communityCards.length >= 3 && allCards.length >= 5) {
    // 这里可以调用handEvaluator来获取更精确的牌力评估
    // 为简化，使用基础逻辑
    const evaluation = evaluatePokerHand(allCards)
    score = evaluation.score
  }
  
  // 分类手牌强度
  let category: HandStrength['category']
  if (score >= 80) category = 'very_strong'
  else if (score >= 50) category = 'strong'
  else if (score >= 25) category = 'medium'
  else category = 'weak'
  
  return { score, category }
}

// 获取牌面数值
function getRankValue(rank: string): number {
  const values: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  }
  return values[rank] || 0
}

// 简化的牌力评估（实际应该使用handEvaluator）
function evaluatePokerHand(cards: Card[]): { score: number } {
  // 暂时使用简化评分系统，后续可优化
  let score = 0
  const ranks = cards.map(c => c.rank)
  const suits = cards.map(c => c.suit)
  
  // 检查对子、三条、四条
  const rankCounts: Record<string, number> = {}
  ranks.forEach(rank => {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1
  })
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a)
  
  if (counts[0] === 4) score += 700 // 四条
  else if (counts[0] === 3 && counts[1] === 2) score += 600 // 葡芦
  else if (counts[0] === 3) score += 300 // 三条
  else if (counts[0] === 2 && counts[1] === 2) score += 200 // 两对
  else if (counts[0] === 2) score += 100 // 一对
  
  // 检查同花
  const suitCounts: Record<string, number> = {}
  suits.forEach(suit => {
    suitCounts[suit] = (suitCounts[suit] || 0) + 1
  })
  
  const maxSuitCount = Math.max(...Object.values(suitCounts))
  if (maxSuitCount >= 5) score += 500 // 同花
  
  // 添加高牌分数
  score += Math.max(...ranks.map(getRankValue))
  
  return { score: Math.min(score, 999) }
}

// 保守型AI决策逻辑
export function getConservativeAIDecision(
  player: PokerPlayer,
  gameState: {
    currentBet: number
    minRaise: number
    gamePhase: PokerGamePhase
    communityCards: Card[]
    potSize: number
  }
): AIDecision {
  const handStrength = evaluateHandStrength(
    player.holeCards, 
    gameState.communityCards, 
    gameState.gamePhase
  )
  
  const callAmount = gameState.currentBet - player.totalBetInRound
  const potOdds = callAmount / (gameState.potSize + callAmount)
  
  // 保守型AI只在有好牌时行动
  if (handStrength.category === 'very_strong') {
    // 非常强的牌，小幅加注
    const raiseAmount = gameState.currentBet + gameState.minRaise
    if (player.chips >= raiseAmount - player.totalBetInRound) {
      return {
        action: 'raise',
        amount: raiseAmount,
        reasoning: '手牌很强，小幅加注'
      }
    }
  }
  
  if (handStrength.category === 'strong') {
    // 强牌，跟注
    if (callAmount <= player.chips) {
      return {
        action: 'call',
        reasoning: '手牌较强，跟注'
      }
    }
  }
  
  if (handStrength.category === 'medium' && potOdds < 0.3) {
    // 中等牌且赔率合适时跟注
    if (callAmount <= player.chips && callAmount === 0) {
      return {
        action: 'check',
        reasoning: '中等手牌，过牌观察'
      }
    }
    if (callAmount <= player.chips && callAmount <= player.chips * 0.1) {
      return {
        action: 'call',
        reasoning: '中等手牌，小额跟注'
      }
    }
  }
  
  // 默认弃牌
  return {
    action: 'fold',
    reasoning: '手牌较弱，保守弃牌'
  }
}

// 激进型AI决策逻辑
export function getAggressiveAIDecision(
  player: PokerPlayer,
  gameState: {
    currentBet: number
    minRaise: number
    gamePhase: PokerGamePhase
    communityCards: Card[]
    potSize: number
  }
): AIDecision {
  const handStrength = evaluateHandStrength(
    player.holeCards, 
    gameState.communityCards, 
    gameState.gamePhase
  )
  
  const callAmount = gameState.currentBet - player.totalBetInRound
  
  // 激进型AI更容易加注和虚张声势
  if (handStrength.category === 'very_strong') {
    // 大幅加注或全押
    const raiseAmount = Math.min(
      gameState.currentBet + gameState.minRaise * 3,
      player.chips + player.totalBetInRound
    )
    return {
      action: 'raise',
      amount: raiseAmount,
      reasoning: '极强手牌，大幅加注施压'
    }
  }
  
  if (handStrength.category === 'strong') {
    // 中等加注
    const raiseAmount = gameState.currentBet + gameState.minRaise * 2
    if (player.chips >= raiseAmount - player.totalBetInRound) {
      return {
        action: 'raise',
        amount: raiseAmount,
        reasoning: '强牌加注，建立优势'
      }
    }
    return {
      action: 'call',
      reasoning: '强牌跟注'
    }
  }
  
  if (handStrength.category === 'medium') {
    // 30%概率虚张声势
    if (Math.random() < 0.3) {
      const bluffRaise = gameState.currentBet + gameState.minRaise
      if (player.chips >= bluffRaise - player.totalBetInRound) {
        return {
          action: 'raise',
          amount: bluffRaise,
          reasoning: '中等牌虚张声势'
        }
      }
    }
    
    if (callAmount <= player.chips) {
      return {
        action: callAmount === 0 ? 'check' : 'call',
        reasoning: '中等牌跟注观察'
      }
    }
  }
  
  // 即使是弱牌也可能虚张声势（15%概率）
  if (handStrength.category === 'weak' && Math.random() < 0.15) {
    const bluffRaise = gameState.currentBet + gameState.minRaise
    if (player.chips >= bluffRaise - player.totalBetInRound) {
      return {
        action: 'raise',
        amount: bluffRaise,
        reasoning: '弱牌虚张声势，尝试偷锅'
      }
    }
  }
  
  return {
    action: 'fold',
    reasoning: '手牌不够强，弃牌'
  }
}

// 数学型AI决策逻辑
export function getMathematicalAIDecision(
  player: PokerPlayer,
  gameState: {
    currentBet: number
    minRaise: number
    gamePhase: PokerGamePhase
    communityCards: Card[]
    potSize: number
  }
): AIDecision {
  const handStrength = evaluateHandStrength(
    player.holeCards, 
    gameState.communityCards, 
    gameState.gamePhase
  )
  
  const callAmount = gameState.currentBet - player.totalBetInRound
  const potOdds = callAmount / (gameState.potSize + callAmount)
  const handOdds = getHandOdds(handStrength.score)
  
  // 基于数学期望的决策
  if (handStrength.category === 'very_strong') {
    // 计算最优加注额
    const optimalRaise = calculateOptimalRaise(
      gameState.potSize, 
      handStrength.score, 
      player.chips
    )
    return {
      action: 'raise',
      amount: Math.min(optimalRaise, player.chips + player.totalBetInRound),
      reasoning: `数学期望为正，最优加注${optimalRaise}`
    }
  }
  
  if (handStrength.category === 'strong' || handOdds > potOdds) {
    // 手牌赔率大于底池赔率，有利可图
    if (handStrength.score >= 60) {
      const valueRaise = gameState.currentBet + Math.floor(gameState.minRaise * 1.5)
      if (player.chips >= valueRaise - player.totalBetInRound) {
        return {
          action: 'raise',
          amount: valueRaise,
          reasoning: `赔率有利(${handOdds.toFixed(2)} > ${potOdds.toFixed(2)})，价值加注`
        }
      }
    }
    
    return {
      action: 'call',
      reasoning: `赔率有利，跟注获取价值`
    }
  }
  
  if (handStrength.category === 'medium' && handOdds * 1.2 > potOdds) {
    // 有一定安全边际的跟注
    if (callAmount <= player.chips) {
      return {
        action: callAmount === 0 ? 'check' : 'call',
        reasoning: `边际赔率可接受，谨慎跟注`
      }
    }
  }
  
  return {
    action: 'fold',
    reasoning: `数学期望为负(${handOdds.toFixed(2)} < ${potOdds.toFixed(2)})，理性弃牌`
  }
}

// 计算手牌赔率（简化版）
function getHandOdds(handScore: number): number {
  // 将手牌评分转换为获胜概率
  return Math.min(handScore / 100, 0.95)
}

// 计算最优加注额（简化版）
function calculateOptimalRaise(potSize: number, handScore: number, availableChips: number): number {
  const baseBet = potSize * 0.6 // 基础加注为底池的60%
  const strengthMultiplier = handScore / 50 // 根据手牌强度调整
  return Math.min(baseBet * strengthMultiplier, availableChips)
}

// 主AI决策函数
export function getAIDecision(
  player: PokerPlayer,
  gameState: {
    currentBet: number
    minRaise: number
    gamePhase: PokerGamePhase
    communityCards: Card[]
    potSize: number
  }
): AIDecision {
  if (!player.aiConfig) {
    throw new Error('AI配置不存在')
  }
  
  const { personality } = player.aiConfig
  
  switch (personality) {
    case 'conservative':
      return getConservativeAIDecision(player, gameState)
    case 'aggressive':
      return getAggressiveAIDecision(player, gameState)
    case 'mathematical':
      return getMathematicalAIDecision(player, gameState)
    default:
      return getConservativeAIDecision(player, gameState)
  }
}