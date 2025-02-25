# DefaultLayout.vue
<template>
      <div class="common-layout min-h-screen">
            <el-container class="h-screen">
                  <!-- 顶部导航栏 -->
                  <el-header class="flex items-center justify-between bg-white border-b px-4">
                        <div class="flex items-center">
                              <h1 class="text-xl font-semibold">管理系统</h1>
                        </div>
                        <div class="flex items-center gap-4">
                              <el-dropdown trigger="click">
                                    <div class="flex items-center cursor-pointer">
                                          <el-avatar :size="32" class="mr-2">
                                                {{ currentAdmin?.username?.charAt(0)?.toUpperCase() }}
                                          </el-avatar>
                                          <span>{{ currentAdmin?.username }}</span>
                                          <el-icon class="ml-1"><arrow-down /></el-icon>
                                    </div>
                                    <template #dropdown>
                                          <el-dropdown-menu>
                                                <el-dropdown-item disabled>
                                                      <el-icon>
                                                            <user />
                                                      </el-icon>
                                                      <span class="ml-1">{{ currentAdmin?.isSuper ? '超级管理员' : '管理员'
                                                            }}</span>
                                                </el-dropdown-item>
                                                <el-dropdown-item divided @click="handleLogout">
                                                      <el-icon><switch-button /></el-icon>
                                                      <span class="ml-1">退出登录</span>
                                                </el-dropdown-item>
                                          </el-dropdown-menu>
                                    </template>
                              </el-dropdown>
                        </div>
                  </el-header>

                  <el-container>
                        <!-- 侧边菜单 -->
                        <el-aside width="200px" class="bg-white border-r">
                              <el-menu :router="true" :default-active="route.path" class="h-full border-0">
                                    <template v-for="menuRoute in menuRoutes" :key="menuRoute.path">
                                          <el-menu-item v-if="shouldShowMenuItem(menuRoute)" :index="menuRoute.path">
                                                <el-icon v-if="menuRoute.meta?.icon">
                                                      <component :is="menuRoute.meta.icon" />
                                                </el-icon>
                                                <span>{{ menuRoute.meta?.title }}</span>
                                          </el-menu-item>
                                    </template>
                              </el-menu>
                        </el-aside>

                        <!-- 主要内容区域 -->
                        <el-main class="bg-gray-50">
                              <router-view />
                        </el-main>
                  </el-container>
            </el-container>
      </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin-user.store'
import { ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
import type { RouteRecordRaw } from 'vue-router'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

// 获取当前管理员信息
const currentAdmin = computed(() => adminStore.currentAdmin)

// 判断是否应该显示菜单项
const shouldShowMenuItem = (route: RouteRecordRaw) => {
      if (!route.meta?.showInMenu) return false
      
      // 处理动态showInMenu函数
      if (typeof route.meta.showInMenu === 'function') {
            return route.meta.showInMenu(route)
      }
      
      return true
}

// 获取需要在菜单中显示的路由
const menuRoutes = computed(() => {
      return router.options.routes
            .find(route => route.path === '/')
            ?.children?.filter(route => !route.meta?.hideInMenu) || []
})

// 处理退出登录
const handleLogout = async () => {
      await adminStore.logout()
      router.push('/login')
}
</script>

<style scoped>
.el-header {
      height: 60px;
}

.el-aside {
      width: 200px;
}

:deep(.el-dropdown-menu__item) {
      display: flex;
      align-items: center;
}
</style>