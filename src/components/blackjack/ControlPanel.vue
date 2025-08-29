<template>
  <div class="control-panel">
    <!-- 游戏信息 -->
    <div class="game-info">
      <div class="info-item">
        <span class="label">{{ $t('games.blackjack.status.playerMoney') }}:</span>
        <span class="value money">${{ store.playerMoney }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ $t('games.blackjack.status.currentBet') }}:</span>
        <span class="value bet">${{ store.currentBet }}</span>
      </div>
    </div>

    <!-- 下注区域 -->
    <div class="betting-section" v-if="!store.gameInProgress">
      <h3>{{ $t('common.placeBet') }}</h3>
      <div class="bet-buttons">
        <button
          v-for="amount in betAmounts"
          :key="amount.value"
          class="bet-btn"
          :class="{ active: store.currentBet === getBetAmount(amount.value) }"
          :disabled="!canAffordBet(amount.value)"
          @click="handleBet(amount.value)"
        >
          {{ amount.label }}
        </button>
      </div>
    </div>

    <!-- 游戏控制 -->
    <div class="game-controls">
      <!-- 发牌按钮 -->
      <button
        v-if="!store.gameInProgress"
        class="control-btn primary large"
        :disabled="!store.canDeal"
        @click="store.executeAction('deal')"
      >
        <span class="btn-icon">🃏</span>
        {{ $t('games.blackjack.actions.deal') }}
      </button>

      <!-- 游戏中的操作按钮 -->
      <template v-else>
        <div class="action-buttons">
          <button
            class="control-btn"
            :disabled="!store.canHit"
            @click="store.executeAction('hit')"
          >
            <span class="btn-icon">🎯</span>
            {{ $t('games.blackjack.actions.hit') }}
          </button>
          
          <button
            class="control-btn"
            :disabled="!store.canStand"
            @click="store.executeAction('stand')"
          >
            <span class="btn-icon">✋</span>
            {{ $t('games.blackjack.actions.stand') }}
          </button>
          
          <button
            v-if="store.canDouble"
            class="control-btn warning"
            @click="store.executeAction('double')"
          >
            <span class="btn-icon">💰</span>
            {{ $t('games.blackjack.actions.double') }}
          </button>
        </div>
      </template>

      <!-- 新游戏按钮 -->
      <button
        class="control-btn secondary"
        @click="handleNewGame"
      >
        <span class="btn-icon">🔄</span>
        {{ $t('games.blackjack.actions.newGame') }}
      </button>
    </div>

    <!-- 游戏规则按钮 -->
    <button
      class="rules-btn"
      @click="showRules = !showRules"
    >
      <span class="btn-icon">❓</span>
      {{ $t('common.rules') }}
    </button>

    <!-- 规则弹窗 -->
    <div v-if="showRules" class="rules-modal" @click.self="showRules = false">
      <div class="rules-content">
        <div class="rules-header">
          <h2>{{ $t('games.blackjack.title') }} {{ $t('common.rules') }}</h2>
          <button @click="showRules = false" class="close-btn">×</button>
        </div>
        <div class="rules-body">
          <GameRules />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBlackjackStore } from '@/stores/blackjack'
import GameRules from './GameRules.vue'

const { t } = useI18n()
const store = useBlackjackStore()
const showRules = ref(false)

// 下注金额选项
const betAmounts = [
  { value: 10, label: '$10' },
  { value: 25, label: '$25' },
  { value: 50, label: '$50' },
  { value: 100, label: '$100' },
  { value: 'all', label: t('common.allIn') }
]

// 获取实际下注金额
const getBetAmount = (value: number | string): number => {
  return value === 'all' ? store.playerMoney : Number(value)
}

// 检查是否能负担得起这个下注
const canAffordBet = (value: number | string): boolean => {
  const amount = getBetAmount(value)
  return amount <= store.playerMoney
}

// 处理下注
const handleBet = (amount: number | string) => {
  store.placeBet(amount === 'all' ? 'all' : Number(amount))
}

// 新游戏确认
const handleNewGame = () => {
  if (store.gameInProgress) {
    if (confirm(t('common.confirmNewGame'))) {
      store.executeAction('new-game')
    }
  } else {
    store.executeAction('new-game')
  }
}

