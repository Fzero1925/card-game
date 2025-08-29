import { describe, it, expect } from 'vitest'
import { evaluateHand, compareHands } from '@/utils/poker/handEvaluator'
import type { Card } from '@/types/game'

describe('德州扑克手牌评估器', () => {
  // 辅助函数：创建测试卡牌
  const createCard = (suit: '♠' | '♥' | '♦' | '♣', rank: string): Card => ({
    suit,
    rank: rank as any,
    value: 0 // handEvaluator会忽略这个值，使用自己的计算逻辑
  })

  describe('evaluateHand', () => {
    describe('皇家同花顺 (Royal Flush)', () => {
      it('应该识别黑桃皇家同花顺', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♠', 'K'),
          createCard('♠', 'Q'),
          createCard('♠', 'J'),
          createCard('♠', '10')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('royal-flush')
        expect(result.description).toBe('皇家同花顺')
      })

      it('应该从7张牌中识别红心皇家同花顺', () => {
        const cards = [
          createCard('♥', 'A'),
          createCard('♥', 'K'),
          createCard('♥', 'Q'),
          createCard('♥', 'J'),
          createCard('♥', '10'),
          createCard('♠', '2'),
          createCard('♣', '3')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('royal-flush')
        expect(result.cards).toHaveLength(5)
      })
    })

    describe('同花顺 (Straight Flush)', () => {
      it('应该识别基本同花顺', () => {
        const cards = [
          createCard('♠', '9'),
          createCard('♠', '8'),
          createCard('♠', '7'),
          createCard('♠', '6'),
          createCard('♠', '5')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('straight-flush')
        expect(result.description).toBe('同花顺')
      })

      it('应该识别A-2-3-4-5轮子同花顺', () => {
        const cards = [
          createCard('♦', 'A'),
          createCard('♦', '2'),
          createCard('♦', '3'),
          createCard('♦', '4'),
          createCard('♦', '5')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('straight-flush')
      })
    })

    describe('四条 (Four of a Kind)', () => {
      it('应该识别基本四条', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', 'A'),
          createCard('♦', 'A'),
          createCard('♣', 'A'),
          createCard('♠', 'K')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('four-of-a-kind')
        expect(result.cards).toHaveLength(5)
      })

      it('应该从7张牌中找到最佳四条组合', () => {
        const cards = [
          createCard('♠', '8'),
          createCard('♥', '8'),
          createCard('♦', '8'),
          createCard('♣', '8'),
          createCard('♠', 'A'), // 最大踢脚
          createCard('♥', '2'), // 较小踢脚
          createCard('♦', '3')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('four-of-a-kind')
        // 应该选择A作为踢脚，而不是2或3
        const aceKicker = result.cards.find(c => c.rank === 'A')
        expect(aceKicker).toBeTruthy()
      })
    })

    describe('满堂红 (Full House)', () => {
      it('应该识别基本满堂红', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', 'A'),
          createCard('♦', 'A'),
          createCard('♠', 'K'),
          createCard('♥', 'K')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('full-house')
      })

      it('应该从两个三条中选择更大的作为三条部分', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', 'A'),
          createCard('♦', 'A'),
          createCard('♠', 'K'),
          createCard('♥', 'K'),
          createCard('♦', 'K'),
          createCard('♠', '2')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('full-house')
        // A应该是三条部分，K应该是对子部分
        const aceCount = result.cards.filter(c => c.rank === 'A').length
        const kingCount = result.cards.filter(c => c.rank === 'K').length
        expect(aceCount).toBe(3)
        expect(kingCount).toBe(2)
      })
    })

    describe('同花 (Flush)', () => {
      it('应该识别基本同花', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♠', 'J'),
          createCard('♠', '9'),
          createCard('♠', '6'),
          createCard('♠', '3')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('flush')
      })

      it('应该从7张同花牌中选择最大的5张', () => {
        const cards = [
          createCard('♥', 'A'),
          createCard('♥', 'K'),
          createCard('♥', 'Q'),
          createCard('♥', 'J'),
          createCard('♥', '9'),
          createCard('♥', '6'),
          createCard('♥', '3')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('flush')
        expect(result.cards).toHaveLength(5)
        // 应该不包含6和3
        const has6 = result.cards.some(c => c.rank === '6')
        const has3 = result.cards.some(c => c.rank === '3')
        expect(has6).toBe(false)
        expect(has3).toBe(false)
      })
    })

    describe('顺子 (Straight)', () => {
      it('应该识别基本顺子', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', 'K'),
          createCard('♦', 'Q'),
          createCard('♣', 'J'),
          createCard('♠', '10')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('straight')
      })

      it('应该识别A-2-3-4-5轮子顺子', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', '2'),
          createCard('♦', '3'),
          createCard('♣', '4'),
          createCard('♠', '5'),
          createCard('♥', 'K'), // 干扰牌
          createCard('♦', 'Q')  // 干扰牌
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('straight')
      })

      it('应该从7张牌中找到最佳顺子', () => {
        const cards = [
          createCard('♠', '9'),
          createCard('♥', '8'),
          createCard('♦', '7'),
          createCard('♣', '6'),
          createCard('♠', '5'),
          createCard('♥', '4'), // 可以组成6高顺子
          createCard('♦', '3')  // 可以组成7高顺子
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('straight')
        // 应该选择9高的顺子
        const has9 = result.cards.some(c => c.rank === '9')
        expect(has9).toBe(true)
      })
    })

    describe('三条 (Three of a Kind)', () => {
      it('应该识别基本三条', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', 'A'),
          createCard('♦', 'A'),
          createCard('♣', 'K'),
          createCard('♠', 'Q')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('three-of-a-kind')
      })

      it('应该选择最大的两张踢脚牌', () => {
        const cards = [
          createCard('♠', '8'),
          createCard('♥', '8'),
          createCard('♦', '8'),
          createCard('♣', 'A'),
          createCard('♠', 'K'),
          createCard('♥', 'Q'),
          createCard('♦', '2')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('three-of-a-kind')
        // 踢脚应该是A和K
        const hasAce = result.cards.some(c => c.rank === 'A')
        const hasKing = result.cards.some(c => c.rank === 'K')
        const hasQueen = result.cards.some(c => c.rank === 'Q')
        expect(hasAce).toBe(true)
        expect(hasKing).toBe(true)
        expect(hasQueen).toBe(false)
      })
    })

    describe('两对 (Two Pair)', () => {
      it('应该识别基本两对', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', 'A'),
          createCard('♦', 'K'),
          createCard('♣', 'K'),
          createCard('♠', 'Q')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('two-pair')
      })

      it('应该从多对中选择最大的两对', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', 'A'),
          createCard('♦', 'K'),
          createCard('♣', 'K'),
          createCard('♠', 'Q'),
          createCard('♥', 'Q'), // 第三对
          createCard('♦', '2')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('two-pair')
        // 应该是A对和K对，踢脚是Q
        const aceCount = result.cards.filter(c => c.rank === 'A').length
        const kingCount = result.cards.filter(c => c.rank === 'K').length
        const queenCount = result.cards.filter(c => c.rank === 'Q').length
        expect(aceCount).toBe(2)
        expect(kingCount).toBe(2)
        expect(queenCount).toBe(1) // 作为踢脚
      })
    })

    describe('一对 (Pair)', () => {
      it('应该识别基本一对', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', 'A'),
          createCard('♦', 'K'),
          createCard('♣', 'Q'),
          createCard('♠', 'J')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('pair')
      })

      it('应该选择最大的三张踢脚牌', () => {
        const cards = [
          createCard('♠', '8'),
          createCard('♥', '8'),
          createCard('♦', 'A'),
          createCard('♣', 'K'),
          createCard('♠', 'Q'),
          createCard('♥', 'J'),
          createCard('♦', '2')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('pair')
        // 踢脚应该是A, K, Q
        const hasAce = result.cards.some(c => c.rank === 'A')
        const hasKing = result.cards.some(c => c.rank === 'K')
        const hasQueen = result.cards.some(c => c.rank === 'Q')
        const hasJack = result.cards.some(c => c.rank === 'J')
        expect(hasAce).toBe(true)
        expect(hasKing).toBe(true)
        expect(hasQueen).toBe(true)
        expect(hasJack).toBe(false)
      })
    })

    describe('高牌 (High Card)', () => {
      it('应该识别高牌手牌', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', 'J'),
          createCard('♦', '9'),
          createCard('♣', '7'),
          createCard('♠', '5')
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('high-card')
      })

      it('应该从7张牌中选择最大的5张', () => {
        const cards = [
          createCard('♠', 'A'),
          createCard('♥', 'K'),
          createCard('♦', 'Q'),
          createCard('♣', 'J'),
          createCard('♠', '9'),
          createCard('♥', '7'), // 应该被排除
          createCard('♦', '2')  // 应该被排除
        ]
        const result = evaluateHand(cards)
        expect(result.rank).toBe('high-card')
        expect(result.cards).toHaveLength(5)
        const has7 = result.cards.some(c => c.rank === '7')
        const has2 = result.cards.some(c => c.rank === '2')
        expect(has7).toBe(false)
        expect(has2).toBe(false)
      })
    })
  })

  describe('compareHands', () => {
    it('皇家同花顺应该击败所有其他牌型', () => {
      const royalFlush = [
        createCard('♠', 'A'),
        createCard('♠', 'K'),
        createCard('♠', 'Q'),
        createCard('♠', 'J'),
        createCard('♠', '10')
      ]
      const straightFlush = [
        createCard('♥', '9'),
        createCard('♥', '8'),
        createCard('♥', '7'),
        createCard('♥', '6'),
        createCard('♥', '5')
      ]
      expect(compareHands(royalFlush, straightFlush)).toBe(1)
    })

    it('四条应该击败满堂红', () => {
      const fourOfAKind = [
        createCard('♠', 'A'),
        createCard('♥', 'A'),
        createCard('♦', 'A'),
        createCard('♣', 'A'),
        createCard('♠', 'K')
      ]
      const fullHouse = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
        createCard('♦', 'K'),
        createCard('♠', 'Q'),
        createCard('♥', 'Q')
      ]
      expect(compareHands(fourOfAKind, fullHouse)).toBe(1)
    })

    it('同级别牌型应该比较高牌', () => {
      const highPair = [
        createCard('♠', 'A'),
        createCard('♥', 'A'),
        createCard('♦', 'K'),
        createCard('♣', 'Q'),
        createCard('♠', 'J')
      ]
      const lowPair = [
        createCard('♠', 'K'),
        createCard('♥', 'K'),
        createCard('♦', 'A'),
        createCard('♣', 'Q'),
        createCard('♠', 'J')
      ]
      expect(compareHands(highPair, lowPair)).toBe(1)
    })

    it('相同牌型和主牌应该比较踢脚牌', () => {
      const betterKicker = [
        createCard('♠', 'A'),
        createCard('♥', 'A'),
        createCard('♦', 'K'), // 更好的踢脚
        createCard('♣', 'Q'),
        createCard('♠', 'J')
      ]
      const worseKicker = [
        createCard('♠', 'A'),
        createCard('♣', 'A'),
        createCard('♦', 'Q'), // 较差的踢脚
        createCard('♣', 'J'),
        createCard('♠', '10')
      ]
      expect(compareHands(betterKicker, worseKicker)).toBe(1)
    })

    it('完全相同的手牌应该返回平手', () => {
      const hand1 = [
        createCard('♠', 'A'),
        createCard('♥', 'K'),
        createCard('♦', 'Q'),
        createCard('♣', 'J'),
        createCard('♠', '10')
      ]
      const hand2 = [
        createCard('♦', 'A'),
        createCard('♣', 'K'),
        createCard('♠', 'Q'),
        createCard('♥', 'J'),
        createCard('♦', '10')
      ]
      expect(compareHands(hand1, hand2)).toBe(0)
    })
  })

  describe('边缘情况', () => {
    it('应该处理少于5张牌的情况', () => {
      const fewCards = [
        createCard('♠', 'A'),
        createCard('♥', 'K'),
        createCard('♦', 'Q'),
        createCard('♣', 'J')
      ]
      expect(() => evaluateHand(fewCards)).toThrow('至少需要5张牌进行评估')
    })

    it('应该正确处理混合花色的顺子', () => {
      const mixedStraight = [
        createCard('♠', '10'),
        createCard('♥', '9'),
        createCard('♦', '8'),
        createCard('♣', '7'),
        createCard('♠', '6'),
        createCard('♥', 'A'), // 干扰牌
        createCard('♦', '2')  // 干扰牌
      ]
      const result = evaluateHand(mixedStraight)
      expect(result.rank).toBe('straight')
      expect(result.cards).toHaveLength(5)
    })

    it('应该正确识别不同花色的同数值牌', () => {
      const differentSuits = [
        createCard('♠', 'A'),
        createCard('♥', 'A'),
        createCard('♦', 'A'),
        createCard('♣', 'A'),
        createCard('♠', 'K'),
        createCard('♥', 'Q'),
        createCard('♦', 'J')
      ]
      const result = evaluateHand(differentSuits)
      expect(result.rank).toBe('four-of-a-kind')
    })
  })
})