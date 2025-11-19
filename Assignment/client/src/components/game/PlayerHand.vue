<template>
  <div class="player-hand-section">
    <h3>Your Hand</h3>
    <div class="player-hand">
      <div
        v-for="(card, index) in cards"
        :key="index"
        class="card-wrapper"
        :class="{ selected: selectedIndex === index, disabled: !isMyTurn }"
        @click="$emit('select', index)"
      >
        <div class="card" :class="getCardColorClass(card)">
          <div class="card-display">{{ getCardDisplay(card) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Card {
  type: string
  color: string
  number?: number | null
}

defineProps<{
  cards: Card[]
  selectedIndex: number | null
  isMyTurn: boolean
}>()

defineEmits<{
  select: [index: number]
}>()

function getCardColorClass(card: Card) {
  if (!card || !card.color) return 'WILD'
  return card.color.toUpperCase()
}

function getCardDisplay(card: Card) {
  if (!card) return '?'
  
  if (card.type === 'NUMBER' && card.number !== undefined && card.number !== null) {
    return card.number.toString()
  }
  
  switch (card.type) {
    case 'SKIP':
      return 'SKIP'
    case 'REVERSE':
      return '⇄'
    case 'DRAW TWO':
      return '+2'
    case 'WILD CARD':
      return 'WILD CARD'
    case 'WILD DRAW':
      return '+4'
    default:
      return card.type || '?'
  }
}
</script>

<style scoped>
.player-hand-section {
  text-align: center;
  margin: 3rem 0;
}

.player-hand-section h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.player-hand {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.card-wrapper {
  cursor: pointer;
  transition: transform 0.2s;
}

.card-wrapper.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.card-wrapper.selected {
  transform: translateY(-20px);
}

.card-wrapper.selected .card {
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
}

.card {
  width: 120px;
  height: 180px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  font-weight: bold;
  color: white;
  font-size: 2rem;
}

.card.RED {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.card.BLUE {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.card.GREEN {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.card.YELLOW {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1f2937;
}

.card.WILD {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.card-display {
  font-size: 1.5rem;
  text-align: center;
}
</style>