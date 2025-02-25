// src/api/order.api.ts
import request from '@/utils/request'
import type {
      IOrder,
      IOrderQueryParams,
      IOrderPaginationResponse,
      IUpdateOrderStatusParams
} from '@/types/order'

const BASE_URL = '/orders'

export const orderApi = {
      // 获取订单列表（分页+筛选）
      getOrders(params: IOrderQueryParams) {
            return request.get<IOrderPaginationResponse>(BASE_URL, params)
      },

      // 获取订单详情
      getOrderDetail(id: string) {
            return request.get<IOrder>(`${BASE_URL}/${id}`)
      },

      // 更新订单状态（特别是发货）
      updateOrderStatus(id: string, data: IUpdateOrderStatusParams) {
            return request.put<IOrder>(`${BASE_URL}/${id}/status`, data)
      }
}