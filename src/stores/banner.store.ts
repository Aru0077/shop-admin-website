// src/stores/banner.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { bannerApi } from '@/api/banner.api'
import type { IBanner, ICreateBannerParams, IUpdateBannerParams } from '@/types/banner'

export const useBannerStore = defineStore('banner', () => {
      const banner = ref<IBanner | null>(null)
      const loading = ref<boolean>(false)
      const lastFetchTime = ref<number>(0)

      // 检查是否需要刷新数据（5分钟缓存）
      const needsRefresh = () => {
            return Date.now() - lastFetchTime.value > 5 * 60 * 1000
      }

      // 获取首页banner
      const getBanner = async (forceRefresh = false) => {
            if (!forceRefresh && banner.value && !needsRefresh()) {
                  return banner.value
            }

            loading.value = true
            try {
                  const res = await bannerApi.getBanner()
                  banner.value = res
                  lastFetchTime.value = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 创建首页banner
      const createBanner = async (params: ICreateBannerParams) => {
            const res = await bannerApi.createBanner(params)
            banner.value = res
            lastFetchTime.value = Date.now()
            return res
      }

      // 更新首页banner
      const updateBanner = async (params: IUpdateBannerParams) => {
            const res = await bannerApi.updateBanner(params)
            banner.value = res
            lastFetchTime.value = Date.now()
            return res
      }

      // 删除首页banner
      const deleteBanner = async () => {
            await bannerApi.deleteBanner()
            banner.value = null
            lastFetchTime.value = 0
      }

      return {
            banner,
            loading,
            lastFetchTime,
            getBanner,
            createBanner,
            updateBanner,
            deleteBanner,
            needsRefresh
      }
}, {
      persist: true
})