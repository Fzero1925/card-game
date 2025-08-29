<template>
  <div class="blackjack-board">
    <!-- 庄家区域 -->
    <div class="dealer-section">
      <div class="player-info">
        <h2>{{ $t('games.blackjack.status.dealerScore') }}</h2>
        <span class="score">({{ store.visibleDealerScore }})</span>
      </div>
      <div class="cards-area">
        <Card
          v-for="(card, index) in store.dealerCards"
          :key="`dealer-${index}`"
          :card="card"
          :is-hidden="store.dealerHidden && index === 1"
          class="card-item"
          :style="{ '--index': index }"
        />
      </div>
    </div>

    <!-- 游戏消息 -->
    <div class="game-center">
      <div v-if="store.gameMessage" class="game-message" :class="store.gameMessage.type">
        {{ $t(store.gameMessage.message) }}
      </div>

      <div class="deck-info" v-if="store.needsReshuffling">
        <span class="deck-warning"> {{ $t('common.lowCards') }} ({{ store.remainingCards }}) </span>
      </div>
    </div>

    <!-- 玩家区域 -->
    <div class="player-section">
      <div class="player-info">
        <h2>{{ $t('games.blackjack.status.playerScore') }}</h2>
        <span class="score">({{ store.playerScore }})</span>
      </div>
      <div class="cards-area">
        <Card
          v-for="(card, index) in store.playerCards"
          :key="`player-${index}`"
          :card="card"
          class="card-item"
          :style="{ '--index': index }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useBlackjackStore } from '@/stores/blackjack'
  import Card from '@/components/common/Card.vue'

  const store = useBlackjackStore()
</script>

<style lang="scss" scoped>
  .blackjack-board {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: $spacing-lg;
    background: radial-gradient(ellipse at center, #0f5132 0%, #0a4427 100%);
    border-radius: $border-radius-xl;
    box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.3);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 60%;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      pointer-events: none;
    }
  }

  .dealer-section,
  .player-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .dealer-section {
    justify-content: flex-start;
    padding-top: $spacing-lg;
  }

  .player-section {
    justify-content: flex-end;
    padding-bottom: $spacing-lg;
  }

  .player-info {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
    color: white;

    h2 {
      font-size: $font-lg;
      font-weight: 600;
      margin: 0;
    }

    .score {
      font-size: $font-xl;
      font-weight: bold;
      color: #ffd700;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }
  }

  .cards-area {
    display: flex;
    gap: -$spacing-md; // 重叠效果
    align-items: center;
    perspective: 1000px;

    .card-item {
      transform: translateX(calc(var(--index) * -20px)) rotateY(calc(var(--index) * -2deg))
        translateZ(calc(var(--index) * 5px));
      transition: all 0.3s ease;
      z-index: calc(10 + var(--index));

      &:hover {
        transform: translateX(calc(var(--index) * -20px)) rotateY(calc(var(--index) * -2deg))
          translateZ(calc(var(--index) * 5px)) translateY(-10px);
        z-index: 20;
      }
    }
  }

  .game-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    min-height: 100px;
    position: relative;
    z-index: 1;
  }

  .game-message {
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-lg;
    font-weight: 600;
    font-size: $font-lg;
    text-align: center;
    animation: fadeIn 0.5s ease;
    box-shadow: $shadow-lg;

    &.info {
      background: rgba(23, 162, 184, 0.9);
      color: white;
    }

    &.success {
      background: rgba(40, 167, 69, 0.9);
      color: white;
    }

    &.warning {
      background: rgba(255, 193, 7, 0.9);
      color: #333;
    }

    &.error {
      background: rgba(220, 53, 69, 0.9);
      color: white;
    }
  }

  .deck-info {
    .deck-warning {
      color: #ffc107;
      font-size: $font-sm;
      font-weight: 500;
      text-shadow: 0 0 5px rgba(255, 193, 7, 0.3);
    }
  }

  // 动画
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  // 响应式设计
  @media (max-width: $breakpoint-md) {
    .blackjack-board {
      padding: $spacing-md;
    }

    .player-info h2 {
      font-size: $font-base;
    }

    .player-info .score {
      font-size: $font-lg;
    }

    .cards-area {
      gap: -$spacing-sm;

      .card-item {
        transform: translateX(calc(var(--index) * -15px));
      }
    }

    .game-message {
      font-size: $font-base;
      padding: $spacing-xs $spacing-md;
    }
  }

  @media (max-width: $breakpoint-sm) {
    .cards-area {
      gap: -$spacing-xs;

      .card-item {
        transform: translateX(calc(var(--index) * -10px));
      }
    }
  }
</style>
