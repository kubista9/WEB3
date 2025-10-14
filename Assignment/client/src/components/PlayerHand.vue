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

<style scoped>
.player-hand {
  display: flex;
  justify-content: center;
  padding: 1rem;
  min-height: 200px;
}

.card-container {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
}

.card-wrapper {
  position: relative;
}

.playable-indicator {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
  animation: bounce-indicator 1s ease-in-out infinite;
  z-index: 10;
  border: 2px solid white;
}

@keyframes bounce-indicator {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.indicator-icon {
  color: white;
  font-weight: 900;
  font-size: 1rem;
}

.empty-hand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.25rem;
  font-weight: 600;
}

.card-enter-active,
.card-leave-active {
  transition: all 0.5s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.5) rotate(10deg);
}

.card-leave-to {
  opacity: 0;
  transform: translateY(-50px) scale(0.5) rotate(-10deg);
}

.card-move {
  transition: transform 0.5s ease;
}

@media (max-width: 640px) {
  .card-container {
    gap: 0.25rem;
  }
}
</style>