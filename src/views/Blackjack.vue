<template>
  <div class="blackjack-view">
    <!-- 顶部导航 -->
    <header class="game-header">
      <div class="header-left">
        <router-link to="/" class="back-btn">
          <span class="btn-icon">←</span>
          {{ $t('common.back') }}
        </router-link>
        <h1>{{ $t('games.blackjack.title') }}</h1>
      </div>

      <div class="header-right">
        <LanguageSwitch />
      </div>
    </header>

    <!-- 游戏主体 -->
    <main class="game-main">
      <div class="game-content">
        <!-- 游戏板 -->
        <div class="game-board-container">
          <GameBoard />
        </div>

        <!-- 控制面板 -->
        <div class="control-panel-container">
          <ControlPanel />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useBlackjackStore } from '@/stores/blackjack'
  import GameBoard from '@/components/blackjack/GameBoard.vue'
  import ControlPanel from '@/components/blackjack/ControlPanel.vue'
  import LanguageSwitch from '@/components/common/LanguageSwitch.vue'

  const store = useBlackjackStore()

  // 组件挂载时初始化
  onMounted(() => {
    // 如果需要的话，可以在这里重置游戏状态
    // store.newGame()
  })
</script>

<style lang="scss" scoped>
  .blackjack-view {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
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

    .header-right {
      display: flex;
      align-items: center;
      gap: $spacing-md;
    }
  }

  .game-main {
    flex: 1;
    padding: $spacing-lg;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .game-content {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: $spacing-xl;
    max-width: 1400px;
    width: 100%;
    height: 80vh;
    min-height: 600px;
  }

  .game-board-container {
    min-height: 0; // 允许flex子项收缩
  }

  .control-panel-container {
    width: 320px;
    min-width: 320px;
  }

  // 响应式设计
  @media (max-width: $breakpoint-lg) {
    .game-content {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
      gap: $spacing-lg;
      height: auto;
    }

    .control-panel-container {
      width: 100%;
      min-width: auto;
    }
  }

  @media (max-width: $breakpoint-md) {
    .game-header {
      padding: $spacing-sm $spacing-md;

      .header-left {
        gap: $spacing-md;

        h1 {
          font-size: $font-xl;
        }

        .back-btn {
          padding: $spacing-xs $spacing-sm;
          font-size: $font-sm;
        }
      }
    }

    .game-main {
      padding: $spacing-md;
    }

    .game-content {
      gap: $spacing-md;
    }
  }

  @media (max-width: $breakpoint-sm) {
    .game-header .header-left .back-btn .btn-icon {
      display: none;
    }

    .game-main {
      padding: $spacing-sm;
    }
  }
</style>
