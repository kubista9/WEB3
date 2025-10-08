<template>
  <div class="game-board">
    <div class="board-container">
      <!-- Draw Pile -->
      <div class="pile-section">
        <div class="pile-label">Draw Pile</div>
        <div 
          class="draw-pile" 
          @click="handleDrawClick"
          :class="{ clickable: canDraw, disabled: !canDraw }"
        >
          <div class="card-stack">
            <div 
              v-for="n in Math.min(stackCount, 3)" 
              :key="n"
              class="card-back"
              :style="{ 
                transform: `translateY(-${n * 2}px) translateX(${n * 2}px)`,
                zIndex: 3 - n
              }"
            >
              <div class="card-pattern">
                <div class="pattern-line" v-for="i in 5" :key="i"></div>
              </div>
              <div class="uno-logo">UNO</div>
            </div>
          </div>
          <div class="deck-count">{{ deckSize }}</div>
          <div v-if="canDraw" class="draw-hint">Click to draw</div>
        </div>
      </div>

      <!-- Center Game Info -->
      <div class="center-area">
        <div class="game-info-panel">
          <!-- Current Color Indicator -->
          <div class="current-color-section">
            <div class="info-label">Current Color</div>
            <div class="color-display">
              <div class="color-circle" :class="`color-${currentColorDisplay}`">
                <div class="color-pulse"></div>
              </div>
              <span class="color-name">{{ currentColorDisplay }}</span>
            </div>
          </div>

          <!-- Direction Indicator -->
          <div class="direction-section">
            <div class="info-label">Direction</div>
            <div class="direction-display">
              <div class="direction-arrow" :class="direction">
                {{ directionArrow }}
              </div>
              <span class="direction-name">{{ directionLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Discard Pile -->
      <div class="pile-section">
        <div class="pile-label">Discard Pile</div>
        <DiscardPile :top-card="topCard" />
        <div class="pile-count">{{ discardCount }} cards</div>
      </div>
    </div>

    <!-- Game Stats Bar -->
    <div class="game-stats-bar">
      <div class="stat-item">
        <span class="stat-icon">🎴</span>
        <span class="stat-value">{{ totalCardsInPlay }}</span>
        <span class="stat-label">Cards in Play</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🔄</span>
        <span class="stat-value">{{ turnCount }}</span>
        <span class="stat-label">Turns</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DiscardPile from './DiscardPile.vue'
import { Card, Direction } from '../../../model/interfaces'

const props = defineProps<{
  topCard?: Card
  deckSize: number
  currentColor: string
  direction: Direction
  canDraw: boolean
  discardCount?: number
  turnCount?: number
}>()

const emit = defineEmits<{
  drawCard: []
}>()

const stackCount = computed(() => Math.min(props.deckSize, 5))

const currentColorDisplay = computed(() => props.currentColor.toLowerCase())

const directionArrow = computed(() => {
  return props.direction === 'clockwise' ? '↻' : '↺'
})

const directionLabel = computed(() => {
  return props.direction === 'clockwise' ? 'Clockwise' : 'Counter-Clockwise'
})

const totalCardsInPlay = computed(() => {
  return props.deckSize + (props.discardCount || 1)
})

function handleDrawClick() {
  if (props.canDraw) {
    emit('drawCard')
  }
}
</script>

<style scoped>
.game-board {
  padding: 2rem;
  min-height: 400px;
}

.board-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.pile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pile-label {
  color: white;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.draw-pile {
  position: relative;
  transition: transform 0.2s;
}

.draw-pile.clickable {
  cursor: pointer;
}

.draw-pile.clickable:hover {
  transform: scale(1.05);
}

.draw-pile.clickable:active {
  transform: scale(0.98);
}

.draw-pile.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-stack {
  position: relative;
  width: 130px;
  height: 190px;
}

.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 3px solid #1e293b;
  overflow: hidden;
}

.card-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.pattern-line {
  position: absolute;
  width: 200%;
  height: 2px;
  background: white;
  transform: rotate(-45deg);
}

.pattern-line:nth-child(1) { top: 20%; }
.pattern-line:nth-child(2) { top: 40%; }
.pattern-line:nth-child(3) { top: 60%; }
.pattern-line:nth-child(4) { top: 80%; }
.pattern-line:nth-child(5) { top: 100%; }

.uno-logo {
  position: relative;
  z-index: 1;
  font-size: 2rem;
  font-weight: 900;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.2em;
}

.deck-count {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1f2937;
  padding: 0.35rem 0.75rem;
  border-radius: 1rem;
  font-weight: 800;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
  z-index: 10;
}

.draw-hint {
  position: absolute;
  bottom: -2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(251, 191, 36, 0.9);
  color: #1f2937;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

.pile-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 600;
}

.center-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-info-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  min-width: 200px;
}

.current-color-section,
.direction-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.info-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-circle {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: 0 0 20px currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
}

.color-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  animation: pulse-color 2s ease-in-out infinite;
}

@keyframes pulse-color {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
}

.color-circle.color-red { background: #ef4444; }
.color-circle.color-blue { background: #3b82f6; }
.color-circle.color-green { background: #10b981; }
.color-circle.color-yellow { background: #f59e0b; }

.color-name {
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
  text-transform: uppercase;
}

.direction-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.direction-arrow {
  font-size: 3rem;
  color: #fbbf24;
  animation: rotate-pulse 2s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.direction-arrow.clockwise {
  animation: spin-clockwise 3s linear infinite;
}

.direction-arrow.counterclockwise {
  animation: spin-counterclockwise 3s linear infinite;
}

@keyframes spin-clockwise {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-counterclockwise {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.direction-name {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.game-stats-bar {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fbbf24;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .board-container {
    flex-direction: column;
    gap: 2rem;
  }
  
  .game-stats-bar {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>