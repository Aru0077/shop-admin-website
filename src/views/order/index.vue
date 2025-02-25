<!-- src/views/order/index.vue -->
<template>
      <div class="container mx-auto px-4 py-8">
            <div class="mb-6">
                  <h2 class="text-2xl font-bold mb-4">订单管理</h2>

                  <!-- 搜索筛选区 -->
                  <order-search-form @search="handleSearch" @clear-search="handleClearSearch" />

                  <!-- 订单列表 -->
                  <order-table @view-detail="handleViewDetail" @ship="handleShip" @size-change="handleSizeChange"
                        @page-change="handleCurrentChange" />
            </div>

            <!-- 订单详情抽屉 -->
            <order-detail v-model="detailDrawerVisible" @ship="handleShip" @closed="handleDetailClosed" />

            <!-- 发货对话框 -->
            <shipment-dialog v-model="shipDialogVisible" :loading="submitLoading" @submit="submitShipForm"
                  @closed="handleShipmentClosed" />
      </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useOrderStore } from '@/stores/order.store';
import { OrderStatus } from '@/constants/orderStatus.enum';
import type { IOrder } from '@/types/order';

// 导入组件
import OrderSearchForm from '@/components/order/OrderSearchForm.vue';
import OrderTable from '@/components/order/OrderTable.vue';
import OrderDetail from '@/components/order/OrderDetail.vue';
import ShipmentDialog from '@/components/order/ShipmentDialog.vue';

const orderStore = useOrderStore();

// 控制详情抽屉和发货对话框的显示
const detailDrawerVisible = ref(false);
const shipDialogVisible = ref(false);
const submitLoading = ref(false);
const currentOrderId = ref<string>('');

// 初始化数据
onMounted(() => {
      fetchData();
});

// 获取数据
const fetchData = () => {
      orderStore.getOrders({
            page: orderStore.currentPage,
            limit: orderStore.pageSize,
            ...orderStore.filterConditions
      });
};

// 搜索处理
const handleSearch = (formData: any) => {
      orderStore.getOrders({
            page: 1, // 搜索时回到第一页
            limit: orderStore.pageSize,
            ...formData
      }, true);
};

// 清除搜索
const handleClearSearch = () => {
      orderStore.clearFilters();
      orderStore.getOrders({
            page: 1,
            limit: orderStore.pageSize
      }, true);
};

// 分页处理
const handleSizeChange = (val: number) => {
      orderStore.getOrders({
            page: 1,
            limit: val,
            ...orderStore.filterConditions
      });
};

const handleCurrentChange = (val: number) => {
      orderStore.getOrders({
            page: val,
            limit: orderStore.pageSize,
            ...orderStore.filterConditions
      });
};

// 查看订单详情
const handleViewDetail = async (row: IOrder) => {
      try {
            await orderStore.getOrderDetail(row.id);
            detailDrawerVisible.value = true;
      } catch (error: any) {
            ElMessage.error(error.message || '获取订单详情失败');
      }
};

// 处理详情抽屉关闭
const handleDetailClosed = () => {
      // 可以在这里进行一些清理工作
};

// 发货处理
const handleShip = (row: IOrder) => {
      if (row.orderStatus !== OrderStatus.PENDING_SHIPMENT) {
            ElMessage.warning('只有待发货状态的订单可以执行发货操作');
            return;
      }

      currentOrderId.value = row.id;
      shipDialogVisible.value = true;
};

// 提交发货表单
const submitShipForm = async (formData: { trackingNumber: string; remark?: string }) => {
      submitLoading.value = true;
      try {
            await orderStore.shipOrder(
                  currentOrderId.value,
                  formData.trackingNumber,
                  formData.remark
            );

            ElMessage.success('发货成功');
            shipDialogVisible.value = false;

            // 如果详情抽屉开着，更新详情
            if (detailDrawerVisible.value && orderStore.currentOrder) {
                  await orderStore.getOrderDetail(orderStore.currentOrder.id, true);
            }
      } catch (error: any) {
            ElMessage.error(error.message || '发货失败');
      } finally {
            submitLoading.value = false;
      }
};

// 处理发货对话框关闭
const handleShipmentClosed = () => {
      currentOrderId.value = '';
};
</script>