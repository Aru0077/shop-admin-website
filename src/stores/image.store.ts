// src/stores/image.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { imageApi } from '@/api/image.api'
import type {
      IImage,
      IImagePaginationParams,
      IBatchDeleteParams
} from '@/types/image'

interface CacheState {
      imageList: IImage[];
      total: number;
      currentPage: number;
      pageSize: number;
      lastFetchTime: number;
      currentFilter: number | null;
}

export const useImageStore = defineStore('image', () => {
      // 状态
      const imageList = ref<IImage[]>([])
      const total = ref<number>(0)
      const currentPage = ref<number>(1)
      const pageSize = ref<number>(10)
      const loading = ref<boolean>(false)
      const lastFetchTime = ref<number>(0)
      const currentFilter = ref<number | null>(null)

      // 检查是否需要刷新数据（5分钟缓存）
      const needsRefresh = () => {
            return Date.now() - lastFetchTime.value > 5 * 60 * 1000
      }

      // 保存状态到本地存储
      const saveStateToStorage = () => {
            const state: CacheState = {
                  imageList: imageList.value,
                  total: total.value,
                  currentPage: currentPage.value,
                  pageSize: pageSize.value,
                  lastFetchTime: lastFetchTime.value,
                  currentFilter: currentFilter.value
            }
            localStorage.setItem('image-store', JSON.stringify(state))
      }

      // 从本地存储恢复状态
      const restoreStateFromStorage = () => {
            const stored = localStorage.getItem('image-store')
            if (stored) {
                  const state = JSON.parse(stored) as CacheState
                  imageList.value = state.imageList
                  total.value = state.total
                  currentPage.value = state.currentPage
                  pageSize.value = state.pageSize
                  lastFetchTime.value = state.lastFetchTime
                  currentFilter.value = state.currentFilter
            }
      }

      // 获取图片列表
      const getImageList = async (params?: IImagePaginationParams, forceRefresh = false) => {
            const currentParams = {
                  page: params?.page || currentPage.value,
                  limit: params?.limit || pageSize.value,
                  isUsed: params?.isUsed
            }

            // 先尝试恢复缓存的状态
            if (!imageList.value.length) {
                  restoreStateFromStorage()
            }

            // 检查是否可以使用缓存
            if (
                  !forceRefresh && 
                  imageList.value.length > 0 && 
                  !needsRefresh() &&
                  currentPage.value === currentParams.page &&
                  pageSize.value === currentParams.limit &&
                  currentFilter.value === currentParams.isUsed
            ) {
                  return {
                        data: imageList.value,
                        total: total.value,
                        page: currentPage.value,
                        limit: pageSize.value
                  }
            }

            loading.value = true
            try {
                  const res = await imageApi.getImageList(currentParams)
                  
                  // 更新状态
                  imageList.value = res.data
                  total.value = res.total
                  currentPage.value = res.page
                  pageSize.value = res.limit
                  lastFetchTime.value = Date.now()
                  currentFilter.value = currentParams.isUsed ?? null

                  // 保存到本地存储
                  saveStateToStorage()

                  return res
            } finally {
                  loading.value = false
            }
      }

      // 上传图片
      const uploadImages = async (files: File[]) => {
            const res = await imageApi.uploadImages(files)
            await getImageList({ 
                  page: currentPage.value, 
                  limit: pageSize.value,
                  isUsed: currentFilter.value 
            }, true)
            return res
      }

      // 删除单个图片
      const deleteImage = async (id: number) => {
            await imageApi.deleteImage(id)
            await getImageList({ 
                  page: currentPage.value, 
                  limit: pageSize.value,
                  isUsed: currentFilter.value 
            }, true)
      }

      // 批量删除图片
      const batchDeleteImages = async (params: IBatchDeleteParams) => {
            await imageApi.batchDeleteImages(params)
            await getImageList({ 
                  page: currentPage.value, 
                  limit: pageSize.value,
                  isUsed: currentFilter.value 
            }, true)
      }

      // 根据ID查找图片
      const findImageById = (id: number): IImage | undefined => {
            return imageList.value.find(image => image.id === id)
      }

      // 清除缓存
      const clearCache = () => {
            localStorage.removeItem('image-store')
            imageList.value = []
            total.value = 0
            currentPage.value = 1
            pageSize.value = 10
            lastFetchTime.value = 0
            currentFilter.value = null
      }

      return {
            imageList,
            total,
            currentPage,
            pageSize,
            loading,
            lastFetchTime,
            currentFilter,
            getImageList,
            uploadImages,
            deleteImage,
            batchDeleteImages,
            findImageById,
            clearCache
      }
})