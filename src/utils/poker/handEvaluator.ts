import type { Card, HandRank, HandEvaluation } from '@/types/game'

/**
 * 德州扑克手牌评估器
 * 支持7张牌中选择最佳5张牌组合评估
 */

// 牌型权重，用于比较不同牌型的大小
const HAND_RANK_WEIGHTS: Record<HandRank, number> = {
  'high-card': 1,
  'pair': 2,
  'two-pair': 3,
  'three-of-a-kind': 4,
  'straight': 5,
  'flush': 6,
  'full-house': 7,
  'four-of-a-kind': 8,
  'straight-flush': 9,
  'royal-flush': 10
}

// 牌型中文名称映射
const HAND_RANK_NAMES: Record<HandRank, string> = {
  'high-card': '高牌',
  'pair': '一对',
  'two-pair': '两对',
  'three-of-a-kind': '三条',
  'straight': '顺子',
  'flush': '同花',
  'full-house': '满堂红',
  'four-of-a-kind': '四条',
  'straight-flush': '同花顺',
  'royal-flush': '皇家同花顺'
}

/**
 * 获取牌的数值（德州扑克规则）
 * A=14, K=13, Q=12, J=11, 10=10...2=2
 */
function getCardValue(rank: string): number {
  switch (rank) {
    case 'A': return 14
    case 'K': return 13
    case 'Q': return 12
    case 'J': return 11
    default: return parseInt(rank)
  }
}

/**
 * 按数值排序卡牌（从大到小）
 */
function sortCardsByValue(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank))
}

/**
 * 统计每种点数的数量
 */
function countRanks(cards: Card[]): Map<string, Card[]> {
  const rankMap = new Map<string, Card[]>()
  
  for (const card of cards) {
    if (!rankMap.has(card.rank)) {
      rankMap.set(card.rank, [])
    }
    rankMap.get(card.rank)!.push(card)
  }
  
  return rankMap
}

/**
 * 统计每种花色的数量
 */
function countSuits(cards: Card[]): Map<string, Card[]> {
  const suitMap = new Map<string, Card[]>()
  
  for (const card of cards) {
    if (!suitMap.has(card.suit)) {
      suitMap.set(card.suit, [])
    }
    suitMap.get(card.suit)!.push(card)
  }
  
  return suitMap
}

/**
 * 检查是否为顺子
 */
function isStraight(cards: Card[]): Card[] | null {
  if (cards.length < 5) return null
  
  const sortedCards = sortCardsByValue(cards)
  const values = sortedCards.map(card => getCardValue(card.rank))
  
  // 去重并排序
  const uniqueValues = [...new Set(values)].sort((a, b) => b - a)
  
  // 检查连续的5张牌
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    let consecutive = true
    for (let j = 1; j < 5; j++) {
      if (uniqueValues[i] - uniqueValues[i + j] !== j) {
        consecutive = false
        break
      }
    }
    
    if (consecutive) {
      // 找到对应的5张牌
      const straightCards: Card[] = []
      for (let j = 0; j < 5; j++) {
        const targetValue = uniqueValues[i + j]
        const card = sortedCards.find(c => getCardValue(c.rank) === targetValue)
        if (card) straightCards.push(card)
      }
      return straightCards
    }
  }
  
  // 检查A-2-3-4-5（轮子顺）
  const wheelValues = [14, 5, 4, 3, 2] // A, 5, 4, 3, 2
  if (wheelValues.every(val => uniqueValues.includes(val))) {
    const wheelCards: Card[] = []
    for (const targetValue of wheelValues) {
      const card = sortedCards.find(c => getCardValue(c.rank) === targetValue)
      if (card) wheelCards.push(card)
    }
    return wheelCards
  }
  
  return null
}

/**
 * 检查是否为同花
 */
