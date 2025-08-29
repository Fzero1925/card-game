<template>
  <div class="texas-holdem-view">
    <!-- 顶部导航 -->
    <header class="game-header">
      <div class="header-left">
        <router-link to="/" class="back-btn">
          <span class="btn-icon">←</span>
          {{ $t('common.back') }}
        </router-link>
        <h1>{{ $t('games.texasHoldem.title') }}</h1>
      </div>

      <div class="header-center">
        <div class="game-info">
          <span class="hand-number">手牌 #{{ handNumber }}</span>
          <span class="phase-indicator">{{ $t(`poker.phases.${gamePhase}`) }}</span>
        </div>
      </div>

      <div class="header-right">
        <button 
          v-if="!gameInProgress" 
          @click="startNewHand" 
          class="new-game-btn"
        >
          {{ $t('poker.actions.startHand') }}
        </button>
        <LanguageSwitch />
      </div>
    </header>

    <!-- 德州扑克游戏主界面 -->
    <main class="game-main">
      <div class="poker-table">
        <!-- 游戏桌 -->
        <div class="table-surface">
          <!-- 玩家位置 -->
          <div 
            v-for="(player, index) in players" 
            :key="player.id"
            class="player-seat"
            :class="{
              'is-current': currentPlayerIndex === index,
              'is-dealer': player.position === 'dealer',
              'is-folded': player.isFolded,
              'is-all-in': player.isAllIn,
              'is-inactive': !player.isActive
            }"
            :style="getPlayerPosition(index)"
          >
            <!-- 玩家信息 -->
            <div class="player-info">
              <div class="player-avatar">
                <span class="avatar-text">{{ getPlayerInitial(player.name) }}</span>
                <div v-if="player.position === 'dealer'" class="dealer-chip">D</div>
              </div>
              <div class="player-details">
                <div class="player-name">{{ player.name }}</div>
                <div class="player-chips">{{ $t('poker.chips') }}: {{ player.chips }}</div>
              </div>
            </div>

            <!-- 玩家手牌 -->
            <div class="player-cards">
              <Card 
                v-for="(card, cardIndex) in player.holeCards"
                :key="`${player.id}-card-${cardIndex}`"
                :card="player.isAI ? undefined : card"
                :is-flipped="player.isAI"
                class="hole-card"
              />
            </div>

            <!-- 当前下注 -->
            <div v-if="player.currentBet > 0" class="current-bet">
              {{ player.currentBet }}
            </div>

            <!-- 行动指示器 -->
            <div v-if="currentPlayerIndex === index && isPlayerTurn" class="action-indicator">
              {{ $t('poker.yourTurn') }}
            </div>
          </div>

          <!-- 公共牌区域 -->
          <div class="community-cards">
            <h3>{{ $t('poker.communityCards') }}</h3>
            <div class="cards-row">
              <Card 
                v-for="(card, index) in communityCards"
                :key="`community-${index}`"
                :card="card"
                class="community-card"
              />
            </div>
          </div>

          <!-- 底池信息 -->
          <div class="pot-info">
            <div class="pot-amount">
              {{ $t('poker.pot') }}: {{ totalPot }}
            </div>
          </div>
        </div>

        <!-- 操作控制面板 -->
        <div v-if="isPlayerTurn" class="action-panel">
          <div class="action-buttons">
            <button 
              v-for="action in availableActions"
              :key="action"
              @click="handleAction(action)"
              class="action-btn"
              :class="`action-${action}`"
            >
              {{ $t(`poker.actions.${action}`) }}
            </button>
          </div>

          <!-- 加注控制 -->
          <div v-if="availableActions.includes('raise')" class="raise-control">
            <input 
              v-model.number="raiseAmount" 
              type="range" 
              :min="minRaiseAmount" 
              :max="maxRaiseAmount"
              class="raise-slider"
            />
            <div class="raise-info">
              <span>{{ $t('poker.raiseAmount') }}: {{ raiseAmount }}</span>
            </div>
          </div>
        </div>

        <!-- 游戏状态消息 -->
        <div v-if="gameMessage" class="game-message" :class="`message-${gameMessage.type}`">
          {{ gameMessage.message }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTexasHoldemStore } from '@/stores/texasHoldem'
