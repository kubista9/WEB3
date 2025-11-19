import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/Auth.vue')
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: () => import('../views/Lobby.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/game/:id',
      name: 'game',
      component: () => import('../views/Game.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/game/:id/overview',
      name: 'overview',
      component: () => import('../views/GameOverview.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth')
  } else {
    next()
  }
})

export default router