import type { Card } from '@/types/game'

export function useBlackjackRules() {
  // 计算21点手牌分数
  const calculateScore = (cards: Card[]): number => {
    let score = 0
    let aces = 0

    // 先计算所有牌的基础分数
    for (const card of cards) {
      score += card.value
      if (card.rank === 'A') {
        aces++
      }
    }

    // 处理A牌的软硬转换
    while (score > 21 && aces > 0) {
      score -= 10 // A从11变成1
      aces--
    }

    return score
  }

  // 是否爆牌
  const isBust = (cards: Card[]): boolean => {
    return calculateScore(cards) > 21
  }

  // 是否21点
  const isBlackjack = (cards: Card[]): boolean => {
    return cards.length === 2 && calculateScore(cards) === 21
  }

  // 是否软牌（包含被当作11的A）
  const isSoftHand = (cards: Card[]): boolean => {
    let score = 0
    let hasUsableAce = false

    for (const card of cards) {
      score += card.value
      if (card.rank === 'A') {
        hasUsableAce = true
      }
    }

    // 如果有A且分数超过21，检查是否还能用软A
    return hasUsableAce && score <= 21 && score >= 12
  }

  // 判断游戏结果
  const getGameResult = (
    playerCards: Card[],
    dealerCards: Card[]
  ): {
    result: 'win' | 'lose' | 'tie' | 'blackjack'
    message: string
    multiplier: number
  } => {
    const playerScore = calculateScore(playerCards)
    const dealerScore = calculateScore(dealerCards)
    const playerBlackjack = isBlackjack(playerCards)
    const dealerBlackjack = isBlackjack(dealerCards)

    // 玩家爆牌
    if (isBust(playerCards)) {
      return { result: 'lose', message: 'games.blackjack.messages.bust', multiplier: 0 }
    }

    // 玩家21点
    if (playerBlackjack) {
      if (dealerBlackjack) {
        return { result: 'tie', message: 'games.blackjack.messages.tie', multiplier: 1 }
      }
      return { result: 'blackjack', message: 'games.blackjack.messages.blackjack', multiplier: 2.5 }
    }

    // 庄家爆牌
    if (isBust(dealerCards)) {
      return { result: 'win', message: 'games.blackjack.messages.dealerBust', multiplier: 2 }
    }

    // 比较分数
    if (playerScore > dealerScore) {
      return { result: 'win', message: 'games.blackjack.messages.win', multiplier: 2 }
    } else if (playerScore < dealerScore) {
      return { result: 'lose', message: 'games.blackjack.messages.lose', multiplier: 0 }
    } else {
      return { result: 'tie', message: 'games.blackjack.messages.tie', multiplier: 1 }
    }
  }

  // 庄家是否应该要牌
  const shouldDealerHit = (dealerCards: Card[]): boolean => {
    const score = calculateScore(dealerCards)
    
    // 软17规则：庄家在软17时必须要牌
    if (score === 17 && isSoftHand(dealerCards)) {
      return true
    }
    
    return score < 17
  }

  // 是否可以加倍
  const canDouble = (playerCards: Card[], playerMoney: number, currentBet: number): boolean => {
    return playerCards.length === 2 && currentBet * 2 <= playerMoney
  }

  // 是否可以分牌（为将来扩展准备）
  const canSplit = (playerCards: Card[]): boolean => {
    return playerCards.length === 2 && playerCards[0].rank === playerCards[1].rank
  }

  // 验证下注金额
  const isValidBet = (betAmount: number, playerMoney: number): boolean => {
    return betAmount > 0 && betAmount <= playerMoney
  }

  return {
    calculateScore,
    isBust,
    isBlackjack,
    isSoftHand,
    getGameResult,
    shouldDealerHit,
    canDouble,
    canSplit,
    isValidBet
  }
}

export function usePokerRules() {
  // 德州扑克手牌评估
  const evaluateHand = async (cards: Card[]) => {
    const { evaluateHand } = await import('@/utils/poker/handEvaluator')
    return evaluateHand(cards)
  }

  // 比较两手牌的大小
  const compareHands = async (hand1: Card[], hand2: Card[]): Promise<number> => {
    const { compareHands } = await import('@/utils/poker/handEvaluator')
    return compareHands(hand1, hand2)
  }

  return {
    evaluateHand,
    compareHands
  }
}