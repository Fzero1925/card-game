<template>
  <div class="language-switch">
    <button 
      class="lang-btn"
      :class="{ active: currentLang === 'zh-CN' }"
      @click="switchLanguage('zh-CN')"
    >
      中文
    </button>
    <button 
      class="lang-btn"
      :class="{ active: currentLang === 'en-US' }"
      @click="switchLanguage('en-US')"
    >
      English
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const currentLang = computed(() => locale.value)

const switchLanguage = (lang: 'zh-CN' | 'en-US') => {
  locale.value = lang
  localStorage.setItem('locale', lang)
  
  // 更新HTML lang属性
  document.documentElement.lang = lang
  
  // 更新页面标题
  const title = lang === 'zh-CN' ? '棋牌游戏平台' : 'Card Game Platform'
  document.title = title
}
</script>

<style lang="scss" scoped>
.language-switch {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.lang-btn {
  padding: $spacing-sm $spacing-md;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
  font-size: $font-sm;
  font-weight: 500;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.3);
    color: white;
    font-weight: 600;
  }
  
  &:first-child {
    border-right: 1px solid rgba(255, 255, 255, 0.2);
  }
}

// 响应式设计
@media (max-width: $breakpoint-sm) {
  .lang-btn {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-xs;
  }
}
</style>