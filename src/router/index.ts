// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import { useAdminStore } from '@/stores/admin-user.store'
import {
      DataLine,        // 数据统计图标 
      ShoppingCart,    // 订单管理图标
      User,            // 管理员图标
      Tickets,         // 分类管理图标
      Picture,         // 图片管理图标
      SemiSelect,      // 规格管理图标
      Goods,           // 商品管理图标
      PictureFilled,   // Banner管理图标
      UserFilled       // 用户管理图标
} from '@element-plus/icons-vue'

// 路由配置
const routes: RouteRecordRaw[] = [
      {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/login/index.vue'),
            meta: {
                  requiresAuth: false,
                  hideInMenu: true
            }
      },
      {
            path: '/',
            component: DefaultLayout,
            redirect: '/dashboard',
            meta: { requiresAuth: true },
            children: [
                  {
                        path: '/dashboard',
                        name: 'Dashboard',
                        component: () => import('@/views/dashboard/index.vue'),
                        meta: {
                              requiresAuth: true,
                              title: '控制台',
                              icon: DataLine,
                              showInMenu: true
                        }
                  },
                  {
                        path: '/order',
                        name: 'Order',
                        component: () => import('@/views/order/index.vue'),
                        meta: {
                              requiresAuth: true,
                              requireSuper: true,
                              title: '订单管理',
                              icon: ShoppingCart,
                              showInMenu: (_route: RouteRecordRaw) => {
                                    const adminStore = useAdminStore()
                                    return adminStore.currentAdmin?.isSuper || false
                              }
                        }
                  },
                  {
                        path: '/admin',
                        name: 'Admin',
                        component: () => import('@/views/admin/manage.vue'),
                        meta: {
                              requiresAuth: true,
                              requireSuper: true,
                              title: '管理员',
                              icon: User,
                              showInMenu: (_route: RouteRecordRaw) => {
                                    const adminStore = useAdminStore()
                                    return adminStore.currentAdmin?.isSuper || false
                              }
                        }
                  },
                  {
                        path: '/category',
                        name: 'Category',
                        component: () => import('@/views/category/index.vue'),
                        meta: {
                              requiresAuth: true,
                              requireSuper: true,
                              title: '分类管理',
                              icon: Tickets,
                              showInMenu: (_route: RouteRecordRaw) => {
                                    const adminStore = useAdminStore()
                                    return adminStore.currentAdmin?.isSuper || false
                              }
                        }
                  },
                  {
                        path: '/image',
                        name: 'Image',
                        component: () => import('@/views/image/index.vue'),
                        meta: {
                              requiresAuth: true,
                              requireSuper: true,
                              title: '图片管理',
                              icon: Picture,
                              showInMenu: (_route: RouteRecordRaw) => {
                                    const adminStore = useAdminStore()
                                    return adminStore.currentAdmin?.isSuper || false
                              }
                        }
                  },
                  {
                        path: '/spec',
                        name: 'Spec',
                        component: () => import('@/views/spec/index.vue'),
                        meta: {
                              requiresAuth: true,
                              requireSuper: true,
                              title: '规格管理',
                              icon: SemiSelect,
                              showInMenu: (_route: RouteRecordRaw) => {
                                    const adminStore = useAdminStore()
                                    return adminStore.currentAdmin?.isSuper || false
                              }
                        }
                  },
                  {
                        path: '/product',
                        name: 'Product',
                        component: () => import('@/views/product/index.vue'),
                        meta: {
                              requiresAuth: true,
                              requireSuper: true,
                              title: '商品管理',
                              icon: Goods,
                              showInMenu: (_route: RouteRecordRaw) => {
                                    const adminStore = useAdminStore()
                                    return adminStore.currentAdmin?.isSuper || false
                              }
                        }
                  },
                  {
                        path: '/banner',
                        name: 'Banner',
                        component: () => import('@/views/banner/index.vue'),
                        meta: {
                              requiresAuth: true,
                              requireSuper: true,
                              title: 'Banner管理',
                              icon: PictureFilled,
                              showInMenu: (_route: RouteRecordRaw) => {
                                    const adminStore = useAdminStore()
                                    return adminStore.currentAdmin?.isSuper || false
                              }
                        }
                  },
                  {
                        path: '/user-manage',
                        name: 'UserManage.',
                        component: () => import('@/views/user/user-manage.vue'),
                        meta: {
                              requiresAuth: true,
                              requireSuper: true,
                              title: '用户管理',
                              icon: UserFilled,
                              showInMenu: (_route: RouteRecordRaw) => {
                                    const adminStore = useAdminStore()
                                    return adminStore.currentAdmin?.isSuper || false
                              }
                        }
                  }
            ]
      },
      {
            path: '/:pathMatch(.*)*',
            redirect: '/dashboard',
            meta: { hideInMenu: true }
      }
]

const router = createRouter({
      history: createWebHistory(),
      routes
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
      const adminStore = useAdminStore()
      const token = localStorage.getItem('token')

      // 处理需要认证的路由
      if (to.meta.requiresAuth) {
            if (!token) {
                  // 没有 token，重定向到登录页
                  next({
                        path: '/login',
                        query: { redirect: to.fullPath }
                  })
                  return
            }

            // 检查权限
            if (to.meta.requireSuper) {
                  // 如果需要超级管理员权限
                  if (!adminStore.currentAdmin) {
                        // 没有用户信息，跳转到登录页
                        localStorage.removeItem('token')
                        next({
                              path: '/login',
                              query: { redirect: to.fullPath }
                        })
                        return
                  }

                  // 检查是否是超级管理员，如果不是则重定向到首页 
                  if (!adminStore.currentAdmin.isSuper) {
                        next({ path: '/dashboard' })
                        return
                  }
            }

            next()
      } else if (to.path === '/login' && token) {
            // 已登录用户访问登录页面，重定向到首页
            next({ path: '/' })
      } else {
            // 不需要认证的路由直接放行
            next()
      }
})

export default router