function isFlush(cards: Card[]): Card[] | null {
  const suitMap = countSuits(cards)
  
  for (const [suit, suitCards] of suitMap) {
    if (suitCards.length >= 5) {
      // 返回该花色最大的5张牌
      const sortedSuitCards = sortCardsByValue(suitCards)
      return sortedSuitCards.slice(0, 5)
    }
  }
  
  return null
}

/**
 * 检查是否为同花顺
 */
function isStraightFlush(cards: Card[]): Card[] | null {
  const suitMap = countSuits(cards)
  
  for (const [suit, suitCards] of suitMap) {
    if (suitCards.length >= 5) {
      const straightCards = isStraight(suitCards)
      if (straightCards) {
        return straightCards
      }
    }
  }
  
  return null
}

/**
 * 检查是否为皇家同花顺
 */
function isRoyalFlush(cards: Card[]): Card[] | null {
  const straightFlushCards = isStraightFlush(cards)
  if (straightFlushCards) {
    const highCard = straightFlushCards[0]
    if (getCardValue(highCard.rank) === 14) { // A高的同花顺
      const values = straightFlushCards.map(c => getCardValue(c.rank))
      if (values.includes(14) && values.includes(13) && values.includes(12) && 
          values.includes(11) && values.includes(10)) {
        return straightFlushCards
      }
    }
  }
  return null
}

/**
 * 评估最佳5张牌组合
 */
