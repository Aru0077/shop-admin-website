import request from '@/utils/request'
import type {
    IAdminUser,
    ILoginParams,
    ICreateAdminParams,
    IUpdateStatusParams,
    IResetPasswordParams,
    IPaginationParams,
    IPaginationResponse,
    ILoginResponse
} from '@/types/admin'

const BASE_URL = '/admin-user'

export const adminApi = {
    // 登录
    login(data: ILoginParams) {
        return request.post<ILoginResponse>(`${BASE_URL}/login`, data)
    },

    // 登出
    logout() {
        return request.post(`${BASE_URL}/logout`)
    },

    // 获取管理员列表
    getAdminList(params: IPaginationParams) {
        return request.get<IPaginationResponse<IAdminUser>>(`${BASE_URL}/list`, params)
    },

    // 创建管理员
    createAdmin(data: ICreateAdminParams) {
        return request.post<IAdminUser>(`${BASE_URL}/create`, data)
    },

    // 更新管理员状态
    updateAdminStatus(id: number, data: IUpdateStatusParams) {
        return request.put<IAdminUser>(`${BASE_URL}/${id}/status`, data)
    },

    // 重置管理员密码
    resetPassword(id: number, data: IResetPasswordParams) {
        return request.put<IAdminUser>(`${BASE_URL}/${id}/reset-password`, data)
    },

    // 删除管理员
    deleteAdmin(id: number) {
        return request.delete(`${BASE_URL}/${id}`)
    }
}