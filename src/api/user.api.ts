// src/api/user.api.ts
import request from '@/utils/request'
import type {
      IUser,
      IUserSearchParams,
      IUserPaginationResponse,
      IBlacklistStatusParams
} from '@/types/user'

const BASE_URL = '/users'

export const userApi = {
      // 获取用户列表（支持分页和用户名搜索）
      getUsers(params: IUserSearchParams) {
            return request.get<IUserPaginationResponse>(BASE_URL, params)
      },

      // 获取单个用户详情
      getUserDetails(id: string) {
            return request.get<IUser>(`${BASE_URL}/${id}`)
      },

      // 设置用户黑名单状态
      setBlacklistStatus(id: string, data: IBlacklistStatusParams) {
            return request.put<IUser>(`${BASE_URL}/${id}/blacklist`, data)
      }
}