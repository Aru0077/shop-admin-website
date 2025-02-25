// src/views/dashboard/index.vue
<template>
    <div class="dashboard-container p-6">
        <div class="mb-6">
            <el-row :gutter="20">
                <el-col :span="24">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-bold">数据统计大盘</h2>
                        <el-button type="primary" :icon="Refresh" @click="refreshAllData">刷新数据</el-button>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="w-full py-20">
            <el-skeleton style="width: 100%" :rows="10" animated />
        </div>

        <template v-else>
            <!-- 今日概览卡片 -->
            <div class="mb-6">
                <el-row :gutter="20">
                    <el-col :span="24">
                        <h3 class="text-lg font-medium mb-4">今日概览</h3>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in overviewCards" :key="index" class="mb-4">
                        <el-card shadow="hover" :body-style="{ padding: '20px' }">
                            <div class="flex items-center">
                                <el-icon class="text-blue-500 mr-3" :size="40">
                                    <component :is="item.icon"></component>
                                </el-icon>
                                <div>
                                    <div class="text-gray-500 text-sm">{{ item.title }}</div>
                                    <div class="text-2xl font-bold mt-1">{{ item.value }}</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 总体数据卡片 -->
            <div class="mb-6">
                <el-row :gutter="20">
                    <el-col :span="24">
                        <h3 class="text-lg font-medium mb-4">总体数据</h3>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in totalCards" :key="index" class="mb-4">
                        <el-card shadow="hover" :body-style="{ padding: '20px' }">
                            <div class="flex items-center">
                                <el-icon class="text-green-500 mr-3" :size="40">
                                    <component :is="item.icon"></component>
                                </el-icon>
                                <div>
                                    <div class="text-gray-500 text-sm">{{ item.title }}</div>
                                    <div class="text-2xl font-bold mt-1">{{ item.value }}</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 趋势图表 -->
            <div class="trend-charts">
                <el-row :gutter="20">
                    <el-col :span="24">
                        <h3 class="text-lg font-medium mb-4">数据趋势</h3>
                    </el-col>

                    <!-- 销量趋势图 -->
                    <el-col :xs="24" :lg="12" class="mb-6">
                        <el-card shadow="hover" class="h-96">
                            <template #header>
                                <div class="flex justify-between items-center">
                                    <span>30天销量趋势</span>
                                    <el-button :icon="Refresh" @click="refreshSalesData" circle plain size="small" />
                                </div>
                            </template>
                            <div class="h-full">
                                <base-chart v-if="salesChartData.datasets.length > 0" type="line" :data="salesChartData"
                                    :options="salesChartOptions" :height="280" />
                                <div v-else class="flex items-center justify-center h-full">
                                    <el-empty description="暂无数据" />
                                </div>
                            </div>
                        </el-card>
                    </el-col>

                    <!-- 销售额趋势图 -->
                    <el-col :xs="24" :lg="12" class="mb-6">
                        <el-card shadow="hover" class="h-96">
                            <template #header>
                                <div class="flex justify-between items-center">
                                    <span>30天销售额趋势</span>
                                    <el-button :icon="Refresh" @click="refreshRevenueData" circle plain size="small" />
                                </div>
                            </template>
                            <div class="h-full">
                                <base-chart v-if="revenueChartData.datasets.length > 0" type="line"
                                    :data="revenueChartData" :options="revenueChartOptions" :height="280" />
                                <div v-else class="flex items-center justify-center h-full">
                                    <el-empty description="暂无数据" />
                                </div>
                            </div>
                        </el-card>
                    </el-col>

                    <!-- 用户累计图 -->
                    <el-col :span="24" class="mb-6">
                        <el-card shadow="hover" class="h-96">
                            <template #header>
                                <div class="flex justify-between items-center">
                                    <span>30天用户累计趋势</span>
                                    <el-button :icon="Refresh" @click="refreshUsersData" circle plain size="small" />
                                </div>
                            </template>
                            <div class="h-full">
                                <base-chart v-if="usersChartData.datasets.length > 0" type="line" :data="usersChartData"
                                    :options="usersChartOptions" :height="280" />
                                <div v-else class="flex items-center justify-center h-full">
                                    <el-empty description="暂无数据" />
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {  computed, onMounted } from 'vue';
import { useStatisticsStore } from '@/stores/statistics.store';
import { formatDate } from '@/utils/date';
import { ElMessage } from 'element-plus'
import BaseChart from '@/components/common/BaseChart.vue';
import {
    Refresh,
    ShoppingCart,
    Money,
    User,
    CreditCard,
    Goods,
    ShoppingBag,
    UserFilled,
    Wallet
} from '@element-plus/icons-vue';
import { ChartData, ChartOptions } from 'chart.js';

// 初始化store
const statisticsStore = useStatisticsStore();
const loading = computed(() => statisticsStore.loading);

