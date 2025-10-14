<template>
  <div class="discard-pile">
    <div v-if="topCard" class="top-card" :class="cardColorClass">
      <div class="card-content">
        <div class="card-value">{{ cardDisplay }}</div>
        <div v-if="showIcon" class="card-icon">{{ cardIcon }}</div>
      </div>
      <div v-if="'color' in topCard" class="card-color-corner top-left">
        {{ cardDisplay }}
      </div>
      <div v-if="'color' in topCard" class="card-color-corner bottom-right">
        {{ cardDisplay }}
      </div>
    </div>
    <div v-else class="empty-pile">
      <div class="empty-icon">🎴</div>
      <div class="empty-text">Empty</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '../../../model/interfaces'

const props = defineProps<{
  topCard?: Card
}>()

const cardColorClass = computed(() => {
  if (!props.topCard) return ''
  if ('color' in props.topCard) {
    return `card-${props.topCard.color.toLowerCase()}`
  }
  return 'card-wild'
})

const cardDisplay = computed(() => {
  if (!props.topCard) return ''
  const card = props.topCard
  
  if (card.type === 'NUMBERED') return card.number.toString()
  if (card.type === 'SKIP') return 'SKIP'
  if (card.type === 'REVERSE') return '⇄'
  if (card.type === 'DRAW CARD') return '+2'
  if (card.type === 'WILD CARD') return 'WILD'
  if (card.type === 'WILD DRAW') return '+4'
  
  return '?'
})

const cardIcon = computed(() => {
  if (!props.topCard) return ''
  const card = props.topCard
  
  if (card.type === 'SKIP') return '🚫'
  if (card.type === 'REVERSE') return '🔄'
  if (card.type === 'DRAW CARD') return '📥'
  if (card.type === 'WILD CARD') return '🌈'
  if (card.type === 'WILD DRAW') return '⚡'
  
  return ''
})

const showIcon = computed(() => {
  if (!props.topCard) return false
  return ['SKIP', 'REVERSE', 'DRAW CARD', 'WILD CARD', 'WILD DRAW'].includes(props.topCard.type)
})
</script>

<style scoped>
.discard-pile {
  perspective: 1000px;
  position: relative;
}

.top-card {
  width: 120px;
  height: 180px;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: rotate(12deg);
  animation: cardPlace 0.3s ease-out;
  position: relative;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

@keyframes cardPlace {
  from {
    transform: rotate(0deg) translateY(-50px) scale(0.8);
    opacity: 0;
  }
  to {
    transform: rotate(12deg) translateY(0) scale(1);
    opacity: 1;
  }
}

.card-content {
  text-align: center;
  z-index: 2;
}

.card-value {
  font-size: 3rem;
  font-weight: 900;
  color: white;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  line-height: 1;
}

.card-icon {
  font-size: 2rem;
  margin-top: 0.5rem;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.card-color-corner {
  position: absolute;
  font-size: 1rem;
  font-weight: 800;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.card-color-corner.top-left {
  top: 0.5rem;
  left: 0.5rem;
}

.card-color-corner.bottom-right {
  bottom: 0.5rem;
  right: 0.5rem;
  transform: rotate(180deg);
}

.card-red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.card-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.card-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.card-yellow {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.card-wild {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 33%, #ec4899 66%, #f59e0b 100%);
  animation: rainbow-pulse 3s ease-in-out infinite;
}

@keyframes rainbow-pulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}

.empty-pile {
  width: 120px;
  height: 180px;
  border: 3px dashed rgba(255, 255, 255, 0.4);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style>