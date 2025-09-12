import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: () => import('../views/LandingPage/HomePage.vue'),
    },
    {
      path: '/about',
      name: 'AboutPage',
      component: () => import('../views/LandingPage/AboutPage.vue'),
    },
    {
      path: '/dashboard',
      name: 'DashboardPage',
      component: () => import('../views/Dashboard/HomeDashboard.vue'),
    },
  ],
})

export default router
