<template>
  <div
    class="card-wrapper"
    :class="{
      'is-flipped': isFlipped,
      'is-hidden': isHidden,
      'is-highlighted': isHighlighted
    }"
    @click="handleClick"
  >
    <div class="card-inner">
      <!-- 卡牌正面 -->
      <div class="card-front">
        <div class="card-corner top-left">
          <span class="rank">{{ card?.rank || '' }}</span>
          <span class="suit">{{ card?.suit || '' }}</span>
        </div>
        <div class="card-center">
          <span class="suit-large">{{ card?.suit || '' }}</span>
        </div>
        <div class="card-corner bottom-right">
          <span class="rank">{{ card?.rank || '' }}</span>
          <span class="suit">{{ card?.suit || '' }}</span>
        </div>
      </div>
      
      <!-- 卡牌背面 -->
      <div class="card-back">
        <div class="card-back-pattern"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card as CardType } from '@/types/game'

interface Props {
  card?: CardType
  isHidden?: boolean
  isFlipped?: boolean
  isHighlighted?: boolean
  clickable?: boolean
}

interface Emits {
  (e: 'click', card: CardType | undefined): void
}

const props = withDefaults(defineProps<Props>(), {
  isHidden: false,
  isFlipped: false,
  isHighlighted: false,
  clickable: false
})

const emit = defineEmits<Emits>()

const isRedSuit = computed(() => {
  return props.card?.suit === '♥' || props.card?.suit === '♦'
})

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.card)
  }
}
</script>

<style lang="scss" scoped>
.card-wrapper {
  width: 80px;
  height: 112px;
  perspective: 1000px;
  cursor: default;
  
  &.clickable {
    cursor: pointer;
  }
  
  &.is-highlighted {
    transform: translateY(-5px);
    filter: brightness(1.1);
  }
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  
  .is-flipped & {
    transform: rotateY(180deg);
  }
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: $border-radius-md;
  border: 1px solid $card-border;
  box-shadow: $shadow-sm;
}

.card-front {
  background: $card-bg;
  color: #333;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px;
  
  .card-corner {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    
    &.bottom-right {
      align-self: flex-end;
      transform: rotate(180deg);
    }
    
    .rank {
      font-size: 12px;
      font-weight: bold;
      color: v-bind('isRedSuit ? "#dc3545" : "#333"');
    }
    
    .suit {
      font-size: 10px;
      color: v-bind('isRedSuit ? "#dc3545" : "#333"');
    }
  }
  
  .card-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .suit-large {
      font-size: 24px;
      color: v-bind('isRedSuit ? "#dc3545" : "#333"');
    }
  }
}

.card-back {
  background: linear-gradient(45deg, #1e40af, #3730a3);
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .card-back-pattern {
    width: 80%;
    height: 80%;
    background: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.1) 4px,
      transparent 4px,
      transparent 8px
    );
    border-radius: $border-radius-sm;
  }
}

.is-hidden .card-front {
  visibility: hidden;
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .card-wrapper {
    width: 60px;
    height: 84px;
  }
  
  .card-front {
    padding: 4px;
    
    .card-corner {
      .rank {
        font-size: 10px;
      }
      
      .suit {
        font-size: 8px;
      }
    }
    
    .card-center .suit-large {
      font-size: 18px;
    }
  }
}
</style>