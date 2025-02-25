// src/stores/product.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productApi } from '@/api/product.api'
import {
      IProduct,
      IProductStats,
      ICreateProductParams,
      IUpdateProductParams,
      IUpdateStatusParams,
      IProductQueryParams,
} from '@/types/product'

export const useProductStore = defineStore('product', () => {
      const productList = ref<IProduct[]>([])
      const total = ref<number>(0)
      const currentPage = ref<number>(1)
      const pageSize = ref<number>(10)
      const loading = ref<boolean>(false)
      const lastFetchTime = ref<number>(0)
      const productStats = ref<IProductStats | null>(null)
      // 库存记录相关状态
      const stockLogsData = ref<{
            total: number;
            page: number;
            limit: number;
            data: Array<any>;
      }>({
            total: 0,
            page: 1,
            limit: 10,
            data: []
      });
      const stockLogsLoading = ref<boolean>(false);



      // 检查是否需要刷新数据（5分钟缓存）
      const needsRefresh = () => {
            return Date.now() - lastFetchTime.value > 5 * 60 * 1000
      }

      // 获取商品列表
      const getProductList = async (params?: IProductQueryParams, forceRefresh = false) => {
            const currentParams: Record<string, any> = {
                  page: params?.page || currentPage.value,
                  limit: params?.limit || pageSize.value,
            }

            // 只添加非空值
            if (params?.categoryId) currentParams.categoryId = params.categoryId
            if (params?.status) currentParams.status = params.status
            if (params?.is_promotion !== undefined) currentParams.is_promotion = params.is_promotion
            if (params?.sort) currentParams.sort = params.sort
            if (params?.order) currentParams.order = params.order
            if (params?.keyword) currentParams.keyword = params.keyword

            // 检查是否可以使用缓存
            if (!forceRefresh &&
                  productList.value.length > 0 &&
                  !needsRefresh() &&
                  currentPage.value === currentParams.page &&
                  pageSize.value === currentParams.limit &&
                  !currentParams.categoryId &&
                  !currentParams.status &&
                  !currentParams.is_promotion &&
                  !currentParams.keyword
            ) {
                  return {
                        data: productList.value,
                        total: total.value,
                        page: currentPage.value,
                        limit: pageSize.value
                  }
            }

            loading.value = true
            try {
                  const res = await productApi.getProductList(currentParams)
                  productList.value = res.data
                  total.value = res.total
                  currentPage.value = res.page
                  pageSize.value = res.limit
                  lastFetchTime.value = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 获取商品统计数据
      const getProductStats = async (forceRefresh = false) => {
            if (!forceRefresh && productStats.value && !needsRefresh()) {
                  return productStats.value
            }

            const res = await productApi.getProductStats()
            productStats.value = res
            return res
      }

      // 创建商品
      const createProduct = async (params: ICreateProductParams) => {
            // 确保详情图片是数组格式
            const formattedParams = {
                  ...params,
                  detailImages: params.detailImages || []
            }
            const res = await productApi.createProduct(formattedParams)
            await getProductList({ page: currentPage.value, limit: pageSize.value }, true)
            await getProductStats(true)
            return res
      }

      // 更新商品
      const updateProduct = async (id: number, params: IUpdateProductParams) => {
            const res = await productApi.updateProduct(id, params)

            // 更新本地列表中的商品数据
            const index = productList.value.findIndex(item => item.id === id)
            if (index !== -1) {
                  productList.value[index] = {
                        ...productList.value[index],
                        ...res,
                        detailImages: res.detailImages || productList.value[index].detailImages
                  }
            }

            return res
      }


      // 更新商品状态
      const updateProductStatus = async (id: number, params: IUpdateStatusParams) => {
            const res = await productApi.updateProductStatus(id, params)

            // 更新本地数据中对应的商品
            const index = productList.value.findIndex(item => item.id === id)
            if (index !== -1) {
                  productList.value[index] = { ...productList.value[index], ...res }
            }

            return res
      }

      // 根据ID查找商品
      const findProductById = (id: number): IProduct | undefined => {
            return productList.value.find(product => product.id === id)
      }

      // 检查商品编码是否已存在
      const isProductCodeExists = (code: string): boolean => {
            return productList.value.some(product => product.productCode === code)
      }

      const updateLocalProductPromotion = async (productId: number, is_promotion: number) => {
            // 更新本地列表中的商品数据
            const index = productList.value.findIndex(item => item.id === productId)
            if (index !== -1) {
                  productList.value[index] = {
                        ...productList.value[index],
                        is_promotion
                  }
            }
            return true
      }


      // 获取商品库存记录
      const getProductStockLogs = async (productId: number, params: { page?: number; limit?: number } = {}) => {
            stockLogsLoading.value = true;
            try {
                  const res = await productApi.getProductStockLogs(productId, params);
                  stockLogsData.value = res;
                  return res;
            } finally {
                  stockLogsLoading.value = false;
            }
      }


      return {
            productList,
            total,
            currentPage,
            pageSize,
            loading,
            lastFetchTime,
            productStats,
            stockLogsData,
            stockLogsLoading,
            getProductList,
            getProductStats,
            createProduct,
            updateProduct,
            updateProductStatus,
            findProductById,
            isProductCodeExists,
            needsRefresh,
            updateLocalProductPromotion,
            getProductStockLogs,
      }
}, {
      persist: true
})