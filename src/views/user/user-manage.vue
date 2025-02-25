<!-- src/views/admin/user-manage.vue -->
<template>
      <div class="container mx-auto px-4 py-8">
            <div class="mb-6 flex justify-between items-center">
                  <h2 class="text-2xl font-bold">用户管理</h2>
                  <div class="flex items-center">
                        <el-input v-model="searchForm.username" placeholder="请输入用户名搜索" class="w-64 mr-2" clearable
                              @clear="handleClearSearch" />
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                  </div>
            </div>

            <!-- 列表 -->
            <el-card shadow="never" class="mb-4">
                  <el-table v-loading="userStore.loading" :data="userStore.userList" border stripe>
                        <el-table-column prop="id" label="ID" width="240" show-overflow-tooltip />
                        <el-table-column prop="username" label="用户名" width="120" />
                        <el-table-column prop="facebookId" label="Facebook ID" width="120" show-overflow-tooltip>
                              <template #default="{ row }">
                                    {{ row.facebookId || '未绑定' }}
                              </template>
                        </el-table-column>
                        <el-table-column prop="isBlacklist" label="状态" width="100">
                              <template #default="{ row }">
                                    <el-tag :type="row.isBlacklist === 0 ? 'success' : 'danger'">
                                          {{ row.isBlacklist === 0 ? '正常' : '黑名单' }}
                                    </el-tag>
                              </template>
                        </el-table-column>
                        <el-table-column label="数据统计" width="280">
                              <template #default="{ row }">
                                    <div class="flex space-x-2">
                                          <el-tag type="info">订单: {{ row._count?.orders || 0 }}</el-tag>
                                          <el-tag type="info">地址: {{ row._count?.addresses || 0 }}</el-tag>
                                          <el-tag type="info">购物车: {{ row._count?.cartItems || 0 }}</el-tag>
                                          <el-tag type="info">收藏: {{ row._count?.favorites || 0 }}</el-tag>
                                    </div>
                              </template>
                        </el-table-column>
                        <el-table-column label="注册时间" width="180">
                              <template #default="{ row }">
                                    {{ formatDate(row.createdAt) }}
                              </template>
                        </el-table-column>
                        <el-table-column label="操作" width="200" fixed="right">
                              <template #default="{ row }">
                                    <el-button-group>
                                          <el-button :type="row.isBlacklist === 0 ? 'danger' : 'success'" size="small"
                                                @click="handleToggleBlacklist(row)">
                                                {{ row.isBlacklist === 0 ? '加入黑名单' : '解除黑名单' }}
                                          </el-button>
                                          <el-button type="primary" size="small" @click="handleViewDetail(row)">
                                                查看详情
                                          </el-button>
                                    </el-button-group>
                              </template>
                        </el-table-column>
                  </el-table>

                  <!-- 分页 -->
                  <div class="mt-4 flex justify-end">
                        <el-pagination v-model:current-page="userStore.currentPage"
                              v-model:page-size="userStore.pageSize" :total="userStore.total"
                              :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next"
                              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                  </div>
            </el-card>

            <!-- 用户详情抽屉 -->
            <el-drawer v-model="drawerVisible" title="用户详情" size="30%" destroy-on-close>
                  <div v-if="userStore.currentUser" class="p-4">
                        <div class="mb-6 text-center">
                              <div
                                    class="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center mb-2">
                                    <span class="text-2xl font-bold text-gray-600">{{
                                          userStore.currentUser.username.charAt(0).toUpperCase() }}</span>
                              </div>
                              <h3 class="text-xl font-bold">{{ userStore.currentUser.username }}</h3>
                              <p class="text-gray-500 text-sm">用户ID: {{ userStore.currentUser.id }}</p>
                        </div>

                        <el-descriptions :column="1" border>
                              <el-descriptions-item label="注册时间">
                                    {{ formatDate(userStore.currentUser.createdAt) }}
                              </el-descriptions-item>
                              <el-descriptions-item label="用户状态">
                                    <el-tag :type="userStore.currentUser.isBlacklist === 0 ? 'success' : 'danger'">
                                          {{ userStore.currentUser.isBlacklist === 0 ? '正常' : '黑名单' }}
                                    </el-tag>
                              </el-descriptions-item>
                              <el-descriptions-item label="Facebook 绑定">
                                    {{ userStore.currentUser.facebookId || '未绑定' }}
                              </el-descriptions-item>
                              <el-descriptions-item label="订单数量">
                                    {{ userStore.currentUser._count?.orders || 0 }}
                              </el-descriptions-item>
                              <el-descriptions-item label="地址数量">
                                    {{ userStore.currentUser._count?.addresses || 0 }}
                              </el-descriptions-item>
                              <el-descriptions-item label="购物车数量">
                                    {{ userStore.currentUser._count?.cartItems || 0 }}
                              </el-descriptions-item>
                              <el-descriptions-item label="收藏数量">
                                    {{ userStore.currentUser._count?.favorites || 0 }}
                              </el-descriptions-item>
                              <el-descriptions-item label="上次更新">
                                    {{ formatDate(userStore.currentUser.updatedAt) }}
                              </el-descriptions-item>
                        </el-descriptions>

                        <div class="mt-6 flex justify-center">
                              <el-button :type="userStore.currentUser.isBlacklist === 0 ? 'danger' : 'success'"
                                    @click="handleToggleBlacklist(userStore.currentUser)">
                                    {{ userStore.currentUser.isBlacklist === 0 ? '加入黑名单' : '解除黑名单' }}
                              </el-button>
                        </div>
                  </div>
                  <div v-else class="flex justify-center items-center h-full">
                        <el-empty description="暂无用户详情" />
                  </div>
            </el-drawer>
      </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user.store'
