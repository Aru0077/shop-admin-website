// src/stores/category.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoryApi } from '@/api/category.api'
import type {
    ICategory,
    ICreateCategoryParams,
    IUpdateCategoryParams
} from '@/types/category'

export const useCategoryStore = defineStore('category', () => {
    const categoryTree = ref<ICategory[]>([])
    const loading = ref<boolean>(false)
    const lastFetchTime = ref<number>(0)

    // 检查是否需要刷新数据（5分钟缓存）
    const needsRefresh = () => {
        return Date.now() - lastFetchTime.value > 5 * 60 * 1000
    }

    // 获取分类树
    const getCategoryTree = async (forceRefresh = false) => {
        if (!forceRefresh && categoryTree.value.length > 0 && !needsRefresh()) {
            return {
                data: categoryTree.value,
                lastFetchTime: lastFetchTime.value
            }
        }

        loading.value = true
        try {
            const res = await categoryApi.getCategoryTree()
            const transformedData = Object.values(res).filter(item =>
                typeof item === 'object' &&
                item !== null &&
                'name' in item &&
                'level' in item
            ) as ICategory[]

            categoryTree.value = transformedData
            lastFetchTime.value = Date.now()
            return {
                data: transformedData,
                lastFetchTime: lastFetchTime.value
            }
        } finally {
            loading.value = false
        }
    }

    // 创建分类
    const createCategory = async (params: ICreateCategoryParams) => {
        const res = await categoryApi.createCategory(params)
        await getCategoryTree(true)
        return res
    }

    // 更新分类
    const updateCategory = async (id: number, params: IUpdateCategoryParams) => {
        const res = await categoryApi.updateCategory(id, params)
        await getCategoryTree(true)
        return res
    }

    // 删除分类
    const deleteCategory = async (id: number) => {
        await categoryApi.deleteCategory(id)
        await getCategoryTree(true)
    }

    // 根据ID查找分类
    const findCategoryById = (id: number): ICategory | undefined => {
        const findInTree = (categories: ICategory[]): ICategory | undefined => {
            for (const category of categories) {
                if (category.id === id) {
                    return category
                }
                if (category.children?.length) {
                    const found = findInTree(category.children)
                    if (found) return found
                }
            }
            return undefined
        }
        return findInTree(categoryTree.value)
    }

    // 获取分类的完整路径
    const getCategoryPath = (id: number): ICategory[] => {
        const path: ICategory[] = []
        const findPath = (categories: ICategory[]): boolean => {
            for (const category of categories) {
                path.push(category)
                if (category.id === id) {
                    return true
                }
                if (category.children?.length && findPath(category.children)) {
                    return true
                }
                path.pop()
            }
            return false
        }
        findPath(categoryTree.value)
        return path
    }

    return {
        categoryTree,
        loading,
        lastFetchTime,
        getCategoryTree,
        createCategory,
        updateCategory,
        deleteCategory,
        findCategoryById,
        getCategoryPath,
        needsRefresh
    }
}, {
    persist: true
})