// 数据计算属性
const dailyOverview = computed(() => statisticsStore.dailyOverview);
const totalStatistics = computed(() => statisticsStore.totalStatistics);
const salesTrend = computed(() => statisticsStore.salesTrend);
const revenueTrend = computed(() => statisticsStore.revenueTrend);
const usersTrend = computed(() => statisticsStore.usersTrend);

// 初始化数据
onMounted(async () => {
    await refreshAllData();
});

// 刷新所有数据
const refreshAllData = async () => {
    try {
        await statisticsStore.refreshAllStatistics();
    } catch (error) {
        console.error('获取统计数据失败:', error);
        ElMessage.error('获取统计数据失败，请稍后重试');
    }
};

// 刷新单个图表数据
const refreshSalesData = () => statisticsStore.getLast30DaysSales(true);
const refreshRevenueData = () => statisticsStore.getLast30DaysRevenue(true);
const refreshUsersData = () => statisticsStore.getLast30DaysUsers(true);

// 格式化货币
const formatCurrency = (value: number) => {
    return `¥${value.toLocaleString()}`;
};

// 今日概览卡片数据
const overviewCards = computed(() => {
    if (!dailyOverview.value) return [];

    return [
        {
            title: '今日销量',
            value: dailyOverview.value.dailySales.toLocaleString(),
            icon: ShoppingCart
        },
        {
            title: '今日销售额',
            value: formatCurrency(dailyOverview.value.dailyRevenue),
            icon: Money
        },
        {
            title: '新增用户',
            value: dailyOverview.value.newUsers.toLocaleString(),
            icon: User
        },
        {
            title: '支付用户',
            value: dailyOverview.value.payingUsers.toLocaleString(),
            icon: CreditCard
        }
    ];
});

// 总数据卡片
const totalCards = computed(() => {
    if (!totalStatistics.value) return [];

    return [
        {
            title: '总销量',
            value: totalStatistics.value.totalSales.toLocaleString(),
            icon: Goods
        },
        {
            title: '总销售额',
            value: formatCurrency(totalStatistics.value.totalRevenue),
            icon: ShoppingBag
        },
        {
            title: '总用户数',
            value: totalStatistics.value.totalUsers.toLocaleString(),
            icon: UserFilled
        },
        {
            title: '总支付用户',
            value: totalStatistics.value.totalPayingUsers.toLocaleString(),
            icon: Wallet
        }
    ];
});

// 销量图表数据
const salesChartData = computed<ChartData>(() => {
    if (!salesTrend.value || salesTrend.value.length === 0) {
        return { labels: [], datasets: [] };
    }

    return {
        labels: salesTrend.value.map(item => formatDate(item.date, 'MM-DD')),
        datasets: [
            {
                label: '销量',
                data: salesTrend.value.map(item => item.value),
                borderColor: '#409EFF',
                backgroundColor: 'rgba(64, 158, 255, 0.2)',
                tension: 0.4,
                fill: true
            }
        ]
    };
});

// 销售额图表数据
const revenueChartData = computed<ChartData>(() => {
    if (!revenueTrend.value || revenueTrend.value.length === 0) {
        return { labels: [], datasets: [] };
    }

    return {
        labels: revenueTrend.value.map(item => formatDate(item.date, 'MM-DD')),
        datasets: [
            {
                label: '销售额',
                data: revenueTrend.value.map(item => item.value),
                borderColor: '#67C23A',
                backgroundColor: 'rgba(103, 194, 58, 0.2)',
                tension: 0.4,
                fill: true
            }
        ]
    };
});

// 用户图表数据
const usersChartData = computed<ChartData>(() => {
    if (!usersTrend.value || usersTrend.value.length === 0) {
        return { labels: [], datasets: [] };
    }

    return {
        labels: usersTrend.value.map(item => formatDate(item.date, 'MM-DD')),
        datasets: [
            {
                label: '用户总数',
                data: usersTrend.value.map(item => item.value),
                borderColor: '#E6A23C',
                backgroundColor: 'rgba(230, 162, 60, 0.2)',
                tension: 0.4,
                fill: true
            }
        ]
    };
});

// 销量图表配置
const salesChartOptions = computed<ChartOptions>(() => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (context) {
                        return `销量: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };
});

// 销售额图表配置
const revenueChartOptions = computed<ChartOptions>(() => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (context) {
                        return `销售额: ¥${Number(context.raw).toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return '¥' + Number(value).toLocaleString();
                    }
                }
            }
        }
    };
});

// 用户图表配置
const usersChartOptions = computed<ChartOptions>(() => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (context) {
                        return `用户总数: ${Number(context.raw).toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };
});
</script>

<style scoped>
.dashboard-container {
    min-height: calc(100vh - 84px);
    background-color: #f5f7fa;
}

:deep(.el-card) {
    transition: all 0.3s;
}

:deep(.el-card:hover) {
    transform: translateY(-5px);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>