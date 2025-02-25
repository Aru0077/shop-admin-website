// src/types/sku.ts
import { ISpecCombination } from './spec'

export interface ISkuSpec {
    specId: number
    specValueId: number
    spec?: {
        id: number
        name: string
    }
    specValue?: {
        id: number
        value: string
    }
}

export interface ISku {
    id: number
    productId: number
    price: number
    stock: number
    lockedStock?: number
    skuCode: string
    promotion_price?: number
    image?: string
    sku_specs: ISkuSpec[]
    createdAt: string
    updatedAt: string
}

export interface IStockLog {
    id: number
    skuId: number
    changeQuantity: number
    currentStock: number
    type: number
    orderNo?: string
    remark?: string
    operator?: string
    createdAt: string
}

// 创建SKU时的参数（只包含基础信息）
export interface ICreateSkuParams {
    specs: ISpecCombination[]
    skuCode: string
}

// 更新SKU价格的参数
export interface IUpdatePriceParams {
    skuId: number
    price: number
}

// 更新SKU库存的参数
export interface IUpdateStockParams {
    skuId: number
    changeQuantity: number
    remark?: string
}

// 更新SKU促销价的参数
export interface IUpdatePromotionPriceParams {
    skuId: number
    promotionPrice: number
}

export interface ISkuListResponse {
    total: number
    items: (ISku & { stockLogs?: IStockLog[] })[]
}