import LanguageSwitch from '@/components/common/LanguageSwitch.vue'
import Card from '@/components/common/Card.vue'
import type { PokerAction, PokerPlayer } from '@/types/game'

const { t } = useI18n()
const store = useTexasHoldemStore()

// 从store获取状态
const {
  gameStatus,
  gamePhase,
  players,
  communityCards,
  currentPlayerIndex,
  handNumber,
  gameInProgress,
  totalPot,
  isPlayerTurn,
  gameMessage,
  humanPlayer,
  startNewHand
} = store

// 本地状态
const raiseAmount = ref(0)

// 计算属性
const availableActions = computed(() => {
  if (!humanPlayer) return []
  return store.getAvailableActions(humanPlayer)
})

const minRaiseAmount = computed(() => {
  if (!humanPlayer) return 0
  const callAmount = store.currentBet - humanPlayer.totalBetInRound
  return callAmount + store.minRaise
})

const maxRaiseAmount = computed(() => {
  if (!humanPlayer) return 0
  return humanPlayer.chips + humanPlayer.totalBetInRound
})

// 方法
const getPlayerPosition = (index: number) => {
  const positions = [
    { top: '70%', left: '50%', transform: 'translate(-50%, -50%)' }, // 玩家位置（底部）
    { top: '20%', left: '20%', transform: 'translate(-50%, -50%)' }, // AI 1（左上）
    { top: '10%', left: '50%', transform: 'translate(-50%, -50%)' }, // AI 2（上方）
    { top: '20%', left: '80%', transform: 'translate(-50%, -50%)' }  // AI 3（右上）
  ]
  return positions[index] || positions[0]
}

const getPlayerInitial = (name: string) => {
  return name.charAt(0).toUpperCase()
}

const handleAction = (action: PokerAction) => {
  if (action === 'raise') {
    store.playerAction(action, raiseAmount.value)
  } else {
    store.playerAction(action)
  }
}
</script>

<style lang="scss" scoped>
.texas-holdem-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f4c3a 0%, #2d5a3d 100%);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-lg;

    .back-btn {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      padding: $spacing-sm $spacing-md;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      text-decoration: none;
      border-radius: $border-radius-lg;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateX(-2px);
      }

      .btn-icon {
        font-size: $font-lg;
      }
    }

    h1 {
      color: white;
      margin: 0;
      font-size: $font-2xl;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }

  .header-center {
    .game-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: white;
      gap: $spacing-xs;

      .hand-number {
        font-size: $font-sm;
        opacity: 0.8;
      }

      .phase-indicator {
        font-size: $font-md;
        font-weight: 600;
        color: #ffd700;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .new-game-btn {
      padding: $spacing-sm $spacing-lg;
      background: #28a745;
      color: white;
      border: none;
      border-radius: $border-radius-lg;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #218838;
        transform: translateY(-1px);
      }
    }
  }
}

.game-main {
  flex: 1;
  padding: $spacing-lg;
  overflow: hidden;
}

.poker-table {
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 120px);
  position: relative;
}

