// src/stores/user.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/user.api'
import type {
      IUser,
      IUserSearchParams,
      IBlacklistStatusParams
} from '@/types/user'

export const useUserStore = defineStore('user', () => {
      const userList = ref<IUser[]>([])
      const currentUser = ref<IUser | null>(null)
      const total = ref<number>(0)
      const currentPage = ref<number>(1)
      const pageSize = ref<number>(10)
      const loading = ref<boolean>(false)
      const lastFetchTime = ref<number>(0)
      const searchKeyword = ref<string>('')

      // 检查是否需要刷新数据（5分钟缓存）
      const needsRefresh = () => {
            return Date.now() - lastFetchTime.value > 5 * 60 * 1000
      }

      // 获取用户列表
      const getUsers = async (params?: IUserSearchParams, forceRefresh = false) => {
            if (!forceRefresh && userList.value.length > 0 && !needsRefresh() &&
                  (!params?.username || params.username === searchKeyword.value)) {
                  return {
                        data: userList.value,
                        total: total.value,
                        page: currentPage.value,
                        limit: pageSize.value
                  }
            }

            loading.value = true
            try {
                  const { page = 1, limit = 10, username } = params || {}
                  if (username !== undefined) {
                        searchKeyword.value = username
                  }

                  const res = await userApi.getUsers({ page, limit, username })
                  userList.value = res.data
                  total.value = res.total
                  currentPage.value = res.page
                  pageSize.value = res.limit
                  lastFetchTime.value = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 获取单个用户详情
      const getUserDetails = async (id: string, forceRefresh = false) => {
            if (!forceRefresh && currentUser.value && currentUser.value.id === id && !needsRefresh()) {
                  return currentUser.value
            }

            loading.value = true
            try {
                  const res = await userApi.getUserDetails(id)
                  currentUser.value = res
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 设置用户黑名单状态
      const setBlacklistStatus = async (id: string, params: IBlacklistStatusParams) => {
            const res = await userApi.setBlacklistStatus(id, params)

            // 更新列表中的用户状态
            const index = userList.value.findIndex(user => user.id === id)
            if (index !== -1) {
                  userList.value[index] = { ...userList.value[index], ...res }
            }

            // 如果是当前查看的用户，也更新currentUser
            if (currentUser.value && currentUser.value.id === id) {
                  currentUser.value = { ...currentUser.value, ...res }
            }

            return res
      }

      // 清除搜索状态
      const clearSearch = () => {
            searchKeyword.value = ''
            // 不立即清除列表，而是在下次获取时使用新条件
      }

      // 重置状态
      const resetState = () => {
            userList.value = []
            currentUser.value = null
            total.value = 0
            currentPage.value = 1
            pageSize.value = 10
            lastFetchTime.value = 0
            searchKeyword.value = ''
      }

      return {
            userList,
            currentUser,
            total,
            currentPage,
            pageSize,
            loading,
            lastFetchTime,
            searchKeyword,
            getUsers,
            getUserDetails,
            setBlacklistStatus,
            clearSearch,
            resetState,
            needsRefresh
      }
}, {
      persist: true
})