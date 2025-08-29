import { ref, computed } from 'vue'
import type { Card, Suit, Rank } from '@/types/game'

export function useCardDeck() {
  const deck = ref<Card[]>([])
  const numDecks = ref(1)
  const minCardsBeforeReshuffling = ref(20)

  // 所有花色
  const suits: Suit[] = ['♠', '♥', '♦', '♣']
  
  // 所有点数
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

  // 获取卡牌数值（用于21点计算）
  const getCardValue = (rank: Rank, gameType: 'blackjack' | 'poker' = 'blackjack'): number => {
    if (gameType === 'blackjack') {
      if (rank === 'A') return 11
      if (['J', 'Q', 'K'].includes(rank)) return 10
      return parseInt(rank)
    }
    
    // 德州扑克数值
    if (rank === 'A') return 14
    if (rank === 'K') return 13
    if (rank === 'Q') return 12
    if (rank === 'J') return 11
    return parseInt(rank)
  }

  // 创建一副完整的牌
  const createSingleDeck = (gameType: 'blackjack' | 'poker' = 'blackjack'): Card[] => {
    const singleDeck: Card[] = []
    
    for (const suit of suits) {
      for (const rank of ranks) {
        singleDeck.push({
          suit,
          rank,
          value: getCardValue(rank, gameType)
        })
      }
    }
    
    return singleDeck
  }

  // 创建多副牌
  const createDeck = (decks = 1, gameType: 'blackjack' | 'poker' = 'blackjack') => {
    numDecks.value = decks
    deck.value = []
    
    for (let i = 0; i < decks; i++) {
      deck.value.push(...createSingleDeck(gameType))
    }
    
    shuffleDeck()
  }

  // 洗牌算法（Fisher-Yates）
  const shuffleDeck = () => {
    for (let i = deck.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck.value[i], deck.value[j]] = [deck.value[j], deck.value[i]]
    }
  }

  // 发牌（内部版本，不自动重新洗牌）
  const dealCardInternal = (): Card | null => {
    return deck.value.pop() || null
  }

  // 发牌（对外版本，自动重新洗牌）
  const dealCard = (): Card | null => {
    // 如果牌堆为空，返回null
    if (deck.value.length === 0) {
      return null
    }
    
    // 如果牌数不足且不为0，重新洗牌
    if (needsReshuffling.value && deck.value.length > 0) {
      reshuffleDeck()
    }
    
    return dealCardInternal()
  }

  // 发多张牌（不自动重新洗牌，用于测试）
  const dealCards = (count: number): Card[] => {
    const cards: Card[] = []
    for (let i = 0; i < count; i++) {
      const card = dealCardInternal()
      if (card) {
        cards.push(card)
      } else {
        break
      }
    }
    return cards
  }

  // 重新洗牌
  const reshuffleDeck = () => {
    createDeck(numDecks.value)
  }

  // 是否需要重新洗牌
  const needsReshuffling = computed(() => {
    return deck.value.length < minCardsBeforeReshuffling.value
  })

  // 剩余牌数
  const remainingCards = computed(() => deck.value.length)

  // 牌堆是否为空
  const isEmpty = computed(() => deck.value.length === 0)

  // 重置牌堆
  const reset = () => {
    deck.value = []
  }

  // 设置最小重新洗牌阈值
  const setReshufflingThreshold = (threshold: number) => {
    minCardsBeforeReshuffling.value = threshold
  }

  // 获取特定的牌（用于测试）
  const getSpecificCards = (cardSpecs: Array<{ suit: Suit; rank: Rank }>): Card[] => {
    return cardSpecs.map(spec => ({
      suit: spec.suit,
      rank: spec.rank,
      value: getCardValue(spec.rank)
    }))
  }

  return {
    // 状态
    deck: computed(() => deck.value),
    remainingCards,
    isEmpty,
    needsReshuffling,
    numDecks: computed(() => numDecks.value),
    
    // 方法
    createDeck,
    shuffleDeck,
    dealCard,
    dealCards,
    reshuffleDeck,
    reset,
    setReshufflingThreshold,
    getCardValue,
    getSpecificCards
  }
}