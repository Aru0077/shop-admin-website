// src/api/statistics.api.ts
import request from '@/utils/request'
import type {
      IDailyOverview,
      ITotalStatistics,
      ISalesTrend,
      IRevenueTrend,
      IUsersTrend
} from '@/types/statistics'

const BASE_URL = '/statistics'

export const statisticsApi = {
      // 获取今日概览数据（今日销量，销售额，访客，新增用户，支付用户）
      getDailyOverview() {
            return request.get<IDailyOverview>(`${BASE_URL}/daily-overview`)
      },

      // 获取总体统计数据（总销量，总销售额，总支付用户，总用户）
      getTotalStatistics() {
            return request.get<ITotalStatistics>(`${BASE_URL}/total`)
      },

      // 获取过去30天的每日销量
      getLast30DaysSales() {
            return request.get<ISalesTrend>(`${BASE_URL}/last-30-days-sales`)
      },

      // 获取过去30天的每日销售额
      getLast30DaysRevenue() {
            return request.get<IRevenueTrend>(`${BASE_URL}/last-30-days-revenue`)
      },

      // 获取过去30天的用户总数
      getLast30DaysUsers() {
            return request.get<IUsersTrend>(`${BASE_URL}/last-30-days-users`)
      }
}