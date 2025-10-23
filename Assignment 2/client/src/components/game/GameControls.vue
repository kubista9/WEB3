<template>
  <div class="game-controls">
    <button
      @click="$emit('play')"
      class="btn btn-play"
      :disabled="!canPlay"
    >
      Play Card
    </button>
    <button
      @click="$emit('draw')"
      class="btn btn-draw"
      :disabled="!isMyTurn"
    >
      Draw Card
    </button>
    <button
      @click="$emit('uno')"
      class="btn btn-uno"
      :disabled="!canSayUno"
    >
      UNO!
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  canPlay: boolean
  isMyTurn: boolean
  canSayUno: boolean
}>()

defineEmits<{
  play: []
  draw: []
  uno: []
}>()
</script>

<style scoped>
.game-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-play {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-play:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-draw {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-draw:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-uno {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-uno:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}
</style>