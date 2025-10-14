<template>
  <div class="game-controls">
    <div class="control-panel">
      <div class="main-controls">
        <button
          @click="$emit('playCard')"
          :disabled="!isMyTurn || selectedCardIndex === null"
          class="btn btn-play"
          :class="{ disabled: !isMyTurn || selectedCardIndex === null }"
        >
          <span class="btn-icon">🎴</span>
          <div class="btn-content">
            <span class="btn-text">Play Card</span>
            <span class="btn-hint" v-if="selectedCardIndex !== null">Selected card ready</span>
          </div>
        </button>
        
        <button
          @click="$emit('drawCard')"
          :disabled="!isMyTurn"
          class="btn btn-draw"
          :class="{ disabled: !isMyTurn }"
        >
          <span class="btn-icon">📥</span>
          <div class="btn-content">
            <span class="btn-text">Draw Card</span>
            <span class="btn-hint" v-if="isMyTurn">From deck</span>
          </div>
        </button>
        
        <button
          @click="$emit('sayUno')"
          :disabled="!canSayUno"
          class="btn btn-uno"
          :class="{ 
            disabled: !canSayUno,
            'btn-uno-pulse': canSayUno 
          }"
        >
          <span class="btn-icon">🎯</span>
          <div class="btn-content">
            <span class="btn-text">Say UNO!</span>
            <span class="btn-hint" v-if="canSayUno">Required!</span>
          </div>
        </button>
      </div>

      <!-- Turn Status -->
      <div class="turn-status">
        <div v-if="isMyTurn" class="status-indicator my-turn">
          <div class="status-dot"></div>
          <span class="status-text">Your Turn</span>
        </div>
        <div v-else class="status-indicator waiting">
          <div class="spinner-small"></div>
          <span class="status-text">Waiting for other players...</span>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat">
          <span class="stat-label">Selected:</span>
          <span class="stat-value">
            {{ selectedCardIndex !== null ? 'Card ' + (selectedCardIndex + 1) : 'None' }}
          </span>
        </div>
        <div class="stat">
          <span class="stat-label">UNO Status:</span>
          <span class="stat-value" :class="{ alert: canSayUno }">
            {{ canSayUno ? 'Say UNO!' : 'Ready' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isMyTurn: boolean
  canSayUno: boolean
  selectedCardIndex: number | null
  showColorPicker: boolean
}>()

defineEmits<{
  playCard: []
  drawCard: []
  sayUno: []
}>()
</script>

<style scoped>
.game-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.8));
  backdrop-filter: blur(15px);
  padding: 1.5rem;
  border-top: 3px solid rgba(251, 191, 36, 0.3);
  z-index: 100;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
}

.control-panel {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  min-width: 180px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:not(.disabled):hover::before {
  width: 300px;
  height: 300px;
}

.btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  font-size: 2rem;
  z-index: 1;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
}

.btn-text {
  font-size: 1.125rem;
  line-height: 1;
}

.btn-hint {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.btn-play {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-play:not(.disabled):hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(16, 185, 129, 0.5);
}

.btn-draw {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.btn-draw:not(.disabled):hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(59, 130, 246, 0.5);
}

.btn-uno {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  position: relative;
}

.btn-uno:not(.disabled):hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(245, 158, 11, 0.5);
}

.btn-uno-pulse {
  animation: uno-pulse 1.5s infinite;
}

@keyframes uno-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(245, 158, 11, 0);
  }
}

.turn-status {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.25rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-indicator.my-turn {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 2px solid rgba(16, 185, 129, 0.5);
}

.status-indicator.waiting {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  border: 2px solid rgba(156, 163, 175, 0.3);
}

.status-dot {
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(156, 163, 175, 0.3);
  border-top-color: #9ca3af;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.status-text {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.quick-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
  display: flex;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  font-weight: 700;
  color: white;
}

.stat-value.alert {
  color: #fbbf24;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .main-controls {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .quick-stats {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}
</style>