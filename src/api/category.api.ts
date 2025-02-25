// src/api/category.api.ts
import request from '@/utils/request'
import type {
    ICategory,
    ICreateCategoryParams,
    IUpdateCategoryParams,
    ICategoryTreeResponse
} from '@/types/category'

const BASE_URL = '/categories'

export const categoryApi = {
    // 获取分类树
    getCategoryTree() {
        return request.get<ICategoryTreeResponse>(`${BASE_URL}/tree`)
    },

    // 创建分类
    createCategory(data: ICreateCategoryParams) {
        return request.post<ICategory>(BASE_URL, data)
    },

    // 更新分类
    updateCategory(id: number, data: IUpdateCategoryParams) {
        return request.put<ICategory>(`${BASE_URL}/${id}`, data)
    },

    // 删除分类
    deleteCategory(id: number) {
        return request.delete<void>(`${BASE_URL}/${id}`)
    }
}