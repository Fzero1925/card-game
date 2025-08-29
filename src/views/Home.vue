<template>
  <div class="home-view">
    <!-- 页面头部 -->
    <header class="home-header">
      <div class="container">
        <div class="header-content">
          <div class="logo-section">
            <h1 class="logo">🃏 {{ $t('app.title') }}</h1>
            <p class="subtitle">{{ $t('app.subtitle') }}</p>
          </div>

          <div class="header-actions">
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </header>

    <!-- 游戏选择区域 -->
    <main class="games-section">
      <div class="container">
        <div class="games-grid">
          <!-- 21点游戏卡片 -->
          <div class="game-card blackjack-card">
            <div class="card-header">
              <div class="game-icon">🃏</div>
              <h2>{{ $t('games.blackjack.title') }}</h2>
            </div>

            <div class="card-body">
              <p>{{ $t('games.blackjack.description') }}</p>

              <div class="game-features">
                <div class="feature">
                  <span class="feature-icon">🎯</span>
                  <span>{{ $t('features.strategy') }}</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">🎲</span>
                  <span>{{ $t('features.realistic') }}</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">📱</span>
                  <span>{{ $t('features.responsive') }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <router-link to="/blackjack" class="play-btn primary">
                <span class="btn-icon">🎮</span>
                {{ $t('common.play') }}
              </router-link>
            </div>
          </div>

          <!-- 德州扑克游戏卡片 (开发中) -->
          <div class="game-card poker-card coming-soon">
            <div class="card-header">
              <div class="game-icon">🎰</div>
              <h2>{{ $t('games.texasHoldem.title') }}</h2>
              <span class="coming-soon-badge">{{ $t('common.comingSoon') }}</span>
            </div>

            <div class="card-body">
              <p>{{ $t('games.texasHoldem.description') }}</p>

              <div class="game-features">
                <div class="feature">
                  <span class="feature-icon">🤖</span>
                  <span>{{ $t('features.aiOpponents') }}</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">🧠</span>
                  <span>{{ $t('features.multiDifficulty') }}</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">💬</span>
                  <span>{{ $t('features.aiChat') }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button class="play-btn secondary disabled" disabled>
                <span class="btn-icon">🚧</span>
                {{ $t('common.inDevelopment') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页面底部 -->
    <footer class="home-footer">
      <div class="container">
        <div class="footer-content">
          <p>&copy; 2024 {{ $t('app.title') }}. {{ $t('common.allRightsReserved') }}</p>
          <div class="footer-links">
            <a
              href="https://github.com/Fzero1925/card-game"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import LanguageSwitch from '@/components/common/LanguageSwitch.vue'
</script>

<style lang="scss" scoped>
  .home-view {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  }

  .home-header {
    padding: $spacing-xl 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section {
      .logo {
        color: white;
        font-size: $font-3xl;
        font-weight: 700;
        margin: 0 0 $spacing-sm 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .subtitle {
        color: rgba(255, 255, 255, 0.9);
        font-size: $font-lg;
        margin: 0;
      }
    }
  }

  .games-section {
    flex: 1;
    padding: $spacing-2xl 0;
    display: flex;
    align-items: center;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: $spacing-2xl;
    max-width: 1000px;
    margin: 0 auto;
  }

  .game-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: $border-radius-xl;
    box-shadow: $shadow-xl;
    backdrop-filter: blur(10px);
    overflow: hidden;
    transition: all 0.3s;
    position: relative;

    &:hover:not(.coming-soon) {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    &.coming-soon {
      opacity: 0.8;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(0, 0, 0, 0.05) 10px,
          rgba(0, 0, 0, 0.05) 20px
        );
      }
    }

    .card-header {
      padding: $spacing-xl;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      text-align: center;
      position: relative;

      .game-icon {
        font-size: 4rem;
        margin-bottom: $spacing-md;
      }

      h2 {
        color: #333;
        font-size: $font-2xl;
        font-weight: 700;
        margin: 0;
      }

      .coming-soon-badge {
        position: absolute;
        top: $spacing-md;
        right: $spacing-md;
        background: $warning-color;
        color: #333;
        padding: $spacing-xs $spacing-sm;
        border-radius: $border-radius-lg;
        font-size: $font-xs;
        font-weight: 600;
        text-transform: uppercase;
      }
    }

    .card-body {
      padding: $spacing-xl;

      p {
        color: #666;
        font-size: $font-base;
        line-height: 1.6;
        margin-bottom: $spacing-lg;
      }

      .game-features {
        display: flex;
        flex-direction: column;
        gap: $spacing-sm;

        .feature {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          color: #555;

          .feature-icon {
            font-size: $font-lg;
          }
        }
      }
    }

    .card-footer {
      padding: $spacing-xl;
      padding-top: 0;

      .play-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-sm;
        width: 100%;
        padding: $spacing-lg;
        border: none;
        border-radius: $border-radius-lg;
        font-size: $font-lg;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s;

        .btn-icon {
          font-size: $font-xl;
        }

        &.primary {
          background: $primary-color;
          color: white;

          &:hover {
            background: darken($primary-color, 10%);
            transform: translateY(-2px);
            box-shadow: $shadow-lg;
          }
        }

        &.secondary {
          background: #6c757d;
          color: white;
        }

        &.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }

  .home-footer {
    padding: $spacing-xl 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: rgba(255, 255, 255, 0.8);

      p {
        margin: 0;
        font-size: $font-sm;
      }

      .footer-links {
        display: flex;
        gap: $spacing-md;

        a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: $font-sm;
          transition: color 0.2s;

          &:hover {
            color: white;
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: $breakpoint-lg) {
    .games-grid {
      grid-template-columns: 1fr;
      max-width: 500px;
    }
  }

  @media (max-width: $breakpoint-md) {
    .home-header {
      padding: $spacing-lg 0;

      .header-content {
        flex-direction: column;
        gap: $spacing-lg;
        text-align: center;
      }

      .logo-section .logo {
        font-size: $font-2xl;
      }
    }

    .games-section {
      padding: $spacing-xl 0;
    }

    .games-grid {
      gap: $spacing-xl;
    }

    .home-footer .footer-content {
      flex-direction: column;
      gap: $spacing-sm;
      text-align: center;
    }
  }

  @media (max-width: $breakpoint-sm) {
    .games-grid {
      grid-template-columns: 1fr;
    }

    .game-card {
      .card-header,
      .card-body,
      .card-footer {
        padding: $spacing-lg;
      }
    }
  }
</style>
