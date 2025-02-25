import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminApi } from '@/api/admin-user.api'
import type {
      IAdminUser,
      ILoginParams,
      ICreateAdminParams,
      IUpdateStatusParams,
      IResetPasswordParams,
      IPaginationParams
} from '@/types/admin'


export const useAdminStore = defineStore('admin', () => {

      const currentAdmin = ref<IAdminUser | null>(null)
      const adminList = ref<IAdminUser[]>([])
      const total = ref<number>(0)
      const currentPage = ref<number>(1)
      const pageSize = ref<number>(10)
      const loading = ref<boolean>(false)
      const lastFetchTime = ref<number>(0)

      // store 实现的其他方法保持不变...
      const needsRefresh = () => {
            return Date.now() - lastFetchTime.value > 5 * 60 * 1000
      }

      const login = async (params: ILoginParams) => {
            const res = await adminApi.login(params)
            localStorage.setItem('token', res.token)
            currentAdmin.value = res.admin
            return res
      }

      const logout = async () => {
            try {
                  await adminApi.logout()
            } finally {
                  localStorage.removeItem('token')
                  currentAdmin.value = null
                  adminList.value = []
                  total.value = 0
                  lastFetchTime.value = 0
            }
      }

      const getAdminList = async (params?: IPaginationParams, forceRefresh = false) => {
            if (!forceRefresh && adminList.value.length > 0 && !needsRefresh()) {
                  return {
                        data: adminList.value,
                        total: total.value,
                        page: currentPage.value,
                        limit: pageSize.value
                  }
            }

            loading.value = true
            try {
                  const { page = 1, limit = 10 } = params || {}
                  const res = await adminApi.getAdminList({ page, limit })
                  adminList.value = res.data
                  total.value = res.total
                  currentPage.value = res.page
                  pageSize.value = res.limit
                  lastFetchTime.value = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      const createAdmin = async (params: ICreateAdminParams) => {
            const res = await adminApi.createAdmin(params)
            await getAdminList({ page: currentPage.value, limit: pageSize.value }, true)
            return res
      }

      const updateAdminStatus = async (id: number, params: IUpdateStatusParams) => {
            const res = await adminApi.updateAdminStatus(id, params)
            await getAdminList({ page: currentPage.value, limit: pageSize.value }, true)
            return res
      }

      const resetPassword = async (id: number, params: IResetPasswordParams) => {
            return await adminApi.resetPassword(id, params)
      }

      const deleteAdmin = async (id: number) => {
            await adminApi.deleteAdmin(id)
            await getAdminList({ page: currentPage.value, limit: pageSize.value }, true)
      }

      return {
            currentAdmin,
            adminList,
            total,
            currentPage,
            pageSize,
            loading,
            lastFetchTime,
            login,
            logout,
            getAdminList,
            createAdmin,
            updateAdminStatus,
            resetPassword,
            deleteAdmin,
            needsRefresh
      }
}, {
      persist: true
})