<template>
  <div class="section create-game-section">
    <h2 class="section-title">Create New Game</h2>
    <div class="create-game-form">
      <div class="form-group">
        <label class="form-label">Game Name</label>
        <input
          v-model="gameName"
          type="text"
          class="form-input"
          placeholder="Enter game name"
        />
      </div>
      <div class="form-group">
        <label class="form-label">Max Players</label>
        <select v-model.number="maxPlayers" class="form-select">
          <option :value="2">2 Players</option>
          <option :value="3">3 Players</option>
          <option :value="4">4 Players</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Target Score</label>
        <input
          v-model.number="targetScore"
          type="number"
          class="form-input"
          placeholder="500"
          min="100"
          step="50"
        />
      </div>
      <button
        @click="handleCreate"
        class="btn btn-primary"
        :disabled="!canCreate"
      >
        <span class="btn-icon">🎮</span>
        <span>Create Game</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const gameName = ref('')
const maxPlayers = ref(4)
const targetScore = ref(500)

const canCreate = computed(() => {
  return (
    gameName.value.trim().length > 0 &&
    maxPlayers.value >= 2 &&
    targetScore.value >= 100
  )
})

const emit = defineEmits<{
  create: [name: string, maxPlayers: number, targetScore: number]
}>()

function handleCreate() {
  if (!canCreate.value) return
  emit('create', gameName.value, maxPlayers.value, targetScore.value)
  gameName.value = ''
  maxPlayers.value = 4
  targetScore.value = 500
}
</script>

<style scoped>
.section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.create-game-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  font-size: 1.5rem;
}
</style>