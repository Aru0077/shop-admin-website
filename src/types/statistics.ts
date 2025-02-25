// src/types/statistics.ts

// 今日概览数据接口
export interface IDailyOverview {
      dailySales: number;
      dailyRevenue: number;
      newUsers: number;
      payingUsers: number;
      visitors?: number | null;
}

// 总体数据接口
export interface ITotalStatistics {
      totalSales: number;
      totalRevenue: number;
      totalUsers: number;
      totalPayingUsers: number;
}

// 图表数据点接口
export interface IChartDataPoint {
      date: string;
      value: number;
}

// 销量趋势数据接口
export type ISalesTrend = IChartDataPoint[];

// 销售额趋势数据接口
export type IRevenueTrend = IChartDataPoint[];

// 用户总数趋势数据接口
export type IUsersTrend = IChartDataPoint[];

// 统计数据面板类型枚举
export enum StatisticsPanelType {
      DAILY_OVERVIEW = 'daily_overview',
      TOTAL_STATISTICS = 'total_statistics',
      SALES_TREND = 'sales_trend',
      REVENUE_TREND = 'revenue_trend',
      USERS_TREND = 'users_trend'
}