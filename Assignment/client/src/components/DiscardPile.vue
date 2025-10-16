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
</style>