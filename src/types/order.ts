// src/types/order.ts
import { IPaginationParams, IPaginationResponse } from './admin'
import { OrderStatus } from '@/constants/orderStatus.enum'

// 订单项接口
export interface IOrderItem {
      id: number;
      orderId: string;
      skuId: number;
      productName: string;
      mainImage: string;
      skuSpecs: any; // 规格信息存储为JSON
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      createdAt: string;
      sku?: {
            id: number;
            price: number;
            skuCode: string | null;
            image: string | null;
      };
}

// 支付记录接口
export interface IPaymentLog {
      id: number;
      orderId: string;
      amount: number;
      paymentType: string;
      transactionId: string | null;
      status: number;
      createdAt: string;
}

// 订单基本信息接口
export interface IOrder {
      id: string;
      orderNo: string;
      userId: string;
      orderStatus: number;
      paymentStatus: number;
      shippingAddress: any; // 地址信息存储为JSON
      totalAmount: number;
      paymentAmount: number;
      createdAt: string;
      updatedAt: string;
      user?: {
            id: string;
            username: string;
      };
      _count?: {
            orderItems: number;
      };
      orderItems?: IOrderItem[];
      paymentLogs?: IPaymentLog[];
}

// 订单查询参数接口
export interface IOrderQueryParams extends IPaginationParams {
      orderStatus?: number;
      orderNo?: string;
      startDate?: string;
      endDate?: string;
}

// 订单列表分页响应接口
export interface IOrderPaginationResponse extends IPaginationResponse<IOrder> { }

// 更新订单状态参数接口
export interface IUpdateOrderStatusParams {
      orderStatus: OrderStatus;
      trackingNumber?: string;
      remark?: string;
}