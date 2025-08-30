<template>
  <div class="ai-dialogue-panel" :class="{ 'panel-visible': isVisible }">
    <div class="dialogue-header">
      <h4 class="dialogue-title">
        <i class="dialogue-icon">💬</i>
        {{ $t('texas.dialogue.title') }}
      </h4>
      <button 
        @click="togglePanel" 
        class="toggle-btn"
        :title="isVisible ? $t('texas.dialogue.hide') : $t('texas.dialogue.show')"
      >
        <i :class="isVisible ? 'icon-chevron-down' : 'icon-chevron-up'">
          {{ isVisible ? '▼' : '▲' }}
        </i>
      </button>
    </div>

    <div class="dialogue-content" v-show="isVisible">
      <div class="message-list" ref="messageList">
        <transition-group name="message" tag="div">
          <div
            v-for="message in displayMessages"
            :key="message.id"
            class="message-item"
            :class="`personality-${message.personality}`"
          >
            <div class="message-avatar">
              <span class="avatar-icon">{{ getPersonalityIcon(message.personality) }}</span>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="player-name">{{ message.playerName }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
              <div class="message-text">{{ message.message }}</div>
            </div>
          </div>
        </transition-group>

        <!-- 空状态显示 -->
        <div v-if="displayMessages.length === 0" class="empty-state">
          <i class="empty-icon">🤖</i>
          <p class="empty-text">{{ $t('texas.dialogue.waiting') }}</p>
        </div>
      </div>

      <div class="dialogue-controls">
        <button 
          @click="clearMessages" 
          class="clear-btn"
          :disabled="messages.length === 0"
        >
          <i class="icon-clear">🗑️</i>
          {{ $t('texas.dialogue.clear') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import type { AIDialogueMessage } from '@/types/game'

// Props
interface Props {
  messages: AIDialogueMessage[]
  maxMessages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxMessages: 20
})

// Emits
const emit = defineEmits<{
  clearMessages: []
}>()

// 响应式状态
const isVisible = ref(true)
const messageList = ref<HTMLElement>()

// 计算属性
const displayMessages = computed(() => {
  // 只显示最近的消息，避免列表过长
  return props.messages.slice(-props.maxMessages)
})

// 方法
const togglePanel = () => {
  isVisible.value = !isVisible.value
}

const clearMessages = () => {
  emit('clearMessages')
}

const getPersonalityIcon = (personality: string): string => {
  const icons = {
    conservative: '🛡️',
    aggressive: '⚔️',
    mathematical: '🧮',
    bluffer: '🎭'
  }
  return icons[personality as keyof typeof icons] || '🤖'
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
}

// 监听消息变化，自动滚动
watch(
  () => props.messages,
  () => {
    if (isVisible.value) {
      scrollToBottom()
    }
  },
  { deep: true }
)

// 面板打开时滚动到底部
watch(isVisible, (newValue) => {
  if (newValue) {
    scrollToBottom()
  }
})
</script>

<style scoped lang="scss">
.ai-dialogue-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  max-height: 400px;
  background: rgba(20, 30, 40, 0.95);
  border: 1px solid #4a5568;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 1000;
  transition: all 0.3s ease;

  &.panel-visible {
    .dialogue-content {
      max-height: 350px;
    }
  }
}

.dialogue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #4a5568;
  background: rgba(30, 40, 50, 0.8);
  border-radius: 12px 12px 0 0;

  .dialogue-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    gap: 8px;

    .dialogue-icon {
      font-size: 16px;
    }
  }

  .toggle-btn {
    background: none;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
    }

    .icon-chevron-down,
    .icon-chevron-up {
      font-size: 12px;
      display: block;
    }
  }
}

.dialogue-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.message-list {
  max-height: 280px;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  animation: fadeInUp 0.3s ease;

  &.personality-conservative {
    .message-avatar {
      background: linear-gradient(135deg, #4299e1, #3182ce);
    }
  }

  &.personality-aggressive {
    .message-avatar {
      background: linear-gradient(135deg, #f56565, #e53e3e);
    }
  }

  &.personality-mathematical {
    .message-avatar {
      background: linear-gradient(135deg, #48bb78, #38a169);
    }
  }

  &.personality-bluffer {
    .message-avatar {
      background: linear-gradient(135deg, #ed8936, #dd6b20);
    }
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  .avatar-icon {
    font-size: 16px;
    line-height: 1;
  }
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;

  .player-name {
    font-size: 12px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .message-time {
    font-size: 10px;
    color: #a0aec0;
    opacity: 0.7;
  }
}

.message-text {
  font-size: 13px;
  line-height: 1.4;
  color: #cbd5e0;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 10px;
  border-radius: 8px;
  border-left: 3px solid var(--personality-color, #4a5568);
  word-wrap: break-word;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #a0aec0;

  .empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
    display: block;
  }

  .empty-text {
    font-size: 14px;
    margin: 0;
    opacity: 0.7;
  }
}

.dialogue-controls {
  padding: 8px 12px;
  border-top: 1px solid #4a5568;
  background: rgba(30, 40, 50, 0.5);

  .clear-btn {
    width: 100%;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid #4a5568;
    border-radius: 6px;
    color: #a0aec0;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
      border-color: #718096;
      color: #e2e8f0;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .icon-clear {
      font-size: 12px;
    }
  }
}

// 动画效果
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .ai-dialogue-panel {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    max-height: none;
    margin-bottom: 16px;
    border-radius: 8px;

    .dialogue-content {
      max-height: none !important;

      .message-list {
        max-height: 200px;
      }
    }
  }
}
</style>