import { describe, it, expect } from 'vitest'
import { getAIDialogue, getDialoguesByTrigger, getSupportedTriggers, resetDialogueHistory } from '@/utils/ai/aiDialogue'
import type { PokerPlayer, AIConfig } from '@/types/game'

// 创建测试用的AI玩家
const createTestAIPlayer = (personality: AIConfig['personality'], chattiness: number = 0.8): PokerPlayer => ({
  id: `ai-${personality}`,
  name: `${personality} AI`,
  chips: 1000,
  holeCards: [],
  currentBet: 0,
  totalBetInRound: 0,
  isActive: true,
  isFolded: false,
  isAllIn: false,
  position: 'player',
  isAI: true,
  aiConfig: {
    name: `${personality} AI`,
    personality,
    difficulty: 'intermediate',
    chattiness
  }
})

// 测试用的游戏上下文
const gameContext = {
  gamePhase: 'pre-flop' as const,
  potSize: 100,
  handStrength: 'medium' as const,
  totalChips: 4000
}

describe('AI对话系统测试', () => {
  // 重置对话历史
  resetDialogueHistory()

  describe('获取对话内容', () => {
    it('保守型AI应该有对话内容', () => {
      const messages = getDialoguesByTrigger('conservative', 'game-start')
      expect(messages.length).toBeGreaterThan(0)
      expect(messages.some(msg => msg.includes('运'))).toBe(true)
    })

    it('激进型AI应该有对话内容', () => {
      const messages = getDialoguesByTrigger('aggressive', 'game-start')
      expect(messages.length).toBeGreaterThan(0)
      expect(messages.some(msg => msg.includes('激烈') || msg.includes('对决'))).toBe(true)
    })

    it('数学型AI应该有对话内容', () => {
      const messages = getDialoguesByTrigger('mathematical', 'game-start')
      expect(messages.length).toBeGreaterThan(0)
      expect(messages.some(msg => msg.includes('概率') || msg.includes('数学'))).toBe(true)
    })

    it('应该支持多种触发器', () => {
      const triggers = getSupportedTriggers('aggressive')
      expect(triggers).toContain('game-start')
      expect(triggers).toContain('fold')
      expect(triggers).toContain('raise')
      expect(triggers).toContain('all-in')
    })
  })

  describe('AI对话生成', () => {
    it('高聊天频率的AI应该经常说话', () => {
      const highChattinessAI = createTestAIPlayer('aggressive', 1.0)
      
      // 多次尝试获取对话，至少应该有一次成功
      let gotDialogue = false
      for (let i = 0; i < 10; i++) {
        const dialogue = getAIDialogue(highChattinessAI, 'game-start', gameContext)
        if (dialogue) {
          expect(dialogue.playerId).toBe(highChattinessAI.id)
          expect(dialogue.playerName).toBe(highChattinessAI.name)
          expect(dialogue.personality).toBe('aggressive')
          expect(dialogue.trigger).toBe('game-start')
          expect(dialogue.message).toBeTruthy()
          gotDialogue = true
          break
        }
      }
      expect(gotDialogue).toBe(true)
    })

    it('低聊天频率的AI应该很少说话', () => {
      const lowChattinessAI = createTestAIPlayer('conservative', 0.1)
      
      let dialogueCount = 0
      for (let i = 0; i < 20; i++) {
        const dialogue = getAIDialogue(lowChattinessAI, 'game-start', gameContext)
        if (dialogue) {
          dialogueCount++
        }
      }
      // 低频率AI说话次数应该很少
      expect(dialogueCount).toBeLessThan(10)
    })

    it('非AI玩家不应该生成对话', () => {
      const humanPlayer: PokerPlayer = {
        id: 'human',
        name: '人类玩家',
        chips: 1000,
        holeCards: [],
        currentBet: 0,
        totalBetInRound: 0,
        isActive: true,
        isFolded: false,
        isAllIn: false,
        position: 'player',
        isAI: false
      }

      const dialogue = getAIDialogue(humanPlayer, 'game-start', gameContext)
      expect(dialogue).toBeNull()
    })

    it('缺少AI配置的玩家不应该生成对话', () => {
      const incompleteAI: PokerPlayer = {
        id: 'incomplete-ai',
        name: '不完整AI',
        chips: 1000,
        holeCards: [],
        currentBet: 0,
        totalBetInRound: 0,
        isActive: true,
        isFolded: false,
        isAllIn: false,
        position: 'player',
        isAI: true
        // 缺少 aiConfig
      }

      const dialogue = getAIDialogue(incompleteAI, 'game-start', gameContext)
      expect(dialogue).toBeNull()
    })
  })

  describe('不同AI个性的对话差异', () => {
    it('保守型AI的弃牌对话应该体现谨慎', () => {
      const conservativeMessages = getDialoguesByTrigger('conservative', 'fold')
      expect(conservativeMessages.some(msg => 
        msg.includes('谨慎') || msg.includes('保守') || msg.includes('不够好')
      )).toBe(true)
    })

    it('激进型AI的加注对话应该体现攻击性', () => {
      const aggressiveMessages = getDialoguesByTrigger('aggressive', 'raise')
      expect(aggressiveMessages.some(msg => 
        msg.includes('加注') || msg.includes('刺激') || msg.includes('大一点')
      )).toBe(true)
    })

    it('数学型AI的对话应该包含数学术语', () => {
      const mathematicalMessages = getDialoguesByTrigger('mathematical', 'call')
      expect(mathematicalMessages.some(msg => 
        msg.includes('期望值') || msg.includes('赔率') || msg.includes('数学')
      )).toBe(true)
    })

    it('激进型AI应该有全押对话', () => {
      const allInMessages = getDialoguesByTrigger('aggressive', 'all-in')
      expect(allInMessages.length).toBeGreaterThan(0)
      expect(allInMessages.some(msg => 
        msg.includes('全押') || msg.includes('梭哈') || msg.includes('生死')
      )).toBe(true)
    })
  })

  describe('对话条件过滤', () => {
    it('应该根据手牌强度过滤对话', () => {
      const strongHandContext = {
        ...gameContext,
        handStrength: 'very_strong' as const
      }

      const weakHandContext = {
        ...gameContext,
        handStrength: 'weak' as const
      }

      const conservativeAI = createTestAIPlayer('conservative', 1.0)

      // 强牌时保守AI也可能加注
      let strongHandRaiseCount = 0
      for (let i = 0; i < 10; i++) {
        const dialogue = getAIDialogue(conservativeAI, 'raise', strongHandContext)
        if (dialogue) strongHandRaiseCount++
      }

      // 弱牌时保守AI很少加注
      let weakHandRaiseCount = 0
      for (let i = 0; i < 10; i++) {
        const dialogue = getAIDialogue(conservativeAI, 'raise', weakHandContext)
        if (dialogue) weakHandRaiseCount++
      }

      // 强牌时说话概率应该高于弱牌
      expect(strongHandRaiseCount).toBeGreaterThanOrEqual(weakHandRaiseCount)
    })

    it('应该支持所有个性类型', () => {
      const personalities: AIConfig['personality'][] = ['conservative', 'aggressive', 'mathematical', 'bluffer']
      
      personalities.forEach(personality => {
        const triggers = getSupportedTriggers(personality)
        expect(triggers.length).toBeGreaterThan(0)
      })
    })
  })

  describe('对话消息格式', () => {
    it('生成的对话消息应该有正确的格式', () => {
      const testAI = createTestAIPlayer('aggressive', 1.0)
      
      for (let i = 0; i < 5; i++) {
        const dialogue = getAIDialogue(testAI, 'game-start', gameContext)
        if (dialogue) {
          // 检查所有必需字段
          expect(dialogue).toHaveProperty('id')
          expect(dialogue).toHaveProperty('playerId')
          expect(dialogue).toHaveProperty('playerName')
          expect(dialogue).toHaveProperty('message')
          expect(dialogue).toHaveProperty('trigger')
          expect(dialogue).toHaveProperty('timestamp')
          expect(dialogue).toHaveProperty('personality')

          // 检查字段类型和值
          expect(typeof dialogue.id).toBe('string')
          expect(typeof dialogue.playerId).toBe('string')
          expect(typeof dialogue.playerName).toBe('string')
          expect(typeof dialogue.message).toBe('string')
          expect(typeof dialogue.timestamp).toBe('number')
          
          expect(dialogue.playerId).toBe(testAI.id)
          expect(dialogue.playerName).toBe(testAI.name)
          expect(dialogue.personality).toBe('aggressive')
          expect(dialogue.trigger).toBe('game-start')
          expect(dialogue.message.length).toBeGreaterThan(0)
          expect(dialogue.timestamp).toBeGreaterThan(0)
          break
        }
      }
    })
  })
})