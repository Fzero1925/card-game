import type { 
  AIConfig, 
  DialogueTrigger, 
  DialogueContent, 
  PersonalityDialogue, 
  AIDialogueMessage,
  DialogueHistory,
  PokerGamePhase,
  PokerPlayer 
} from '@/types/game'

// 保守型AI对话内容
const CONSERVATIVE_DIALOGUES: DialogueContent[] = [
  {
    trigger: 'game-start',
    messages: [
      '各位好运！我会谨慎行事的。',
      '希望大家都能理性游戏。',
      '让我们开始一场公平的游戏吧。'
    ]
  },
  {
    trigger: 'hand-start',
    messages: [
      '新的一手牌，让我看看情况...',
      '这次我会小心观察的。',
      '希望能拿到好牌。'
    ]
  },
  {
    trigger: 'fold',
    messages: [
      '这手牌不够好，我选择弃牌。',
      '明智的选择是保守一些。',
      '还是谨慎为上，弃牌。',
      '不值得冒险，我弃牌。'
    ]
  },
  {
    trigger: 'call',
    messages: [
      '牌面还可以，我跟注。',
      '跟注观察一下局面。',
      '这个价格可以接受。'
    ]
  },
  {
    trigger: 'raise',
    messages: [
      '我有信心，小幅加注。',
      '这手牌值得投资。',
      '适度加注，控制风险。'
    ],
    conditions: {
      handStrength: ['strong', 'very_strong']
    }
  },
  {
    trigger: 'good-hand',
    messages: [
      '不错的牌面，但还是要小心。',
      '看起来有希望，谨慎乐观。',
      '牌还可以，慢慢来。'
    ]
  },
  {
    trigger: 'bad-hand',
    messages: [
      '这手牌不太理想...',
      '看来运气不太好。',
      '还是等下一手吧。'
    ]
  },
  {
    trigger: 'win-hand',
    messages: [
      '谢谢大家，谨慎的策略奏效了。',
      '稳扎稳打还是有用的。',
      '耐心等待总会有回报。'
    ]
  },
  {
    trigger: 'big-pot',
    messages: [
      '底池很大了，要更加小心。',
      '风险增加了，我需要慎重考虑。',
      '大底池意味着大风险。'
    ]
  }
]

// 激进型AI对话内容
const AGGRESSIVE_DIALOGUES: DialogueContent[] = [
  {
    trigger: 'game-start',
    messages: [
      '来吧！让我们来场激烈的对决！',
      '准备好了吗？我可不会手下留情！',
      '今天感觉运气不错，大家小心了！'
    ]
  },
  {
    trigger: 'hand-start',
    messages: [
      '又一手牌！我已经迫不及待了！',
      '让我们看看谁更有胆量！',
      '新的机会来了！'
    ]
  },
  {
    trigger: 'fold',
    messages: [
      '这次就算了，但下次我不会这么客气！',
      '暂时撤退，准备反击！',
      '让你们先高兴一下。'
    ]
  },
  {
    trigger: 'call',
    messages: [
      '有趣，让我来看看你们的底牌！',
      '跟注！看看谁笑到最后！',
      '我来陪你们玩玩！'
    ]
  },
  {
    trigger: 'raise',
    messages: [
      '加注！让我们把局面搞大一点！',
      '太无聊了，我来加点料！',
      '你们敢跟吗？',
      '让我们来点刺激的！',
      '加注！谁怕谁啊！'
    ]
  },
  {
    trigger: 'all-in',
    messages: [
      '全押！要么回家，要么发财！',
      '梭哈！看看谁是真正的勇士！',
      '生死一搏！你们敢接招吗？',
      '全押！不疯魔不成活！'
    ]
  },
  {
    trigger: 'good-hand',
    messages: [
      '哈哈！这手牌来得正好！',
      '看来女神在眷顾我！',
      '绝佳的机会！准备收割了！'
    ]
  },
  {
    trigger: 'bad-hand',
    messages: [
      '垃圾牌？那就更刺激了！',
      '没关系，我有其他招数！',
      '谁说烂牌就不能赢？'
    ]
  },
  {
    trigger: 'win-hand',
    messages: [
      '哈哈！我就知道会是这样！',
      '胆大心细，这就是秘诀！',
      '又一次证明了勇气的价值！',
      '谢谢各位的慷慨！'
    ]
  },
  {
    trigger: 'lose-hand',
    messages: [
      '这次算你们运气好！',
      '没关系，下次我会拿回来的！',
      '暂时的挫折，不算什么！'
    ]
  },
  {
    trigger: 'opponent-passive',
    messages: [
      '太保守了，这样不会有大成就的！',
      '胆子再大一点嘛！',
      '生活需要一点冒险精神！'
    ]
  },
  {
    trigger: 'big-pot',
    messages: [
      '越大越刺激！我喜欢！',
      '大底池，大机会！',
      '这才是德州扑克的魅力！'
    ]
  }
]

