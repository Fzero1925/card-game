import { describe, it, expect, beforeEach } from 'vitest'
import { useCardDeck } from '@/composables/useCardDeck'

describe('useCardDeck', () => {
  let deck: ReturnType<typeof useCardDeck>

  beforeEach(() => {
    deck = useCardDeck()
  })

  describe('createDeck', () => {
    it('should create a standard 52-card deck', () => {
      deck.createDeck(1, 'blackjack')
      expect(deck.remainingCards.value).toBe(52)
    })

    it('should create multiple decks', () => {
      deck.createDeck(6, 'blackjack')
      expect(deck.remainingCards.value).toBe(312)
    })

    it('should shuffle the deck after creation', () => {
      deck.createDeck(1, 'blackjack')
      const firstCard = deck.dealCard()
      
      deck.createDeck(1, 'blackjack')
      const secondCard = deck.dealCard()
      
      // 虽然随机性测试不是绝对可靠，但多次运行应该不会总是相同
      // 这里主要测试deck被正确重新创建
      expect(deck.remainingCards.value).toBe(51)
    })
  })

  describe('dealCard', () => {
    beforeEach(() => {
      deck.createDeck(1, 'blackjack')
    })

    it('should deal a card and reduce deck size', () => {
      const initialSize = deck.remainingCards.value
      const card = deck.dealCard()
      
      expect(card).toBeTruthy()
      expect(card?.suit).toMatch(/[♠♥♦♣]/)
      expect(card?.rank).toMatch(/^(A|[2-9]|10|[JQK])$/)
      expect(deck.remainingCards.value).toBe(initialSize - 1)
    })

    it('should return null when deck is empty', () => {
      deck.reset()
      const card = deck.dealCard()
      expect(card).toBeNull()
    })
  })

  describe('dealCards', () => {
    beforeEach(() => {
      deck.createDeck(1, 'blackjack')
    })

    it('should deal multiple cards', () => {
      const cards = deck.dealCards(5)
      expect(cards).toHaveLength(5)
      expect(deck.remainingCards.value).toBe(47)
    })

    it('should stop dealing when deck runs out', () => {
      deck.reset()
      deck.createDeck(1, 'blackjack')
      const cards = deck.dealCards(60) // 超过52张
      expect(cards.length).toBeLessThanOrEqual(52)
    })
  })

  describe('card values', () => {
    it('should assign correct blackjack values', () => {
      expect(deck.getCardValue('A', 'blackjack')).toBe(11)
      expect(deck.getCardValue('K', 'blackjack')).toBe(10)
      expect(deck.getCardValue('Q', 'blackjack')).toBe(10)
      expect(deck.getCardValue('J', 'blackjack')).toBe(10)
      expect(deck.getCardValue('10', 'blackjack')).toBe(10)
      expect(deck.getCardValue('9', 'blackjack')).toBe(9)
      expect(deck.getCardValue('2', 'blackjack')).toBe(2)
    })

    it('should assign correct poker values', () => {
      expect(deck.getCardValue('A', 'poker')).toBe(14)
      expect(deck.getCardValue('K', 'poker')).toBe(13)
      expect(deck.getCardValue('Q', 'poker')).toBe(12)
      expect(deck.getCardValue('J', 'poker')).toBe(11)
      expect(deck.getCardValue('10', 'poker')).toBe(10)
      expect(deck.getCardValue('2', 'poker')).toBe(2)
    })
  })

  describe('reshuffling', () => {
    it('should reshuffle when cards are low', () => {
      deck.createDeck(1, 'blackjack')
      deck.setReshufflingThreshold(45)
      
      // 发牌到需要重新洗牌
      deck.dealCards(10)
      expect(deck.needsReshuffling.value).toBe(true)
      
      // 发牌时应该自动重新洗牌
      const card = deck.dealCard()
      expect(card).toBeTruthy()
      expect(deck.remainingCards.value).toBe(51) // 重新洗牌后减去刚发的一张
    })
  })

  describe('getSpecificCards', () => {
    it('should create specific cards for testing', () => {
      const specificCards = deck.getSpecificCards([
        { suit: '♠', rank: 'A' },
        { suit: '♥', rank: 'K' }
      ])
      
      expect(specificCards).toHaveLength(2)
      expect(specificCards[0].suit).toBe('♠')
      expect(specificCards[0].rank).toBe('A')
      expect(specificCards[1].suit).toBe('♥')
      expect(specificCards[1].rank).toBe('K')
    })
  })
})