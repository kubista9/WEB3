<template>
  <div class="card" :class="[cardColorClass,
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