// 数学型AI对话内容
const MATHEMATICAL_DIALOGUES: DialogueContent[] = [
  {
    trigger: 'game-start',
    messages: [
      '概率论和博弈论的实践时间到了。',
      '让我们用数学来解决问题。',
      '期望值计算开始。'
    ]
  },
  {
    trigger: 'hand-start',
    messages: [
      '计算起始手牌强度...',
      '分析位置优势和赔率...',
      '评估当前局面的数学期望。'
    ]
  },
  {
    trigger: 'fold',
    messages: [
      '负期望值，理性选择弃牌。',
      '数学告诉我这不是好的投资。',
      '底池赔率不足，弃牌。',
      '期望值计算结果：不跟注。'
    ]
  },
  {
    trigger: 'call',
    messages: [
      '底池赔率支持跟注决策。',
      '期望值为正，跟注。',
      '数学模型建议跟注。'
    ]
  },
  {
    trigger: 'raise',
    messages: [
      '根据期望值计算，加注是最优选择。',
      '手牌强度支持价值下注。',
      '数学期望为正，执行加注。',
      '最大化期望收益的决策。'
    ]
  },
  {
    trigger: 'good-hand',
    messages: [
      '手牌评分：优秀。期望胜率上升。',
      '统计数据显示这是有利局面。',
      '概率分布偏向我方。'
    ]
  },
  {
    trigger: 'bad-hand',
    messages: [
      '手牌强度低于平均值。',
      '胜率计算结果不乐观。',
      '等待更有利的统计条件。'
    ]
  },
  {
    trigger: 'win-hand',
    messages: [
      '概率预测准确，收益符合期望。',
      '数学模型验证成功。',
      '期望值实现转化为实际收益。'
    ]
  },
  {
    trigger: 'flop',
    messages: [
      '重新计算翻牌后的胜率...',
      '分析牌面结构和潜在听牌...',
      '更新概率模型。'
    ]
  },
  {
    trigger: 'turn',
    messages: [
      '转牌分析：计算剩余出牌概率。',
      '更新期望值计算。',
      '河牌概率分布更新。'
    ]
  },
  {
    trigger: 'river',
    messages: [
      '最终牌面确定，计算确切胜率。',
      '所有信息已知，执行最优策略。',
      '数学确定性达到最高。'
    ]
  },
  {
    trigger: 'big-pot',
    messages: [
      '大底池需要更精确的计算。',
      '风险-收益比值需要重新评估。',
      '调整决策模型参数。'
    ]
  },
  {
    trigger: 'opponent-aggressive',
    messages: [
      '对手策略偏激进，调整反制模型。',
      '激进型对手的行为模式已记录。',
      '更新对手行为概率分布。'
    ]
  }
]

// AI个性对话配置映射
const PERSONALITY_DIALOGUES: PersonalityDialogue[] = [
  {
    personality: 'conservative',
    dialogues: CONSERVATIVE_DIALOGUES
  },
  {
    personality: 'aggressive',
    dialogues: AGGRESSIVE_DIALOGUES
  },
  {
    personality: 'mathematical',
    dialogues: MATHEMATICAL_DIALOGUES
  },
  {
    personality: 'bluffer',
    dialogues: AGGRESSIVE_DIALOGUES // 暂时使用激进型的对话
  }
]

// 对话历史管理
const dialogueHistories: Map<string, DialogueHistory> = new Map()