// 键盘快捷键
const handleKeyPress = (event: KeyboardEvent) => {
  if (showRules.value) return
  
  switch (event.key) {
    case ' ': // 空格 - 发牌
      if (store.canDeal) {
        event.preventDefault()
        store.executeAction('deal')
      }
      break
    case 'h': // H - 要牌
      if (store.canHit) {
        store.executeAction('hit')
      }
      break
    case 's': // S - 停牌
      if (store.canStand) {
        store.executeAction('stand')
      }
      break
    case 'd': // D - 加倍
      if (store.canDouble) {
        store.executeAction('double')
      }
      break
    case 'n': // N - 新游戏
      handleNewGame()
      break
    case 'r': // R - 规则
      showRules.value = !showRules.value
      break
  }
}

// 添加键盘监听
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
})
</script>

<style lang="scss" scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  padding: $spacing-lg;
  background: rgba(255, 255, 255, 0.95);
  border-radius: $border-radius-xl;
  box-shadow: $shadow-xl;
  backdrop-filter: blur(10px);
  min-width: 300px;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-sm;
    background: #f8f9fa;
    border-radius: $border-radius-md;
    
    .label {
      font-weight: 500;
      color: #6c757d;
    }
    
    .value {
      font-weight: bold;
      font-size: $font-lg;
      
      &.money {
        color: $success-color;
      }
      
      &.bet {
        color: $warning-color;
      }
    }
  }
}

.betting-section {
  h3 {
    margin-bottom: $spacing-md;
    color: #333;
    text-align: center;
  }
  
  .bet-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-sm;
    
    .bet-btn {
      padding: $spacing-sm $spacing-md;
      border: 2px solid #dee2e6;
      border-radius: $border-radius-md;
      background: white;
      color: #495057;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover:not(:disabled) {
        border-color: $primary-color;
        background: #f8f9ff;
      }
      
      &.active {
        border-color: $primary-color;
        background: $primary-color;
        color: white;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  
  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    padding: $spacing-md;
    border: none;
    border-radius: $border-radius-lg;
    font-weight: 600;
    font-size: $font-base;
    cursor: pointer;
    transition: all 0.2s;
    
    .btn-icon {
      font-size: $font-lg;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &.large {
      padding: $spacing-lg;
      font-size: $font-lg;
      
      .btn-icon {
        font-size: $font-2xl;
      }
    }
    
    &.primary {
      background: $primary-color;
      color: white;
      
      &:hover:not(:disabled) {
        background: darken($primary-color, 10%);
        transform: translateY(-2px);
        box-shadow: $shadow-lg;
      }
    }
    
    &.secondary {
      background: #6c757d;
      color: white;
      
      &:hover:not(:disabled) {
        background: darken(#6c757d, 10%);
      }
    }
    
    &.warning {
      background: $warning-color;
      color: #333;
      
      &:hover:not(:disabled) {
        background: darken($warning-color, 10%);
      }
    }
  }
  
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-sm;
    
    .control-btn:nth-child(3) {
      grid-column: 1 / -1;
    }
  }
}

.rules-btn {
  align-self: center;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  border: 1px solid #dee2e6;
  border-radius: $border-radius-md;
  background: white;
  color: #6c757d;
  font-size: $font-sm;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: $info-color;
    color: $info-color;
  }
}

.rules-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  
  .rules-content {
    background: white;
    border-radius: $border-radius-xl;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: $shadow-xl;
    animation: slideIn 0.3s ease;
    
    .rules-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-lg;
      border-bottom: 1px solid #dee2e6;
      background: #f8f9fa;
      
      h2 {
        margin: 0;
        color: #333;
      }
      
      .close-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: #dc3545;
        color: white;
        font-size: $font-xl;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          background: darken(#dc3545, 10%);
        }
      }
    }
    
    .rules-body {
      padding: $spacing-lg;
      max-height: 60vh;
      overflow-y: auto;
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .control-panel {
    min-width: auto;
    padding: $spacing-md;
  }
  
  .betting-section .bet-buttons {
    grid-template-columns: 1fr 1fr 1fr;
    font-size: $font-sm;
    
    .bet-btn:last-child {
      grid-column: 2;
    }
  }
  
  .game-controls .action-buttons {
    grid-template-columns: 1fr;
    
    .control-btn:nth-child(3) {
      grid-column: 1;
    }
  }
  
  .rules-modal .rules-content {
    margin: $spacing-md;
    max-width: none;
  }
}
</style>