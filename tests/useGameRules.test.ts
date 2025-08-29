import { describe, it, expect } from 'vitest'
import { useBlackjackRules } from '@/composables/useGameRules'
import type { Card } from '@/types/game'

describe('useBlackjackRules', () => {
  const rules = useBlackjackRules()

  // 辅助函数：创建测试卡牌
  const createCard = (suit: '♠' | '♥' | '♦' | '♣', rank: string, value: number): Card => ({
    suit,
    rank: rank as any,
    value
  })

  describe('calculateScore', () => {
    it('should calculate basic card scores', () => {
      const cards = [
        createCard('♠', '5', 5),
        createCard('♥', '7', 7)
      ]
      expect(rules.calculateScore(cards)).toBe(12)
    })

    it('should handle face cards correctly', () => {
      const cards = [
        createCard('♠', 'K', 10),
        createCard('♥', 'Q', 10),
        createCard('♦', 'J', 10)
      ]
      expect(rules.calculateScore(cards)).toBe(30)
    })

    it('should handle Ace as 11 when possible', () => {
      const cards = [
        createCard('♠', 'A', 11),
        createCard('♥', '5', 5)
      ]
      expect(rules.calculateScore(cards)).toBe(16)
    })

    it('should convert Ace from 11 to 1 when busting', () => {
      const cards = [
        createCard('♠', 'A', 11),
        createCard('♥', '6', 6),
        createCard('♦', '8', 8)
      ]
      expect(rules.calculateScore(cards)).toBe(15) // A=1, 6, 8
    })

    it('should handle multiple Aces correctly', () => {
      const cards = [
        createCard('♠', 'A', 11),
        createCard('♥', 'A', 11),
        createCard('♦', '9', 9)
      ]
      expect(rules.calculateScore(cards)).toBe(21) // A=11, A=1, 9
    })

    it('should handle multiple Aces when both need to be 1', () => {
      const cards = [
        createCard('♠', 'A', 11),
        createCard('♥', 'A', 11),
        createCard('♦', '5', 5),
        createCard('♣', '5', 5)
      ]
      expect(rules.calculateScore(cards)).toBe(12) // A=1, A=1, 5, 5
    })

    it('should handle single Ace correctly (for dealer visible score)', () => {
      // 测试单张A牌的计算，这是修复visibleDealerScore问题的关键场景
      const singleAce = [createCard('♠', 'A', 11)]
      expect(rules.calculateScore(singleAce)).toBe(11) // 单张A应该是11
    })

    it('should handle single Ace with context requiring soft conversion', () => {
      // 虽然单张A牌本身是11，但这个测试确保我们的逻辑在各种情况下都正确
      const aceWithLowCard = [createCard('♠', 'A', 11), createCard('♥', '5', 5)]
      expect(rules.calculateScore(aceWithLowCard)).toBe(16) // A=11, 5
      
      // 测试需要转换的情况
      const aceNeedsConversion = [createCard('♠', 'A', 11), createCard('♥', '6', 6), createCard('♦', '8', 8)]
      expect(rules.calculateScore(aceNeedsConversion)).toBe(15) // A=1, 6, 8
    })

    it('should handle edge cases correctly', () => {
      // 测试空数组
      expect(rules.calculateScore([])).toBe(0)
    })
  })

  describe('isBust', () => {
    it('should return true when score > 21', () => {
      const cards = [
        createCard('♠', 'K', 10),
        createCard('♥', 'Q', 10),
        createCard('♦', '5', 5)
      ]
      expect(rules.isBust(cards)).toBe(true)
    })

    it('should return false when score <= 21', () => {
      const cards = [
        createCard('♠', 'A', 11),
        createCard('♥', '10', 10)
      ]
      expect(rules.isBust(cards)).toBe(false)
    })

    it('should handle Ace conversion correctly', () => {
      const cards = [
        createCard('♠', 'A', 11),
        createCard('♥', '6', 6),
        createCard('♦', '5', 5)
      ]
      expect(rules.isBust(cards)).toBe(false) // A=1, total=12
    })
  })

  describe('isBlackjack', () => {
    it('should return true for Ace + 10-value card', () => {
      const cards = [
        createCard('♠', 'A', 11),
        createCard('♥', 'K', 10)
      ]
      expect(rules.isBlackjack(cards)).toBe(true)
    })

    it('should return true for 10-value card + Ace', () => {
      const cards = [
        createCard('♠', 'Q', 10),
        createCard('♥', 'A', 11)
      ]
      expect(rules.isBlackjack(cards)).toBe(true)
    })

    it('should return false for 21 with more than 2 cards', () => {
      const cards = [
        createCard('♠', '7', 7),
        createCard('♥', '7', 7),
        createCard('♦', '7', 7)
      ]
      expect(rules.isBlackjack(cards)).toBe(false)
    })

    it('should return false for non-21 two-card hands', () => {
      const cards = [
        createCard('♠', 'K', 10),
        createCard('♥', '9', 9)
      ]
      expect(rules.isBlackjack(cards)).toBe(false)
    })
  })

  describe('shouldDealerHit', () => {
    it('should hit on 16', () => {
      const cards = [
        createCard('♠', 'K', 10),
        createCard('♥', '6', 6)
      ]
      expect(rules.shouldDealerHit(cards)).toBe(true)
    })

    it('should stand on 17', () => {
      const cards = [
        createCard('♠', 'K', 10),
        createCard('♥', '7', 7)
      ]
      expect(rules.shouldDealerHit(cards)).toBe(false)
    })

    it('should hit on soft 17', () => {
      const cards = [
        createCard('♠', 'A', 11),
        createCard('♥', '6', 6)
      ]
      expect(rules.shouldDealerHit(cards)).toBe(true)
    })

    it('should stand on 18', () => {
      const cards = [
        createCard('♠', 'K', 10),
        createCard('♥', '8', 8)
      ]
      expect(rules.shouldDealerHit(cards)).toBe(false)
    })
  })

  describe('getGameResult', () => {
    it('should return blackjack win for player natural', () => {
      const playerCards = [
        createCard('♠', 'A', 11),
        createCard('♥', 'K', 10)
      ]
      const dealerCards = [
        createCard('♦', 'K', 10),
        createCard('♣', '9', 9)
      ]
      
      const result = rules.getGameResult(playerCards, dealerCards)
      expect(result.result).toBe('blackjack')
      expect(result.multiplier).toBe(2.5)
    })

    it('should return tie for double blackjack', () => {
      const playerCards = [
        createCard('♠', 'A', 11),
        createCard('♥', 'K', 10)
      ]
      const dealerCards = [
        createCard('♦', 'A', 11),
        createCard('♣', 'Q', 10)
      ]
      
      const result = rules.getGameResult(playerCards, dealerCards)
      expect(result.result).toBe('tie')
      expect(result.multiplier).toBe(1)
    })

    it('should return lose for player bust', () => {
      const playerCards = [
        createCard('♠', 'K', 10),
        createCard('♥', 'Q', 10),
        createCard('♦', '5', 5)
      ]
      const dealerCards = [
        createCard('♣', '10', 10),
        createCard('♠', '7', 7)
      ]
      
      const result = rules.getGameResult(playerCards, dealerCards)
      expect(result.result).toBe('lose')
      expect(result.multiplier).toBe(0)
    })

    it('should return win for dealer bust', () => {
      const playerCards = [
        createCard('♠', '10', 10),
        createCard('♥', '9', 9)
      ]
      const dealerCards = [
        createCard('♦', 'K', 10),
        createCard('♣', 'Q', 10),
        createCard('♠', '5', 5)
      ]
      
      const result = rules.getGameResult(playerCards, dealerCards)
      expect(result.result).toBe('win')
      expect(result.multiplier).toBe(2)
    })
  })

  describe('canDouble', () => {
    it('should allow doubling with sufficient funds and 2 cards', () => {
      const cards = [
        createCard('♠', '5', 5),
        createCard('♥', '6', 6)
      ]
      expect(rules.canDouble(cards, 1000, 100)).toBe(true)
    })

    it('should not allow doubling with insufficient funds', () => {
      const cards = [
        createCard('♠', '5', 5),
        createCard('♥', '6', 6)
      ]
      expect(rules.canDouble(cards, 100, 100)).toBe(false)
    })

    it('should not allow doubling with more than 2 cards', () => {
      const cards = [
        createCard('♠', '2', 2),
        createCard('♥', '3', 3),
        createCard('♦', '4', 4)
      ]
      expect(rules.canDouble(cards, 1000, 100)).toBe(false)
    })
  })

  describe('isValidBet', () => {
    it('should accept valid bet amounts', () => {
      expect(rules.isValidBet(50, 1000)).toBe(true)
      expect(rules.isValidBet(1000, 1000)).toBe(true)
    })

    it('should reject invalid bet amounts', () => {
      expect(rules.isValidBet(0, 1000)).toBe(false)
      expect(rules.isValidBet(-10, 1000)).toBe(false)
      expect(rules.isValidBet(1500, 1000)).toBe(false)
    })
  })
})