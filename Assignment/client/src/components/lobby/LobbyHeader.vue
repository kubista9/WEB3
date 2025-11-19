<template>
  <div class="lobby-header">
    <h1 class="lobby-title">Game Lobby</h1>
    <div class="user-info">
      <span class="username">{{ username }}</span>
      <button @click="$emit('logout')" class="btn-logout">Logout</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  username: string
}>()

defineEmits<{
  logout: []
}>()
</script>

<style scoped>
.lobby-header {
  max-width: 1400px;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-radius: 1rem;
}

.lobby-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

.btn-logout {
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(220, 38, 38, 0.9);
  transform: translateY(-2px);
}
</style>