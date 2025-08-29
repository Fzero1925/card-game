<template>
  <div class="game-rules">
    <div class="rules-section">
      <h3>🎯 {{ $t('rules.objective.title') }}</h3>
      <p>{{ $t('rules.objective.content') }}</p>
    </div>

    <div class="rules-section">
      <h3>🃏 {{ $t('rules.cardValues.title') }}</h3>
      <ul>
        <li><strong>A</strong>: {{ $t('rules.cardValues.ace') }}</li>
        <li><strong>2-10</strong>: {{ $t('rules.cardValues.numbers') }}</li>
        <li><strong>J, Q, K</strong>: {{ $t('rules.cardValues.faces') }}</li>
      </ul>
      <div class="ace-details">
        <p><strong>{{ $t('rules.cardValues.aceDetails') }}</strong>: {{ $t('rules.cardValues.aceDetailsDesc') }}</p>
      </div>
    </div>

    <div class="rules-section">
      <h3>🎮 {{ $t('rules.gameplay.title') }}</h3>
      <ol>
        <li>{{ $t('rules.gameplay.step1') }}</li>
        <li>{{ $t('rules.gameplay.step2') }}</li>
        <li>
          {{ $t('rules.gameplay.step3') }}
          <ul>
            <li>
              <strong>{{ $t('games.blackjack.actions.hit') }}</strong
              >: {{ $t('rules.actions.hit') }}
            </li>
            <li>
              <strong>{{ $t('games.blackjack.actions.stand') }}</strong
              >: {{ $t('rules.actions.stand') }}
            </li>
            <li>
              <strong>{{ $t('games.blackjack.actions.double') }}</strong
              >: {{ $t('rules.actions.double') }}
            </li>
          </ul>
        </li>
        <li>{{ $t('rules.gameplay.step4') }}</li>
        <li>{{ $t('rules.gameplay.step5') }}</li>
      </ol>
    </div>

    <div class="rules-section">
      <h3>🏆 {{ $t('rules.special.title') }}</h3>
      <ul>
        <li>
          <strong>{{ $t('rules.special.blackjack') }}</strong
          >: {{ $t('rules.special.blackjackDesc') }}
        </li>
        <li>
          <strong>{{ $t('rules.special.bust') }}</strong
          >: {{ $t('rules.special.bustDesc') }}
        </li>
        <li>
          <strong>{{ $t('rules.special.dealerRule') }}</strong
          >: {{ $t('rules.special.dealerRuleDesc') }}
        </li>
        <li>
          <strong>{{ $t('rules.special.softSeventeen') }}</strong
          >: {{ $t('rules.special.softSeventeenDesc') }}
        </li>
      </ul>
    </div>

    <div class="rules-section">
      <h3>💰 {{ $t('rules.payouts.title') }}</h3>
      <ul>
        <li>
          <strong>{{ $t('rules.payouts.win') }}</strong
          >: {{ $t('rules.payouts.winDesc') }}
        </li>
        <li>
          <strong>{{ $t('rules.payouts.blackjack') }}</strong
          >: {{ $t('rules.payouts.blackjackDesc') }}
        </li>
        <li>
          <strong>{{ $t('rules.payouts.tie') }}</strong
          >: {{ $t('rules.payouts.tieDesc') }}
        </li>
        <li>
          <strong>{{ $t('rules.payouts.lose') }}</strong
          >: {{ $t('rules.payouts.loseDesc') }}
        </li>
      </ul>
    </div>

    <div class="rules-section">
      <h3>⌨️ {{ $t('rules.shortcuts.title') }}</h3>
      <div class="shortcuts-grid">
        <div class="shortcut-item">
          <kbd>Space</kbd>
          <span>{{ $t('games.blackjack.actions.deal') }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>H</kbd>
          <span>{{ $t('games.blackjack.actions.hit') }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>S</kbd>
          <span>{{ $t('games.blackjack.actions.stand') }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>D</kbd>
          <span>{{ $t('games.blackjack.actions.double') }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>N</kbd>
          <span>{{ $t('games.blackjack.actions.newGame') }}</span>
        </div>
        <div class="shortcut-item">
          <kbd>R</kbd>
          <span>{{ $t('common.rules') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 无需特殊逻辑，只是展示规则
</script>

<style lang="scss" scoped>
  .game-rules {
    color: #333;
    line-height: 1.6;
  }

  .rules-section {
    margin-bottom: $spacing-lg;

    h3 {
      color: $primary-color;
      margin-bottom: $spacing-md;
      font-size: $font-lg;
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }

    p {
      margin-bottom: $spacing-sm;
      color: #555;
    }

    ul,
    ol {
      margin-left: $spacing-lg;
      margin-bottom: $spacing-sm;

      li {
        margin-bottom: $spacing-xs;
        color: #555;

        strong {
          color: #333;
        }

        ul {
          margin-top: $spacing-xs;
          margin-left: $spacing-md;

          li {
            list-style-type: disc;
            color: #666;
          }
        }
      }
    }
  }

  .ace-details {
    margin-top: $spacing-md;
    padding: $spacing-sm $spacing-md;
    background: rgba($primary-color, 0.1);
    border-left: 3px solid $primary-color;
    border-radius: $border-radius-sm;

    p {
      margin: 0;
      color: #444;
      font-size: $font-sm;
      line-height: 1.5;
    }
  }

  .shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-sm;
    margin-top: $spacing-md;

    .shortcut-item {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      padding: $spacing-xs $spacing-sm;
      background: #f8f9fa;
      border-radius: $border-radius-md;
      border: 1px solid #dee2e6;

      kbd {
        display: inline-block;
        padding: $spacing-xs $spacing-sm;
        background: #e9ecef;
        border: 1px solid #adb5bd;
        border-radius: $border-radius-sm;
        font-family: monospace;
        font-size: $font-sm;
        font-weight: bold;
        color: #495057;
        min-width: 32px;
        text-align: center;
      }

      span {
        font-size: $font-sm;
        color: #6c757d;
      }
    }
  }

  // 响应式设计
  @media (max-width: $breakpoint-md) {
    .rules-section {
      ul,
      ol {
        margin-left: $spacing-md;
      }
    }

    .shortcuts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
