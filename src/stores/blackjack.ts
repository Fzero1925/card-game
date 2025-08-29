import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCardDeck } from '@/composables/useCardDeck'
import { useBlackjackRules } from '@/composables/useGameRules'
import type { Card, BlackjackAction, GameMessage } from '@/types/game'

export const useBlackjackStore = defineStore('blackjack', () => {
  // 游戏状态
  const playerCards = ref<Card[]>([])
  const dealerCards = ref<Card[]>([])
  const playerMoney = ref(1000)
  const currentBet = ref(0)
  const dealerHidden = ref(true)
  const gameInProgress = ref(false)
  const gameMessage = ref<GameMessage | null>(null)

  // 游戏工具
  const deck = useCardDeck()
  const rules = useBlackjackRules()

  // 初始化牌堆
  deck.createDeck(6, 'blackjack') // 使用6副牌

  // 计算分数
  const playerScore = computed(() => rules.calculateScore(playerCards.value))
  const dealerScore = computed(() => rules.calculateScore(dealerCards.value))
  
  // 显示的庄家分数（隐藏第二张牌时只显示第一张）
  const visibleDealerScore = computed(() => {
    if (dealerHidden.value && dealerCards.value.length > 0) {
      // 只计算第一张牌的分数，确保A牌正确处理
      return rules.calculateScore([dealerCards.value[0]])
    }
    return dealerScore.value
  })

  // 游戏状态检查
  const canHit = computed(() => 
    gameInProgress.value && playerScore.value < 21
  )

  const canStand = computed(() => gameInProgress.value)

  const canDouble = computed(() => 
    rules.canDouble(playerCards.value, playerMoney.value, currentBet.value)
  )

  const canDeal = computed(() => 
    !gameInProgress.value && currentBet.value > 0 && currentBet.value <= playerMoney.value
  )

  // 设置游戏消息
  const setMessage = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    gameMessage.value = {
      type,
      message,
      timestamp: Date.now()
    }
  }

  const clearMessage = () => {
    gameMessage.value = null
  }

  // 下注
  const placeBet = (amount: number | 'all') => {
    if (gameInProgress.value) return

    if (amount === 'all') {
      currentBet.value = playerMoney.value
    } else {
      if (rules.isValidBet(amount, playerMoney.value)) {
        currentBet.value = amount
      }
    }
  }

  // 发牌
  const deal = () => {
    if (!canDeal.value) {
      setMessage('games.blackjack.messages.placeBet', 'warning')
      return
    }

    // 扣除下注金额
    playerMoney.value -= currentBet.value
    
    // 重置游戏状态
    gameInProgress.value = true
    dealerHidden.value = true
    playerCards.value = []
    dealerCards.value = []
    clearMessage()

    // 发两张牌给玩家和庄家
    playerCards.value.push(deck.dealCard()!)
    dealerCards.value.push(deck.dealCard()!)
    playerCards.value.push(deck.dealCard()!)
    dealerCards.value.push(deck.dealCard()!)

    // 检查是否有21点
    const playerHasBlackjack = rules.isBlackjack(playerCards.value)
    const dealerHasBlackjack = rules.isBlackjack(dealerCards.value)

    if (playerHasBlackjack || dealerHasBlackjack) {
      dealerHidden.value = false
      const result = rules.getGameResult(playerCards.value, dealerCards.value)
      endGame(result.message, result.result, result.multiplier)
    }
  }

  // 要牌
  const hit = () => {
    if (!canHit.value) return

    const newCard = deck.dealCard()
    if (newCard) {
      playerCards.value.push(newCard)
    }

    // 检查是否爆牌
    if (rules.isBust(playerCards.value)) {
      endGame('games.blackjack.messages.bust', 'lose', 0)
    } else if (playerScore.value === 21) {
      // 自动停牌
      stand()
    }
  }

  // 停牌
  const stand = () => {
    if (!canStand.value) return

    dealerHidden.value = false

    // 庄家要牌逻辑
    const dealerPlay = () => {
      if (rules.shouldDealerHit(dealerCards.value)) {
        setTimeout(() => {
          const newCard = deck.dealCard()
          if (newCard) {
            dealerCards.value.push(newCard)
          }
          dealerPlay()
        }, 1000)
      } else {
        // 判断胜负
        const result = rules.getGameResult(playerCards.value, dealerCards.value)
        endGame(result.message, result.result, result.multiplier)
      }
    }

    dealerPlay()
  }

  // 加倍
  const double = () => {
    if (!canDouble.value) return

    // 额外扣除下注金额
    playerMoney.value -= currentBet.value
    currentBet.value *= 2

    // 要一张牌
    hit()

    // 如果没有爆牌，自动停牌
    if (gameInProgress.value && playerScore.value <= 21) {
      stand()
    }
  }

  // 结束游戏
  const endGame = (
    message: string,
    result: 'win' | 'lose' | 'tie' | 'blackjack',
    multiplier: number
  ) => {
    gameInProgress.value = false
    dealerHidden.value = false

    // 计算赢得的金额
    const winAmount = Math.floor(currentBet.value * multiplier)
    playerMoney.value += winAmount

    // 设置消息
    const messageType = result === 'win' || result === 'blackjack' ? 'success' : 
                       result === 'lose' ? 'error' : 'info'
    setMessage(message, messageType)

    // 检查是否破产
    if (playerMoney.value <= 0) {
      setTimeout(() => {
        setMessage('games.blackjack.messages.gameOver', 'error')
      }, 2000)
    }
  }

  // 新游戏
  const newGame = () => {
    playerMoney.value = 1000
    currentBet.value = 0
    gameInProgress.value = false
    dealerHidden.value = true
    playerCards.value = []
    dealerCards.value = []
    clearMessage()
    
    // 重新创建牌堆
    deck.createDeck(6, 'blackjack')
  }

  // 执行游戏动作
  const executeAction = (action: BlackjackAction) => {
    switch (action) {
      case 'deal':
        deal()
        break
      case 'hit':
        hit()
        break
      case 'stand':
        stand()
        break
      case 'double':
        double()
        break
      case 'new-game':
        newGame()
        break
    }
  }

  return {
    // 状态
    playerCards,
    dealerCards,
    playerMoney,
    currentBet,
    dealerHidden,
    gameInProgress,
    gameMessage,
    
    // 计算属性
    playerScore,
    dealerScore,
    visibleDealerScore,
    canHit,
    canStand,
    canDouble,
    canDeal,
    
    // 剩余牌数信息
    remainingCards: deck.remainingCards,
    needsReshuffling: deck.needsReshuffling,
    
    // 方法
    placeBet,
    executeAction,
    setMessage,
    clearMessage,
    newGame
  }
})