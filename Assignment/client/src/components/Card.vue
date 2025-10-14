<template>
  <div
    class="card"
    :class="[
      cardColorClass,
      { 
        selected: isSelected,
        playable: canPlay && isMyTurn,
        disabled: !canPlay || !isMyTurn
      }
    ]"
    @click="handleClick"
  >
    <div class="card-content">
      <div class="card-value">{{ cardDisplay }}</div>
      <div v-if="card.type !== 'WILD CARD' && card.type !== 'WILD DRAW'" class="card-icon">
        {{ cardIcon }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '../../../model/interfaces'

const props = defineProps<{
  card: Card
  isSelected: boolean
  canPlay: boolean
  isMyTurn: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const cardColorClass = computed(() => {
  if ('color' in props.card) {
    return `card-${props.card.color.toLowerCase()}`
  }
  return 'card-wild'
})

const cardDisplay = computed(() => {
  const card = props.card
  
  if (card.type === 'NUMBERED') return card.number.toString()
  if (card.type === 'SKIP') return 'SKIP'
  if (card.type === 'REVERSE') return '⇄'
  if (card.type === 'DRAW CARD') return '+2'
  if (card.type === 'WILD CARD') return 'WILD'
  if (card.type === 'WILD DRAW') return '+4'
  
  return '?'
})

const cardIcon = computed(() => {
  const card = props.card
  
  if (card.type === 'SKIP') return '🚫'
  if (card.type === 'REVERSE') return '🔄'
  if (card.type === 'DRAW CARD') return '📥'
  
  return ''
})

function handleClick() {
  if (props.canPlay && props.isMyTurn) {
    emit('click')
  }
}
</script>

<style scoped>
.card {
  width: 100px;
  height: 150px;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.card-content {
  text-align: center;
}

.card-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.card-icon {
  font-size: 1.5rem;
  margin-top: 0.5rem;
}

/* Color classes */
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
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%, #ec4899 100%);
}

/* States */
.card.playable:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

.card.selected {
  transform: translateY(-15px);
  box-shadow: 0 0 20px rgba(255, 255, 0, 0.6);
  ring: 4px solid #fbbf24;
}

.card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card.disabled:hover {
  transform: none;
}
</style>