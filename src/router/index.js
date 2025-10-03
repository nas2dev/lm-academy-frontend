import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'DefaultLayout',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'HomePage',
          component: () => import('../views/LandingPage/HomePage.vue'),
        },
        {
          path: 'about',
          name: 'AboutPage',
          component: () => import('../views/LandingPage/AboutPage.vue'),
        },
        {
          path: 'contact',
          name: 'ContactPage',
          component: () => import('../views/LandingPage/ContactPage.vue'),
        },
        {
          path: 'privacy-policy',
          name: 'PrivacyPolicyPage',
          component: () => import('../views/PrivacyPolicyView.vue'),
        },
        {
          path: 'terms-of-service',
          name: 'TermsOfServicePage',
          component: () => import('../views/TermsOfServiceView.vue'),
        }
      ]
    },
    {
      path: "/dashboard",
      name: "DashboardLayout",
      component: () => import("../layouts/DashboardLayout.vue"),
      children: [
        {
          path: '',
          name: 'DashboardPage',
          component: () => import('../views/Dashboard/HomeDashboard.vue'),
        },
        {
          path: '/sample-page',
          name: 'SamplePage',
          component: () => import('../views/Dashboard/SamplePage.vue'),
        },

        // Admin routes
        {
          path: 'manage/courses',
          name: 'AdminCoureseViewPage',
          component: () => import('../views/Dashboard/Admin/CourseView.vue'),
        },


        // User routes
        {
          path: 'courses',
          name: 'UserCoureseViewPage',
          component: () => import('../views/Dashboard/User/UserCourseView.vue'),
        },
      ]
      // krejt routes qe kan / perpara jon routes absolute
    },
    {
      path: "/auth",
      name: "AuthLayout",
      component: () => import("../layouts/AuthLayout.vue"),
      children: [
        {
          path: '/login',
          name: 'LoginPage',
          component: () => import('../views/Auth/LoginView.vue'),
        },
        {
          path: '/register',
          name: 'RegisterPage',
          component: () => import('../views/Auth/RegisterView.vue'),
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: "NotFound",
      component: () => import('../views/Errors/NotFound.vue')
    }
  ],
})

export default router
