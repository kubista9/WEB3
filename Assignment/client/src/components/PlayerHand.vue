<template>
  <div class="player-hand">
    <TransitionGroup name="card" tag="div" class="card-container">
      <div
        v-for="(card, index) in cards"
        :key="`${index}-${cardKey(card)}`"
        class="card-wrapper"
      >
        <Card
          :card="card"
          :is-selected="selectedIndex === index"
          :can-play="canPlayCard(index)"
          :is-my-turn="isMyTurn"
          @click="$emit('selectCard', index)"
        />
        <div v-if="canPlayCard(index) && isMyTurn" class="playable-indicator">
          <span class="indicator-icon">✓</span>
        </div>
      </div>
    </TransitionGroup>
    
    <div v-if="cards.length === 0" class="empty-hand">
      <div class="empty-icon">🎉</div>
      <div class="empty-text">No cards in hand!</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from './Card.vue'
import { Card as CardType } from '../../../model/interfaces'

defineProps<{
  cards: readonly CardType[]
  selectedIndex: number | null
  canPlayCard: (index: number) => boolean
  isMyTurn: boolean
}>()

defineEmits<{
  selectCard: [index: number]
}>()

function cardKey(card: CardType): string {
  if (card.type === 'NUMBERED') {
    return `${card.type}-${card.color}-${card.number}`
  }
  if ('color' in card) {
    return `${card.type}-${card.color}`
  }
  return `${card.type}-${Math.random()}`
}
</script>