import { formatDate } from '@/utils/date'
import type { IUser } from '@/types/user'

const userStore = useUserStore()

// 搜索表单
const searchForm = reactive({
      username: ''
})

// 详情抽屉
const drawerVisible = ref(false)

// 初始化数据
onMounted(() => {
      fetchData()
})

// 获取数据
const fetchData = () => {
      userStore.getUsers({
            page: userStore.currentPage,
            limit: userStore.pageSize,
            username: userStore.searchKeyword
      })
}

// 搜索处理
const handleSearch = () => {
      userStore.getUsers({
            page: 1, // 搜索时回到第一页
            limit: userStore.pageSize,
            username: searchForm.username
      }, true)
}

// 清除搜索
const handleClearSearch = () => {
      searchForm.username = ''
      userStore.clearSearch()
      userStore.getUsers({
            page: 1,
            limit: userStore.pageSize
      }, true)
}

// 分页处理
const handleSizeChange = (val: number) => {
      userStore.getUsers({
            page: 1,
            limit: val,
            username: userStore.searchKeyword
      })
}

const handleCurrentChange = (val: number) => {
      userStore.getUsers({
            page: val,
            limit: userStore.pageSize,
            username: userStore.searchKeyword
      })
}

// 切换黑名单状态
const handleToggleBlacklist = async (row: IUser) => {
      try {
            const newStatus = row.isBlacklist === 0 ? 1 : 0
            const actionText = newStatus === 1 ? '加入黑名单' : '解除黑名单'

            await ElMessageBox.confirm(
                  `确定要将该用户${actionText}吗？`,
                  '提示',
                  { type: 'warning' }
            )

            await userStore.setBlacklistStatus(row.id, { isBlacklist: newStatus })
            ElMessage.success(`${actionText}成功`)
      } catch (error: any) {
            if (error !== 'cancel') {
                  ElMessage.error(error.message || '操作失败')
            }
      }
}

// 查看用户详情
const handleViewDetail = async (row: IUser) => {
      try {
            await userStore.getUserDetails(row.id)
            drawerVisible.value = true
      } catch (error: any) {
            ElMessage.error(error.message || '获取用户详情失败')
      }
}
</script>