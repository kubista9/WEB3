<template>
  <div class="game-header">
    <h1>UNO Game</h1>
    <div class="header-info">
      <div>
        <span class="label">Current Player:</span>
        <span class="value">{{ currentPlayerName }}</span>
      </div>
      <div>
        <span class="label">Your Cards:</span>
        <span class="value">{{ cardCount }}</span>
      </div>
    </div>
    <button @click="$emit('leave')" class="btn-danger">Leave Game</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPlayerName: string
  cardCount: number
}>()

defineEmits<{
  leave: []
}>()
</script>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  color: white;
}

.game-header h1 {
  margin: 0;
  font-size: 2rem;
}

.header-info {
  display: flex;
  gap: 2rem;
}

.label {
  font-size: 0.875rem;
  opacity: 0.8;
  display: block;
}

.value {
  font-size: 1.25rem;
  font-weight: bold;
  display: block;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
}
</style>