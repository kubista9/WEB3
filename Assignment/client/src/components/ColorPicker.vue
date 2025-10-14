<template>
  <div class="color-picker-overlay" @click="$emit('close')">
    <div class="color-picker" @click.stop>
      <h3>Choose a Color</h3>
      <div class="color-options">
        <button
          v-for="color in colors"
          :key="color"
          :class="`color-btn color-${color.toLowerCase()}`"
          @click="$emit('selectColor', color)"
        >
          {{ color }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Color } from '../../../model/interfaces'

const colors: Color[] = ['RED', 'BLUE', 'GREEN', 'YELLOW']

defineEmits<{
  selectColor: [color: Color]
  close: []
}>()
</script>

<style scoped>
.color-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.color-picker {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.color-picker h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.color-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.color-btn {
  padding: 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-btn:hover {
  transform: scale(1.05);
}

.color-red {
  background: #ef4444;
}

.color-blue {
  background: #3b82f6;
}

.color-green {
  background: #10b981;
}

.color-yellow {
  background: #f59e0b;
}
</style>