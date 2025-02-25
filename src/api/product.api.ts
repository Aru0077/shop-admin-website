// src/api/product.api.ts
import request from '@/utils/request'
import type {
    IProduct,
    ICreateProductParams,
    IUpdateProductParams,
    IUpdateStatusParams,
    IProductQueryParams,
    IProductListResponse,
    IProductStats,
} from '@/types/product'

const BASE_URL = '/products'

export const productApi = {
    // 获取商品列表
    getProductList(params: IProductQueryParams) {
        return request.get<IProductListResponse>(BASE_URL, params)
    },

    // 获取商品统计数据
    getProductStats() {
        return request.get<IProductStats>(`${BASE_URL}/stats`)
    },

    // 创建商品
    createProduct(data: ICreateProductParams) {
        return request.post<IProduct>(BASE_URL, data)
    },

    // 更新商品
    updateProduct(id: number, data: IUpdateProductParams) {
        return request.put<IProduct>(`${BASE_URL}/${id}`, data)
    },

    // 更新商品状态
    updateProductStatus(id: number, data: IUpdateStatusParams) {
        return request.patch<IProduct>(`${BASE_URL}/${id}/status`, data)
    },

    // 获取商品库存记录
    getProductStockLogs(productId: number, params: { page?: number; limit?: number } = {}) {
        return request.get<{
            total: number;
            page: number;
            limit: number;
            data: Array<{
                id: number;
                skuId: number;
                changeQuantity: number;
                currentStock: number;
                type: number;
                orderNo?: string;
                remark?: string;
                operator?: string;
                createdAt: string;
                skuInfo?: {
                    skuCode?: string;
                    sku_specs?: Array<{
                        spec: { name: string };
                        specValue: { value: string };
                    }>;
                };
            }>;
        }>(`${BASE_URL}/${productId}/stock-logs`, params);
    }

}