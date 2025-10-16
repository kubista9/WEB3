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
