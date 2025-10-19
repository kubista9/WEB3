<template>
  <TransitionGroup name="notification" tag="div" class="notifications">
    <div
      v-for="(notification, index) in notifications"
      :key="index"
      class="notification"
    >
      {{ notification }}
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const notifications = ref<string[]>([])

function addNotification(message: string) {
  notifications.value.push(message)
  setTimeout(() => {
    notifications.value.shift()
  }, 3000)
}

defineExpose({ addNotification })
</script>

<style scoped>
.notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.notification {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>