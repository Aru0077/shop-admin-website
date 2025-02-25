// src/stores/order.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orderApi } from '@/api/order.api'
import type {
      IOrder,
      IOrderQueryParams,
      IUpdateOrderStatusParams
} from '@/types/order'
import { OrderStatus, OrderStatusText, PaymentStatus, PaymentStatusText } from '@/constants/orderStatus.enum'

export const useOrderStore = defineStore('order', () => {
      // 状态
      const orderList = ref<IOrder[]>([])
      const currentOrder = ref<IOrder | null>(null)
      const total = ref<number>(0)
      const currentPage = ref<number>(1)
      const pageSize = ref<number>(10)
      const loading = ref<boolean>(false)
      const lastFetchTime = ref<number>(0)
      const filterConditions = ref<{
            orderStatus?: number;
            orderNo?: string;
            startDate?: string;
            endDate?: string;
      }>({})

      // 计算属性
      const orderStatusOptions = computed(() => {
            return Object.entries(OrderStatusText).map(([value, label]) => ({
                  value: parseInt(value),
                  label
            }))
      })

      const paymentStatusOptions = computed(() => {
            return Object.entries(PaymentStatusText).map(([value, label]) => ({
                  value: parseInt(value),
                  label
            }))
      })

      // 检查是否需要刷新数据（5分钟缓存）
      const needsRefresh = () => {
            return Date.now() - lastFetchTime.value > 5 * 60 * 1000
      }

      // 获取订单列表
      const getOrders = async (params?: IOrderQueryParams, forceRefresh = false) => {
            // 如果有新的筛选条件，强制刷新
            const hasNewFilters = params && (
                  params.orderStatus !== filterConditions.value.orderStatus ||
                  params.orderNo !== filterConditions.value.orderNo ||
                  params.startDate !== filterConditions.value.startDate ||
                  params.endDate !== filterConditions.value.endDate
            )

            if (!forceRefresh && !hasNewFilters && orderList.value.length > 0 && !needsRefresh()) {
                  return {
                        data: orderList.value,
                        total: total.value,
                        page: currentPage.value,
                        limit: pageSize.value
                  }
            }

            loading.value = true
            try {
                  const { page = 1, limit = 10, ...filters } = params || {}

                  // 更新筛选条件
                  if (params) {
                        filterConditions.value = {
                              orderStatus: params.orderStatus,
                              orderNo: params.orderNo,
                              startDate: params.startDate,
                              endDate: params.endDate
                        }
                  }

                  const res = await orderApi.getOrders({ page, limit, ...filters })
                  orderList.value = res.data
                  total.value = res.total
                  currentPage.value = res.page
                  pageSize.value = res.limit
                  lastFetchTime.value = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 获取订单详情
      const getOrderDetail = async (id: string, forceRefresh = false) => {
            if (!forceRefresh && currentOrder.value && currentOrder.value.id === id && !needsRefresh()) {
                  return currentOrder.value
            }

            loading.value = true
            try {
                  const res = await orderApi.getOrderDetail(id)
                  currentOrder.value = res
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 更新订单状态（特别是发货）
      const updateOrderStatus = async (id: string, params: IUpdateOrderStatusParams) => {
            loading.value = true
            try {
                  const res = await orderApi.updateOrderStatus(id, params)

                  // 更新列表中的订单状态
                  const index = orderList.value.findIndex(order => order.id === id)
                  if (index !== -1) {
                        orderList.value[index] = { ...orderList.value[index], ...res }
                  }

                  // 如果是当前查看的订单，也更新currentOrder
                  if (currentOrder.value && currentOrder.value.id === id) {
                        currentOrder.value = { ...currentOrder.value, ...res }
                  }

                  return res
            } finally {
                  loading.value = false
            }
      }

      // 发货
      const shipOrder = async (id: string, trackingNumber: string, remark?: string) => {
            return await updateOrderStatus(id, {
                  orderStatus: OrderStatus.SHIPPED,
                  trackingNumber,
                  remark
            })
      }

      // 重置状态
      const resetState = () => {
            orderList.value = []
            currentOrder.value = null
            total.value = 0
            currentPage.value = 1
            pageSize.value = 10
            lastFetchTime.value = 0
            filterConditions.value = {}
      }

      // 清除筛选条件
      const clearFilters = () => {
            filterConditions.value = {}
      }

      // 获取订单状态文本
      const getOrderStatusText = (status: number) => {
            return OrderStatusText[status as OrderStatus] || '未知状态'
      }

      // 获取支付状态文本
      const getPaymentStatusText = (status: number) => {
            return PaymentStatusText[status as PaymentStatus] || '未知状态'
      }

      return {
            orderList,
            currentOrder,
            total,
            currentPage,
            pageSize,
            loading,
            lastFetchTime,
            filterConditions,
            orderStatusOptions,
            paymentStatusOptions,
            getOrders,
            getOrderDetail,
            updateOrderStatus,
            shipOrder,
            resetState,
            clearFilters,
            getOrderStatusText,
            getPaymentStatusText,
            needsRefresh
      }
}, {
      persist: true
})