export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length < 5) {
    throw new Error('至少需要5张牌进行评估')
  }
  
  // 按优先级检查牌型
  
  // 1. 皇家同花顺
  const royalFlushCards = isRoyalFlush(cards)
  if (royalFlushCards) {
    return {
      rank: 'royal-flush',
      score: HAND_RANK_WEIGHTS['royal-flush'] * 1000000,
      cards: royalFlushCards,
      description: HAND_RANK_NAMES['royal-flush']
    }
  }
  
  // 2. 同花顺
  const straightFlushCards = isStraightFlush(cards)
  if (straightFlushCards) {
    const highCard = getCardValue(straightFlushCards[0].rank)
    return {
      rank: 'straight-flush',
      score: HAND_RANK_WEIGHTS['straight-flush'] * 1000000 + highCard * 1000,
      cards: straightFlushCards,
      description: HAND_RANK_NAMES['straight-flush']
    }
  }
  
  // 3. 四条
  const rankMap = countRanks(cards)
  const rankCounts = Array.from(rankMap.entries())
    .map(([rank, cards]) => ({ rank, count: cards.length, cards }))
    .sort((a, b) => b.count - a.count || getCardValue(b.rank) - getCardValue(a.rank))
  
  if (rankCounts[0].count === 4) {
    const fourOfAKind = rankCounts[0]
    const kicker = rankCounts[1]
    const resultCards = [...fourOfAKind.cards, kicker.cards[0]]
    
    return {
      rank: 'four-of-a-kind',
      score: HAND_RANK_WEIGHTS['four-of-a-kind'] * 1000000 + 
             getCardValue(fourOfAKind.rank) * 1000 + 
             getCardValue(kicker.rank),
      cards: resultCards,
      description: HAND_RANK_NAMES['four-of-a-kind']
    }
  }
  
  // 4. 满堂红
  if (rankCounts[0].count === 3 && rankCounts[1].count >= 2) {
    const threeOfAKind = rankCounts[0]
    const pair = rankCounts[1]
    const resultCards = [...threeOfAKind.cards, ...pair.cards.slice(0, 2)]
    
    return {
      rank: 'full-house',
      score: HAND_RANK_WEIGHTS['full-house'] * 1000000 + 
             getCardValue(threeOfAKind.rank) * 1000 + 
             getCardValue(pair.rank),
      cards: resultCards,
      description: HAND_RANK_NAMES['full-house']
    }
  }
  
  // 5. 同花
  const flushCards = isFlush(cards)
  if (flushCards) {
    const values = flushCards.map(c => getCardValue(c.rank))
    let score = HAND_RANK_WEIGHTS['flush'] * 1000000
    values.forEach((value, index) => {
      score += value * Math.pow(100, 4 - index)
    })
    
    return {
      rank: 'flush',
      score,
      cards: flushCards,
      description: HAND_RANK_NAMES['flush']
    }
  }
  
  // 6. 顺子
  const straightCards = isStraight(cards)
  if (straightCards) {
    const highCard = getCardValue(straightCards[0].rank)
    return {
      rank: 'straight',
      score: HAND_RANK_WEIGHTS['straight'] * 1000000 + highCard * 1000,
      cards: straightCards,
      description: HAND_RANK_NAMES['straight']
    }
  }
  
  // 7. 三条
  if (rankCounts[0].count === 3) {
    const threeOfAKind = rankCounts[0]
    const kickers = rankCounts.slice(1, 3)
    const resultCards = [...threeOfAKind.cards, ...kickers.flatMap(k => k.cards.slice(0, 1))]
    
    let score = HAND_RANK_WEIGHTS['three-of-a-kind'] * 1000000 + 
                getCardValue(threeOfAKind.rank) * 10000
    kickers.forEach((kicker, index) => {
      score += getCardValue(kicker.rank) * Math.pow(100, 1 - index)
    })
    
    return {
      rank: 'three-of-a-kind',
      score,
      cards: resultCards,
      description: HAND_RANK_NAMES['three-of-a-kind']
    }
  }
  
  // 8. 两对
  if (rankCounts[0].count === 2 && rankCounts[1].count === 2) {
    const highPair = rankCounts[0]
    const lowPair = rankCounts[1]
    const kicker = rankCounts[2]
    const resultCards = [...highPair.cards, ...lowPair.cards, kicker.cards[0]]
    
    return {
      rank: 'two-pair',
      score: HAND_RANK_WEIGHTS['two-pair'] * 1000000 + 
             getCardValue(highPair.rank) * 10000 + 
             getCardValue(lowPair.rank) * 100 + 
             getCardValue(kicker.rank),
      cards: resultCards,
      description: HAND_RANK_NAMES['two-pair']
    }
  }
  
  // 9. 一对
  if (rankCounts[0].count === 2) {
    const pair = rankCounts[0]
    const kickers = rankCounts.slice(1, 4)
    const resultCards = [...pair.cards, ...kickers.flatMap(k => k.cards.slice(0, 1))]
    
    let score = HAND_RANK_WEIGHTS['pair'] * 1000000 + 
                getCardValue(pair.rank) * 100000
    kickers.forEach((kicker, index) => {
      score += getCardValue(kicker.rank) * Math.pow(100, 2 - index)
    })
    
    return {
      rank: 'pair',
      score,
      cards: resultCards,
      description: HAND_RANK_NAMES['pair']
    }
  }
  
  // 10. 高牌
  const sortedCards = sortCardsByValue(cards)
  const highCards = sortedCards.slice(0, 5)
  
  let score = HAND_RANK_WEIGHTS['high-card'] * 1000000
  highCards.forEach((card, index) => {
    score += getCardValue(card.rank) * Math.pow(100, 4 - index)
  })
  
  return {
    rank: 'high-card',
    score,
    cards: highCards,
    description: HAND_RANK_NAMES['high-card']
  }
}

/**
 * 比较两手牌的大小
 * 返回: 1 = hand1胜, -1 = hand2胜, 0 = 平手
 */
export function compareHands(hand1: Card[], hand2: Card[]): number {
  const eval1 = evaluateHand(hand1)
  const eval2 = evaluateHand(hand2)
  
  if (eval1.score > eval2.score) return 1
  if (eval1.score < eval2.score) return -1
  return 0
}

/**
 * 获取牌型权重（用于AI决策）
 */
export function getHandRankWeight(rank: HandRank): number {
  return HAND_RANK_WEIGHTS[rank]
}