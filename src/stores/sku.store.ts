// src/stores/sku.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { skuApi } from '@/api/sku.api'
import type {
      ISku,
      ICreateSkuParams,
      IUpdateStockParams,
      IUpdatePriceParams,
      IUpdatePromotionPriceParams,
} from '@/types/sku'

export const useSkuStore = defineStore('sku', () => {
      const skuList = ref<ISku[]>([])
      const total = ref<number>(0)
      const loading = ref<boolean>(false)
      const lastFetchTime = ref<number>(0)
      const currentProductId = ref<number | null>(null)

      // 检查是否需要刷新数据（5分钟缓存）
      const needsRefresh = () => {
            return Date.now() - lastFetchTime.value > 5 * 60 * 1000
      }

      // 获取SKU列表
      const getSkuList = async (
            productId: number,
            withSpecs = true,
            withStock = true,
            forceRefresh = false
      ) => {
            if (
                  !forceRefresh &&
                  currentProductId.value === productId &&
                  skuList.value.length > 0 &&
                  !needsRefresh()
            ) {
                  return {
                        total: total.value,
                        items: skuList.value
                  }
            }

            loading.value = true
            try {
                  const res = await skuApi.getSkuList(productId, withSpecs, withStock)
                  skuList.value = res.items
                  total.value = res.total
                  currentProductId.value = productId
                  lastFetchTime.value = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 创建SKU基础信息
      const createSkus = async (productId: number, skus: ICreateSkuParams[]) => {
            await skuApi.createSkus(productId, skus)
            await getSkuList(productId, true, true, true)
      }

      // 批量设置SKU价格
      const updatePrices = async (productId: number, items: IUpdatePriceParams[]) => {
            await skuApi.updatePrices(productId, items)
            await getSkuList(productId, true, true, true)
      }

      // 更新SKU库存
      const updateStock = async (productId: number, items: IUpdateStockParams[]) => {
            await skuApi.updateStock(productId, items)
            await getSkuList(productId, true, true, true)
      }

      // 批量设置促销价
      const updatePromotionPrices = async (productId: number, items: IUpdatePromotionPriceParams[]) => {
            await skuApi.updatePromotionPrices(productId, items)
            await getSkuList(productId, true, true, true)
      }

      // 取消商品促销
      const cancelPromotion = async (productId: number) => {
            await skuApi.cancelPromotion(productId)
            await getSkuList(productId, true, true, true)
      }

      // 根据ID查找SKU
      const findSkuById = (id: number): ISku | undefined => {
            return skuList.value.find(sku => sku.id === id)
      }

      // 检查SKU编码是否已存在
      const isSkuCodeExists = (code: string): boolean => {
            return skuList.value.some(sku => sku.skuCode === code)
      }

      // 获取SKU总库存
      const getTotalStock = (): number => {
            return skuList.value.reduce((total, sku) => total + (sku.stock || 0), 0)
      }

      return {
            skuList,
            total,
            loading,
            lastFetchTime,
            currentProductId,
            getSkuList,
            createSkus,
            updatePrices,
            updateStock,
            updatePromotionPrices,
            cancelPromotion,
            findSkuById,
            isSkuCodeExists,
            getTotalStock,
            needsRefresh
      }
}, {
      persist: true
})