// 获取AI对话内容
export function getAIDialogue(
  player: PokerPlayer,
  trigger: DialogueTrigger,
  gameContext: {
    gamePhase: PokerGamePhase
    potSize: number
    handStrength?: 'weak' | 'medium' | 'strong' | 'very_strong'
    totalChips: number
  }
): AIDialogueMessage | null {
  if (!player.isAI || !player.aiConfig) {
    return null
  }

  const { aiConfig } = player
  const { personality, chattiness } = aiConfig

  // 检查是否应该说话（基于聊天频率）
  if (Math.random() > chattiness) {
    return null
  }

  // 获取对话历史
  let history = dialogueHistories.get(player.id)
  if (!history) {
    history = {
      playerId: player.id,
      lastMessageTime: 0,
      messageCount: 0,
      recentTriggers: []
    }
    dialogueHistories.set(player.id, history)
  }

  // 防止过于频繁的对话（最少间隔30秒）
  const now = Date.now()
  if (now - history.lastMessageTime < 30000) {
    return null
  }

  // 防止重复相同触发器（最近3次内不重复）
  if (history.recentTriggers.includes(trigger) && 
      history.recentTriggers.slice(-3).includes(trigger)) {
    return null
  }

  // 寻找匹配的对话内容
  const personalityDialogue = PERSONALITY_DIALOGUES.find(pd => pd.personality === personality)
  if (!personalityDialogue) {
    return null
  }

  // 过滤符合条件的对话
  const suitableDialogues = personalityDialogue.dialogues.filter(dialogue => {
    if (dialogue.trigger !== trigger) {
      return false
    }

    if (dialogue.conditions) {
      const { conditions } = dialogue
      
      // 检查最低聊天频率要求
      if (conditions.minChattiness && chattiness < conditions.minChattiness) {
        return false
      }

      // 检查游戏阶段
      if (conditions.gamePhase && !conditions.gamePhase.includes(gameContext.gamePhase)) {
        return false
      }

      // 检查手牌强度
      if (conditions.handStrength && gameContext.handStrength && 
          !conditions.handStrength.includes(gameContext.handStrength)) {
        return false
      }

      // 检查底池大小
      if (conditions.potSize) {
        const potCategory = getPotSizeCategory(gameContext.potSize, gameContext.totalChips)
        if (potCategory !== conditions.potSize) {
          return false
        }
      }
    }

    return true
  })

  if (suitableDialogues.length === 0) {
    return null
  }

  // 随机选择一个对话内容
  const selectedDialogue = suitableDialogues[Math.floor(Math.random() * suitableDialogues.length)]
  const randomMessage = selectedDialogue.messages[Math.floor(Math.random() * selectedDialogue.messages.length)]

  // 更新历史记录
  history.lastMessageTime = now
  history.messageCount++
  history.recentTriggers.push(trigger)
  if (history.recentTriggers.length > 5) {
    history.recentTriggers.shift()
  }

  // 创建对话消息
  const dialogueMessage: AIDialogueMessage = {
    id: `dialogue-${player.id}-${now}`,
    playerId: player.id,
    playerName: player.name,
    message: randomMessage,
    trigger,
    timestamp: now,
    personality
  }

  return dialogueMessage
}

// 底池大小分类
function getPotSizeCategory(potSize: number, totalChips: number): 'small' | 'medium' | 'large' {
  const ratio = potSize / totalChips
  if (ratio < 0.1) return 'small'
  if (ratio < 0.3) return 'medium'
  return 'large'
}

// 重置对话历史（新游戏时调用）
export function resetDialogueHistory(): void {
  dialogueHistories.clear()
}

// 获取特定触发器的对话（用于测试）
export function getDialoguesByTrigger(
  personality: AIConfig['personality'], 
  trigger: DialogueTrigger
): string[] {
  const personalityDialogue = PERSONALITY_DIALOGUES.find(pd => pd.personality === personality)
  if (!personalityDialogue) {
    return []
  }

  const dialogue = personalityDialogue.dialogues.find(d => d.trigger === trigger)
  return dialogue?.messages || []
}

// 获取所有支持的触发器
export function getSupportedTriggers(personality: AIConfig['personality']): DialogueTrigger[] {
  const personalityDialogue = PERSONALITY_DIALOGUES.find(pd => pd.personality === personality)
  if (!personalityDialogue) {
    return []
  }

  return personalityDialogue.dialogues.map(d => d.trigger)
}