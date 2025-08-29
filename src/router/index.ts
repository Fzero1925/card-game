import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '游戏大厅'
    }
  },
  {
    path: '/blackjack',
    name: 'Blackjack',
    component: () => import('@/views/Blackjack.vue'),
    meta: {
      title: '21点'
    }
  },
  {
    path: '/texas-holdem',
    name: 'TexasHoldem',
    component: () => import('@/views/TexasHoldem.vue'),
    meta: {
      title: '德州扑克'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || '棋牌游戏平台'} | Card Game Platform`
})

export default router