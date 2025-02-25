// src/stores/statistics.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { statisticsApi } from '@/api/statistics.api'
import type {
      IDailyOverview,
      ITotalStatistics,
      ISalesTrend,
      IRevenueTrend,
      IUsersTrend
} from '@/types/statistics'

export const useStatisticsStore = defineStore('statistics', () => {
      // 状态定义
      const dailyOverview = ref<IDailyOverview | null>(null)
      const totalStatistics = ref<ITotalStatistics | null>(null)
      const salesTrend = ref<ISalesTrend | null>(null)
      const revenueTrend = ref<IRevenueTrend | null>(null)
      const usersTrend = ref<IUsersTrend | null>(null)

      const loading = ref<boolean>(false)
      const lastFetchTimes = ref<Record<string, number>>({
            dailyOverview: 0,
            totalStatistics: 0,
            salesTrend: 0,
            revenueTrend: 0,
            usersTrend: 0
      })

      // 辅助函数：检查是否需要刷新数据
      const needsRefresh = (key: keyof typeof lastFetchTimes.value, minutes: number = 5) => {
            const msToRefresh = minutes * 60 * 1000
            return Date.now() - lastFetchTimes.value[key] > msToRefresh
      }

      // 今日概览数据
      const getDailyOverview = async (forceRefresh = false) => {
            if (!forceRefresh && dailyOverview.value && !needsRefresh('dailyOverview', 1)) { // 1分钟刷新
                  return dailyOverview.value
            }

            loading.value = true
            try {
                  const res = await statisticsApi.getDailyOverview()
                  dailyOverview.value = res
                  lastFetchTimes.value.dailyOverview = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 总体统计数据
      const getTotalStatistics = async (forceRefresh = false) => {
            if (!forceRefresh && totalStatistics.value && !needsRefresh('totalStatistics')) {
                  return totalStatistics.value
            }

            loading.value = true
            try {
                  const res = await statisticsApi.getTotalStatistics()
                  totalStatistics.value = res
                  lastFetchTimes.value.totalStatistics = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 过去30天销量数据
      const getLast30DaysSales = async (forceRefresh = false) => {
            if (!forceRefresh && salesTrend.value && !needsRefresh('salesTrend')) {
                  return salesTrend.value
            }

            loading.value = true
            try {
                  const res = await statisticsApi.getLast30DaysSales()
                  salesTrend.value = res
                  lastFetchTimes.value.salesTrend = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 过去30天销售额数据
      const getLast30DaysRevenue = async (forceRefresh = false) => {
            if (!forceRefresh && revenueTrend.value && !needsRefresh('revenueTrend')) {
                  return revenueTrend.value
            }

            loading.value = true
            try {
                  const res = await statisticsApi.getLast30DaysRevenue()
                  revenueTrend.value = res
                  lastFetchTimes.value.revenueTrend = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 过去30天用户总数数据
      const getLast30DaysUsers = async (forceRefresh = false) => {
            if (!forceRefresh && usersTrend.value && !needsRefresh('usersTrend')) {
                  return usersTrend.value
            }

            loading.value = true
            try {
                  const res = await statisticsApi.getLast30DaysUsers()
                  usersTrend.value = res
                  lastFetchTimes.value.usersTrend = Date.now()
                  return res
            } finally {
                  loading.value = false
            }
      }

      // 刷新所有统计数据
      const refreshAllStatistics = async () => {
            await Promise.all([
                  getDailyOverview(true),
                  getTotalStatistics(true),
                  getLast30DaysSales(true),
                  getLast30DaysRevenue(true),
                  getLast30DaysUsers(true)
            ])
      }

      return {
            // 状态
            dailyOverview,
            totalStatistics,
            salesTrend,
            revenueTrend,
            usersTrend,
            loading,
            lastFetchTimes,

            // 方法
            getDailyOverview,
            getTotalStatistics,
            getLast30DaysSales,
            getLast30DaysRevenue,
            getLast30DaysUsers,
            refreshAllStatistics,
            needsRefresh
      }
}, {
      persist: true
})