import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import fetchCurrentUser from '@/utils/fetchCurrentUser'

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
          meta: {
            visitor: true, // visitor - Accessible to everyone
            title: "Home"
          }
        },
        {
          path: 'about',
          name: 'AboutPage',
          component: () => import('../views/LandingPage/AboutPage.vue'),
          meta: {
            visitor: true,
            title: "About"
          }
        },
        {
          path: 'contact',
          name: 'ContactPage',
          component: () => import('../views/LandingPage/ContactPage.vue'),
          meta: {
            visitor: true,
            title: "Contact"
          }
        },
        {
          path: 'privacy-policy',
          name: 'PrivacyPolicyPage',
          component: () => import('../views/PrivacyPolicyView.vue'),
          meta: {
            visitor: true,
            title: "Privacy Policy"
          }
        },
        {
          path: 'terms-of-service',
          name: 'TermsOfServicePage',
          component: () => import('../views/TermsOfServiceView.vue'),
          meta: {
            visitor: true,
            title: "Terms of Service"
          }
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
          meta: {
            requiresAuth: true,
            title: "Dashboard Page"
          }
        },
        {
          path: '/sample-page',
          name: 'SamplePage',
          component: () => import('../views/Dashboard/SamplePage.vue'),
          meta: {
            requiresAuth: true,
            title: "Sample Page"
          }
        },
        {
          path: '/user-profile',
          name: 'UserProfilePage',
          component: () => import('../views/Dashboard/UserProfilePage.vue'),
          meta: {
            requiresAuth: true,
            title: "Profile"
          }
        },
        {
          path: '/user-profile/:userId',
          name: 'UserProfileByIdPage',
          component: () => import('../views/Dashboard/UserProfilePage.vue'),
          meta: {
            requiresAuth: true,
            title: "Profile"
          }
        },
        {
          path: '/change-password',
          name: 'ChangePasswordPage',
          component: () => import('../views/Dashboard/ChangePasswordView.vue'),
          meta: {
            requiresAuth: true,
            title: "Change Password"
          }
        },

        // Admin routes
        {
          path: 'manage/courses',
          name: 'AdminCoureseViewPage',
          component: () => import('../views/Dashboard/Admin/CourseView.vue'),
          meta: {
            requiresAuth: true,
            requiresRole: "Admin",
            title: "Admin Course Page"
          }
        },
        {
          path: 'manage/users',
          name: 'AdminUsersViewPage',
          component: () => import('../views/Dashboard/Admin/Users/UsersView.vue'),
          meta: {
            requiresAuth: true,
            requiresRole: "Admin",
            title: "Mange Users"
          }
        },
        {
          path: 'manage/users/send-invite',
          name: 'AdminUserSendInvitePage',
          component: () => import('../views/Dashboard/Admin/Users/SendInviteView.vue'),
          meta: {
            requiresAuth: true,
            requiresRole: "Admin",
            title: "Admin Send Invite Page"
          }
        },


        // User routes
        {
          path: 'courses',
          name: 'UserCoureseViewPage',
          component: () => import('../views/Dashboard/User/UserCourseView.vue'),
          meta: {
            requiresAuth: true,
            requiresRole: "User",
            title: "User Course Page"
          }
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
          meta: {
            unauthorized: true,
            title: "Login"
          }
        },
        {
          path: '/registration',
          name: 'RegisterPage',
          component: () => import('../views/Auth/RegisterView.vue'),
          meta: {
            unauthorized: true,
            title: "Register"
          }
        },
        {
          path: '/complete-profile',
          name: 'CompleteProfilePage',
          component: () => import('../views/Auth/CompleteProfileView.vue'),
          meta: {
            requiresAuth: true,
            requiresProfileCompletion: false,
            title: "Complete Profile"
          }
        },
        {
          path: '/forget-password',
          name: 'ForgetPasswordPage',
          component: () => import('../views/Auth/ForgetPasswordView.vue'),
          meta: {
            unauthorized: true,
            title: "Forget Password"
          }
        },
        {
          path: '/reset-password',
          name: 'ResetPasswordView',
          component: () => import('../views/Auth/ResetPasswordView.vue'),
          meta: {
            unauthorized: true,
            title: "Reset Password"
          }
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: "NotFound",
      component: () => import('../views/Errors/NotFound.vue'),
      meta: {
        title: "404 Not Found"
      }
    }
  ],
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const token = localStorage.getItem("lm-access-token");

  if (to.meta.title) {
    document.title = `${to.meta.title} - LM Academy`
  }

  const isAuthenticated = !!token
  let user = userStore.user

  console.log('Navigation Guard', {
    to: to.name,
    isAuthenticated,
    hasUser: Object.keys(user).length > 0,
    userRole: user?.roles?.[0]?.name
  });

  if (isAuthenticated && Object.keys(user).length == 0) {
    console.log("Fetching user data ... ");
    try {
      const userData = await fetchCurrentUser();
      if (userData) {
        userStore.setUser(userData)
        user = userData
      } else {
        userStore.logout(true)
      }

    } catch (error) {
      console.error("Error fetching user: ", error);
      userStore.logout(true)
    }
  }

  // Route protection logic
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresRole = to.meta.requiresRole
  const isUnauthorizedRoute = to.meta.unauthorized
  const isVisitorRoute = to.meta.visitor
  // for complete-profile the requiresProfileCompletion is false otherwise it's true
  const requiresProfileCompletion = to.meta.requiresProfileCompletion !== false



  console.log('Route protection', {
    requiresAuth,
    requiresRole,
    isUnauthorizedRoute,
    isVisitorRoute
  });

  // 1. Handle unauthorized routes (login, register, etc.)
  if (isUnauthorizedRoute) {
    if (isAuthenticated) {
      // User is logged in but trying to access auth pages
      console.log("User is logged in, redirecting to dashboard");
      return next({ name: "DashboardPage" })
    }
    // User is not logged in, allow access to auth pages
    return next()
  }

  // 2. Handle routes that require authentication
  if (requiresAuth) {
    if (!isAuthenticated) {
      console.log("Rutes requires auth, redirecting to login")
      return next({ name: "LoginPage" });
    }

    if (requiresProfileCompletion && to.name !== "CompleteProfilePage" &&
      (user?.profile_completed === false || user?.profile_completed === 0)
    ) {
      console.log("Profile not completed, redirecting to complete profile page")
      return next({ name: "CompleteProfilePage" })
    }


    if (to.name === "CompleteProfilePage" && (user?.profile_completed === true || user?.profile_completed === 1)) {
      console.log("Profile already completed, redirecting to dashboard");
      return next({ name: "DashboardPage" })
    }

    if (requiresRole) {
      const userRole = user?.roles?.[0]?.name

      if (userRole !== requiresRole) {
        console.log(`Route requires ${requiresRole} role, user has ${userRole} role`)

        if (userRole === 'Admin') {
          return next({ name: "DashboardPage" })
        }
        else if (userRole === 'User') {
          return next({ name: "DashboardPage" })
        }
        else {
          return next({ name: "DashboardPage" })
        }
      }
    }
    // User is authenticated and has the required role
    return next()
  }

  //  3. Handle visitor routes (accessible to everyone)
  if (isVisitorRoute) {
    return next();
  }

  // 4. Default case - allow navigation
  return next();
})

export default router
