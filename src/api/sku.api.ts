// src/api/sku.api.ts
import request from '@/utils/request'
import type {
    ICreateSkuParams,
    IUpdateStockParams,
    IUpdatePriceParams,
    IUpdatePromotionPriceParams,
    ISkuListResponse
} from '@/types/sku'

const BASE_URL = '/skus'

export const skuApi = {
    // 创建SKU基础信息
    createSkus(productId: number, skus: ICreateSkuParams[]) {
        return request.post<void>(`${BASE_URL}/${productId}/skus`, { skus })
    },

    // 批量设置SKU价格
    updatePrices(productId: number, items: IUpdatePriceParams[]) {
        return request.put<void>(`${BASE_URL}/${productId}/skus/prices`, { items })
    },

    // 更新SKU库存
    updateStock(productId: number, items: IUpdateStockParams[]) {
        return request.put<void>(`${BASE_URL}/${productId}/skus/stock`, { items })
    },

    // 批量设置促销价
    updatePromotionPrices(productId: number, items: IUpdatePromotionPriceParams[]) {
        return request.put<void>(`${BASE_URL}/${productId}/skus/promotion-prices`, { items })
    },

    // 获取SKU列表
    getSkuList(productId: number, withSpecs = true, withStock = true) {
        return request.get<ISkuListResponse>(`${BASE_URL}/${productId}/skus`, {
            withSpecs: withSpecs ? '1' : '0',
            withStock: withStock ? '1' : '0'
        })
    },

    // 取消商品促销
    cancelPromotion(productId: number) {
        return request.post<void>(`${BASE_URL}/${productId}/skus/cancel-promotion`)
    },
}