.table-surface {
  width: 100%;
  height: 70%;
  background: radial-gradient(ellipse at center, #2d5016 0%, #1a4c3a 100%);
  border-radius: 50% / 40%;
  position: relative;
  border: 8px solid #8b4513;
  box-shadow: 
    inset 0 0 50px rgba(0, 0, 0, 0.3),
    0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: visible;
}

// 玩家位置
.player-seat {
  position: absolute;
  width: 160px;
  padding: $spacing-sm;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-lg;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &.is-current {
    border-color: #ffd700;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }

  &.is-folded {
    opacity: 0.5;
    filter: grayscale(1);
  }

  &.is-all-in {
    border-color: #ff6b6b;
    animation: pulse 2s infinite;
  }

  &.is-inactive {
    opacity: 0.3;
  }
}

.player-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;

  .player-avatar {
    position: relative;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: $font-lg;
    border: 3px solid rgba(255, 255, 255, 0.3);

    .dealer-chip {
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: #ffd700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $font-xs;
      font-weight: bold;
      color: #333;
    }
  }

  .player-details {
    flex: 1;
    color: white;

    .player-name {
      font-weight: 600;
      font-size: $font-sm;
      margin-bottom: $spacing-xs / 2;
    }

    .player-chips {
      font-size: $font-xs;
      opacity: 0.8;
    }
  }
}

.player-cards {
  display: flex;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;
  justify-content: center;

  .hole-card {
    width: 60px;
    height: 84px;
  }
}

.current-bet {
  text-align: center;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  padding: $spacing-xs;
  border-radius: $border-radius-sm;
  font-weight: bold;
  font-size: $font-sm;
  margin-bottom: $spacing-sm;
}

.action-indicator {
  text-align: center;
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  padding: $spacing-xs;
  border-radius: $border-radius-sm;
  font-weight: bold;
  font-size: $font-xs;
  animation: pulse 2s infinite;
}

// 公共牌区域
.community-cards {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;

  h3 {
    color: white;
    font-size: $font-md;
    margin-bottom: $spacing-sm;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  }

  .cards-row {
    display: flex;
    gap: $spacing-sm;
    justify-content: center;

    .community-card {
      width: 70px;
      height: 98px;
    }
  }
}

// 底池信息
.pot-info {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;

  .pot-amount {
    background: rgba(255, 215, 0, 0.2);
    color: #ffd700;
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-lg;
    font-weight: bold;
    font-size: $font-lg;
    border: 2px solid rgba(255, 215, 0, 0.3);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  }
}

// 操作控制面板
.action-panel {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  border-radius: $border-radius-lg $border-radius-lg 0 0;
  padding: $spacing-lg;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: none;
  min-width: 400px;

  .action-buttons {
    display: flex;
    gap: $spacing-sm;
    justify-content: center;
    margin-bottom: $spacing-md;

    .action-btn {
      padding: $spacing-sm $spacing-lg;
      border: none;
      border-radius: $border-radius-lg;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 80px;

      &.action-fold {
        background: #dc3545;
        color: white;

        &:hover {
          background: #c82333;
        }
      }

      &.action-check {
        background: #6c757d;
        color: white;

        &:hover {
          background: #5a6268;
        }
      }

      &.action-call {
        background: #28a745;
        color: white;

        &:hover {
          background: #218838;
        }
      }

      &.action-raise {
        background: #ffc107;
        color: #333;

        &:hover {
          background: #e0a800;
        }
      }

      &.action-all-in {
        background: #ff6b6b;
        color: white;

        &:hover {
          background: #ff5252;
        }
      }
    }
  }

  .raise-control {
    text-align: center;

    .raise-slider {
      width: 100%;
      margin-bottom: $spacing-sm;
    }

    .raise-info {
      color: white;
      font-size: $font-sm;
    }
  }
}

// 游戏消息
.game-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: $spacing-lg $spacing-2xl;
  border-radius: $border-radius-lg;
  font-weight: 600;
  font-size: $font-lg;
  z-index: 1000;
  animation: fadeInOut 3s ease-in-out;

  &.message-success {
    background: rgba(40, 167, 69, 0.9);
    color: white;
  }

  &.message-warning {
    background: rgba(255, 193, 7, 0.9);
    color: #333;
  }

  &.message-error {
    background: rgba(220, 53, 69, 0.9);
    color: white;
  }

  &.message-info {
    background: rgba(23, 162, 184, 0.9);
    color: white;
  }
}

// 动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0;
  }
  20%, 80% {
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: $breakpoint-lg) {
  .player-seat {
    width: 140px;
  }
  
  .action-panel {
    min-width: 350px;
  }
}

@media (max-width: $breakpoint-md) {
  .poker-table {
    height: calc(100vh - 100px);
  }
  
  .player-seat {
    width: 120px;
  }
  
  .player-cards .hole-card {
    width: 50px;
    height: 70px;
  }
  
  .community-cards .cards-row .community-card {
    width: 60px;
    height: 84px;
  }
  
  .action-panel {
    min-width: 300px;
    padding: $spacing-md;
  }
}

@media (max-width: $breakpoint-sm) {
  .game-header {
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-sm;
  }
  
  .table-surface {
    height: 60%;
  }
  
  .player-seat {
    width: 100px;
    padding: $spacing-xs;
  }
  
  .action-panel {
    min-width: 250px;
    
    .action-buttons {
      flex-wrap: wrap;
      
      .action-btn {
        min-width: 70px;
        font-size: $font-sm;
      }
    }
  }
}
</style>