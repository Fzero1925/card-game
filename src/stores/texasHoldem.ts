import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCardDeck } from '@/composables/useCardDeck'\nimport { getAIDecision } from '@/utils/ai/pokerAI'
import type { 
  TexasHoldemState, 
  PokerPlayer, 
  Card, 
  PokerAction, 
  GameMessage,
  Pot,
  BettingAction,
  PokerGamePhase,
  PokerGameStatus,
  AIConfig 
} from '@/types/game'

export const useTexasHoldemStore = defineStore('texasHoldem', () => {
  // 游戏基础状态
  const gameStatus = ref<PokerGameStatus>('waiting')
  const gamePhase = ref<PokerGamePhase>('pre-flop')
  const players = ref<PokerPlayer[]>([])
  const communityCards = ref<Card[]>([])
  const pots = ref<Pot[]>([])
  const currentPlayerIndex = ref(0)
  const dealerIndex = ref(0)
  const handNumber = ref(1)
  const gameInProgress = ref(false)
  
  // 游戏配置
  const smallBlind = ref(10)
  const bigBlind = ref(20)
  const minRaise = ref(bigBlind.value)
  
  // 当前下注轮信息
  const bettingActions = ref<BettingAction[]>([])
  const currentBet = ref(0)
  
  // 游戏消息
  const gameMessage = ref<GameMessage | null>(null)
  
  // 牌堆管理
  const deck = useCardDeck()

  // AI配置预设
  const AI_PRESETS: AIConfig[] = [
    {
      name: '小心翼翼的AI',
      personality: 'conservative',
      difficulty: 'beginner',
      chattiness: 0.3
    },
    {
      name: '激进的AI',
      personality: 'aggressive', 
      difficulty: 'intermediate',
      chattiness: 0.7
    },
    {
      name: '数学家AI',
      personality: 'mathematical',
      difficulty: 'expert',
      chattiness: 0.2
    }
  ]

  // 计算属性
  const currentPlayer = computed(() => {
    return players.value[currentPlayerIndex.value] || null
  })

  const activePlayers = computed(() => {
    return players.value.filter(p => p.isActive && !p.isFolded)
  })

  const humanPlayer = computed(() => {
    return players.value.find(p => !p.isAI) || null
  })

  const totalPot = computed(() => {
    return pots.value.reduce((sum, pot) => sum + pot.amount, 0)
  })

  const isPlayerTurn = computed(() => {
    return currentPlayer.value && !currentPlayer.value.isAI
  })

  // 初始化游戏
  const initializeGame = () => {
    players.value = []
    communityCards.value = []
    pots.value = []
    bettingActions.value = []
    currentPlayerIndex.value = 0
    dealerIndex.value = 0
    handNumber.value = 1
    gameStatus.value = 'waiting'
    gamePhase.value = 'pre-flop'
    gameInProgress.value = false
    currentBet.value = 0
    clearMessage()
    
    // 创建新牌堆
    deck.createDeck(1, 'poker')
    
    // 创建玩家（1个人类玩家 + 3个AI）
    createPlayers()
  }

  // 创建玩家
  const createPlayers = () => {
    // 人类玩家
    const humanPlayerData: PokerPlayer = {
      id: 'human',
      name: '玩家',
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

    // AI玩家
    const aiPlayers: PokerPlayer[] = AI_PRESETS.map((config, index) => ({
      id: `ai-${index}`,
      name: config.name,
      chips: 1000,
      holeCards: [],
      currentBet: 0,
      totalBetInRound: 0,
      isActive: true,
      isFolded: false,
      isAllIn: false,
      position: 'player',
      isAI: true,
      aiConfig: config
    }))

    players.value = [humanPlayerData, ...aiPlayers]
    
    // 设置位置
    updatePositions()
  }

  // 更新玩家位置（盲注和庄家）
  const updatePositions = () => {
    players.value.forEach((player, index) => {
      if (index === dealerIndex.value) {
        player.position = 'dealer'
      } else if (index === (dealerIndex.value + 1) % players.value.length) {
        player.position = 'small-blind'
      } else if (index === (dealerIndex.value + 2) % players.value.length) {
        player.position = 'big-blind'
      } else {
        player.position = 'player'
      }
    })
  }

  // 开始新的一手牌
  const startNewHand = () => {
    if (activePlayers.value.length < 2) {
      setMessage('需要至少2名玩家才能开始游戏', 'warning')
      return
    }

    // 重置手牌状态
    players.value.forEach(player => {
      player.holeCards = []
      player.currentBet = 0
      player.totalBetInRound = 0
      player.isFolded = false
      player.isAllIn = false
      if (player.chips > 0) {
        player.isActive = true
      }
    })

    communityCards.value = []
    pots.value = [{ amount: 0, players: players.value.map(p => p.id), isMain: true }]
    bettingActions.value = []
    currentBet.value = bigBlind.value
    
    gameStatus.value = 'dealing'
    gamePhase.value = 'pre-flop'
    gameInProgress.value = true
    clearMessage()

    // 重新洗牌
    deck.createDeck(1, 'poker')

    // 收取盲注
    collectBlinds()

    // 发底牌
    dealHoleCards()

    // 开始翻牌前下注
    startBettingRound()
  }

  // 收取盲注
  const collectBlinds = () => {
    const smallBlindPlayer = players.value.find(p => p.position === 'small-blind')
    const bigBlindPlayer = players.value.find(p => p.position === 'big-blind')

    if (smallBlindPlayer) {
      const sbAmount = Math.min(smallBlind.value, smallBlindPlayer.chips)
      smallBlindPlayer.chips -= sbAmount
      smallBlindPlayer.currentBet = sbAmount
      smallBlindPlayer.totalBetInRound = sbAmount
      pots.value[0].amount += sbAmount
      
      if (sbAmount < smallBlind.value) {
        smallBlindPlayer.isAllIn = true
      }
    }

    if (bigBlindPlayer) {
      const bbAmount = Math.min(bigBlind.value, bigBlindPlayer.chips)
      bigBlindPlayer.chips -= bbAmount
      bigBlindPlayer.currentBet = bbAmount
      bigBlindPlayer.totalBetInRound = bbAmount
      pots.value[0].amount += bbAmount
      
      if (bbAmount < bigBlind.value) {
        bigBlindPlayer.isAllIn = true
      }
    }
  }

  // 发底牌
  const dealHoleCards = () => {
    // 给每个活跃玩家发2张底牌
    for (let round = 0; round < 2; round++) {
      for (const player of activePlayers.value) {
        const card = deck.dealCard()
        if (card) {
          player.holeCards.push(card)
        }
      }
    }
  }

  // 开始下注轮
  const startBettingRound = () => {
    gameStatus.value = 'betting'
    
    // 设置第一个行动玩家
    if (gamePhase.value === 'pre-flop') {
      // 翻牌前从大盲注后面开始
      const bigBlindIndex = players.value.findIndex(p => p.position === 'big-blind')
      currentPlayerIndex.value = (bigBlindIndex + 1) % players.value.length
    } else {
      // 翻牌后从小盲注开始
      const smallBlindIndex = players.value.findIndex(p => p.position === 'small-blind')
      currentPlayerIndex.value = smallBlindIndex >= 0 ? smallBlindIndex : dealerIndex.value
    }
    
    // 找到第一个可以行动的玩家
    findNextPlayer()
    
    // 如果当前玩家是AI，启动AI决策
    setTimeout(() => {
      processAITurn()
    }, 500)
  }

  // 寻找下一个可以行动的玩家
  const findNextPlayer = () => {
    const startIndex = currentPlayerIndex.value
    let attempts = 0
    
    do {
      const player = players.value[currentPlayerIndex.value]
      if (player && player.isActive && !player.isFolded && !player.isAllIn) {
        break
      }
      currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
      attempts++
    } while (attempts < players.value.length && currentPlayerIndex.value !== startIndex)

    // 如果没有找到可行动的玩家，结束当前下注轮
    if (attempts >= players.value.length || 
        activePlayers.value.filter(p => !p.isFolded && !p.isAllIn).length <= 1) {
      endBettingRound()
    }
  }

  // 玩家行动
  const playerAction = (action: PokerAction, amount: number = 0) => {
    const player = currentPlayer.value
    if (!player || player.isAI) return

    executeAction(player, action, amount)
  }

  // 执行行动
  const executeAction = (player: PokerPlayer, action: PokerAction, amount: number = 0) => {
    const actionRecord: BettingAction = {
      playerId: player.id,
      action,
      amount,
      timestamp: Date.now()
    }

    switch (action) {
      case 'fold':
        player.isFolded = true
        break
        
      case 'check':
        // 只能在没有下注时过牌
        if (currentBet.value === player.totalBetInRound) {
          // 过牌，不需要额外操作
        }
        break
        
      case 'call':
        const callAmount = Math.min(
          currentBet.value - player.totalBetInRound, 
          player.chips
        )
        player.chips -= callAmount
        player.currentBet += callAmount
        player.totalBetInRound += callAmount
        pots.value[0].amount += callAmount
        
        if (callAmount < currentBet.value - player.totalBetInRound) {
          player.isAllIn = true
        }
        break
        
      case 'raise':
        const totalBetAmount = Math.min(amount, player.chips + player.totalBetInRound)
        const raiseAmount = totalBetAmount - player.totalBetInRound
        
        player.chips -= raiseAmount
        player.currentBet += raiseAmount
        player.totalBetInRound = totalBetAmount
        pots.value[0].amount += raiseAmount
        currentBet.value = totalBetAmount
        
        if (player.chips === 0) {
          player.isAllIn = true
        }
        break
        
      case 'all-in':
        const allInAmount = player.chips
        player.chips = 0
        player.currentBet += allInAmount
        player.totalBetInRound += allInAmount
        pots.value[0].amount += allInAmount
        player.isAllIn = true
        
        if (player.totalBetInRound > currentBet.value) {
          currentBet.value = player.totalBetInRound
        }
        break
    }

    bettingActions.value.push(actionRecord)

    // 移动到下一个玩家
    moveToNextPlayer()
  }

  // 移动到下一个玩家
  const moveToNextPlayer = () => {
    currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
    findNextPlayer()
    
    // 如果下一个玩家是AI，自动执行AI决策
    setTimeout(() => {
      processAITurn()
    }, 1000) // 延迟1秒让用户看到轮换
  }
  
  // 处理AI回合
  const processAITurn = () => {
    const player = currentPlayer.value
    if (!player || !player.isAI || player.isFolded || !player.isActive) {
      return
    }
    
    try {
      const gameState = {
        currentBet: currentBet.value,
        minRaise: minRaise.value,
        gamePhase: gamePhase.value,
        communityCards: communityCards.value,
        potSize: totalPot.value
      }
      
      const decision = getAIDecision(player, gameState)
      
      // 显示AI的决策理由
      setMessage(`${player.name}: ${decision.reasoning}`, 'info')
      
      // 延迟执行AI动作，让玩家看到思考过程
      setTimeout(() => {
        executeAction(player, decision.action, decision.amount || 0)
      }, 1500)
    } catch (error) {
      console.error('AI决策错误:', error)
      // AI出错时默认弃牌
      executeAction(player, 'fold')
    }
  }

  // 结束下注轮
  const endBettingRound = () => {
    // 重置当前下注
    players.value.forEach(player => {
      player.currentBet = 0
    })

    // 检查是否只剩一个玩家
    const remainingPlayers = activePlayers.value.filter(p => !p.isFolded)
    if (remainingPlayers.length === 1) {
      endHand(remainingPlayers[0])
      return
    }

    // 进入下一阶段
    advanceGamePhase()
  }

  // 推进游戏阶段
  const advanceGamePhase = () => {
    switch (gamePhase.value) {
      case 'pre-flop':
        gamePhase.value = 'flop'
        dealFlop()
        break
      case 'flop':
        gamePhase.value = 'turn'
        dealTurn()
        break
      case 'turn':
        gamePhase.value = 'river'
        dealRiver()
        break
      case 'river':
        gamePhase.value = 'showdown'
        showdown()
        return
    }

    currentBet.value = 0
    startBettingRound()
  }

  // 发翻牌
  const dealFlop = () => {
    // 烧掉一张牌
    deck.dealCard()
    // 发3张公共牌
    for (let i = 0; i < 3; i++) {
      const card = deck.dealCard()
      if (card) communityCards.value.push(card)
    }
  }

  // 发转牌
  const dealTurn = () => {
    // 烧掉一张牌
    deck.dealCard()
    // 发1张公共牌
    const card = deck.dealCard()
    if (card) communityCards.value.push(card)
  }

  // 发河牌
  const dealRiver = () => {
    // 烧掉一张牌
    deck.dealCard()
    // 发1张公共牌
    const card = deck.dealCard()
    if (card) communityCards.value.push(card)
  }

  // 摊牌
  const showdown = async () => {
    gameStatus.value = 'showdown'
    const remainingPlayers = activePlayers.value.filter(p => !p.isFolded)
    
    if (remainingPlayers.length === 1) {
      endHand(remainingPlayers[0])
      return
    }

    // 评估所有玩家的手牌
    const { evaluateHand } = await import('@/utils/poker/handEvaluator')
    const playerEvaluations = await Promise.all(
      remainingPlayers.map(async player => {
        const allCards = [...player.holeCards, ...communityCards.value]
        const evaluation = evaluateHand(allCards)
        return { player, evaluation }
      })
    )

    // 找到获胜者
    playerEvaluations.sort((a, b) => b.evaluation.score - a.evaluation.score)
    const winner = playerEvaluations[0]

    endHand(winner.player, winner.evaluation.description)
  }

  // 结束一手牌
  const endHand = (winner: PokerPlayer, winDescription?: string) => {
    gameStatus.value = 'finished'
    
    // 分配底池给获胜者
    const winAmount = totalPot.value
    winner.chips += winAmount
    
    const messageKey = winDescription 
      ? `${winner.name} 获胜！(${winDescription})`
      : `${winner.name} 获胜！`
    
    setMessage(messageKey, 'success')

    // 准备下一手牌
    setTimeout(() => {
      prepareNextHand()
    }, 3000)
  }

  // 准备下一手牌
  const prepareNextHand = () => {
    // 移动庄家位置
    dealerIndex.value = (dealerIndex.value + 1) % players.value.length
    updatePositions()
    
    handNumber.value++
    gameStatus.value = 'waiting'
    
    // 检查是否有玩家破产
    const bankruptPlayers = players.value.filter(p => p.chips <= 0)
    bankruptPlayers.forEach(player => {
      player.isActive = false
    })

    // 检查游戏是否结束
    if (activePlayers.value.length < 2) {
      endGame()
    }
  }

  // 结束游戏
  const endGame = () => {
    gameInProgress.value = false
    gameStatus.value = 'finished'
    
    if (humanPlayer.value && humanPlayer.value.isActive) {
      setMessage('恭喜！你赢得了整个游戏！', 'success')
    } else {
      setMessage('游戏结束！', 'info')
    }
  }

  // 新游戏
  const newGame = () => {
    initializeGame()
    setMessage('新游戏开始！', 'info')
  }

  // 设置消息
  const setMessage = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    gameMessage.value = {
      type,
      message,
      timestamp: Date.now()
    }
  }

  // 清除消息
  const clearMessage = () => {
    gameMessage.value = null
  }

  // 获取玩家可用动作
  const getAvailableActions = (player: PokerPlayer): PokerAction[] => {
    const actions: PokerAction[] = []
    
    if (player.isFolded || !player.isActive) return actions

    // 弃牌总是可用的
    actions.push('fold')

    const callAmount = currentBet.value - player.totalBetInRound

    // 过牌
    if (callAmount === 0) {
      actions.push('check')
    }

    // 跟注
    if (callAmount > 0 && player.chips >= callAmount) {
      actions.push('call')
    }

    // 加注
    if (player.chips > callAmount + minRaise.value) {
      actions.push('raise')
    }

    // 全押
    if (player.chips > 0) {
      actions.push('all-in')
    }

    return actions
  }

  // 初始化
  initializeGame()

  return {
    // 状态
    gameStatus,
    gamePhase,
    players,
    communityCards,
    pots,
    currentPlayerIndex,
    dealerIndex,
    handNumber,
    gameInProgress,
    smallBlind,
    bigBlind,
    minRaise,
    bettingActions,
    currentBet,
    gameMessage,

    // 计算属性
    currentPlayer,
    activePlayers,
    humanPlayer,
    totalPot,
    isPlayerTurn,

    // 方法
    startNewHand,
    playerAction,
    getAvailableActions,
    newGame,
    setMessage,
    clearMessage
  }
})