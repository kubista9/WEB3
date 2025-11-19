<template>
  <div class="game-board">
    <div class="pile">
      <div
        v-if="topCard"
        class="card discard-card"
        :class="getCardColorClass(topCard)"
      >
        <div class="card-display">{{ getCardDisplay(topCard) }}</div>
      </div>
      <div v-else class="empty-pile">No cards</div>
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
  topCard: Card | null
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
.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  margin: 3rem 0;
}

.pile {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-pile {
  width: 120px;
  height: 180px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0.5;
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