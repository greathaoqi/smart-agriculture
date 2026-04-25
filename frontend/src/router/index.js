import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores/user'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'farms',
        name: 'Farms',
        component: () => import('@/views/farm/Index.vue'),
        meta: { title: '农场管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'plots',
        name: 'Plots',
        component: () => import('@/views/plot/Index.vue'),
        meta: { title: '地块管理', icon: 'Location' }
      },
      {
        path: 'devices',
        name: 'Devices',
        component: () => import('@/views/device/Index.vue'),
        meta: { title: '设备管理', icon: 'Monitor' }
      },
      {
        path: 'planting',
        name: 'Planting',
        component: () => import('@/views/planting/Index.vue'),
        meta: { title: '种植管理', icon: 'Sunrise' }
      },
      {
        path: 'warehouse',
        name: 'Warehouse',
        component: () => import('@/views/warehouse/Index.vue'),
        meta: { title: '仓储管理', icon: 'Box' }
      },
      {
        path: 'sales',
        name: 'Sales',
        component: () => import('@/views/sales/Index.vue'),
        meta: { title: '销售管理', icon: 'ShoppingCart' }
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/system/Layout.vue'),
        redirect: '/system/users',
        meta: { title: '系统设置', icon: 'Setting' },
        children: [
          {
            path: 'users',
            name: 'Users',
            component: () => import('@/views/system/Users.vue'),
            meta: { title: '用户管理', icon: 'User' }
          },
          {
            path: 'roles',
            name: 'Roles',
            component: () => import('@/views/system/Roles.vue'),
            meta: { title: '角色管理', icon: 'UserFilled' }
          },
          {
            path: 'logs',
            name: 'Logs',
            component: () => import('@/views/system/Logs.vue'),
            meta: { title: '操作日志', icon: 'Document' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  NProgress.start()

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 智慧农业管理平台` : '智慧农业管理平台'

  const userStore = useUserStore()
  const token = userStore.token || localStorage.getItem('token')

  if (to.path === '/login') {
    if (token) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    if (!token) {
      next('/login')
    } else {
      next()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
