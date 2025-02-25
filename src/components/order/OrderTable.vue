<!-- src/components/order/OrderTable.vue -->
<template>
      <el-card shadow="never">
            <el-table v-loading="orderStore.loading" :data="orderStore.orderList" border stripe style="width: 100%">
                  <el-table-column prop="orderNo" label="订单编号" min-width="180" show-overflow-tooltip />
                  <el-table-column label="用户信息" min-width="120">
                        <template #default="{ row }">
                              {{ row.user?.username || '未知用户' }}
                        </template>
                  </el-table-column>
                  <el-table-column label="订单金额" min-width="120">
                        <template #default="{ row }">
                              <span class="font-medium text-red-500">¥ {{ (row.totalAmount / 100).toFixed(2) }}</span>
                        </template>
                  </el-table-column>
                  <el-table-column label="实付金额" min-width="120">
                        <template #default="{ row }">
                              <span class="font-medium">¥ {{ (row.paymentAmount / 100).toFixed(2) }}</span>
                        </template>
                  </el-table-column>
                  <el-table-column label="商品数量" width="100">
                        <template #default="{ row }">
                              {{ row._count?.orderItems || 0 }} 件
                        </template>
                  </el-table-column>
                  <el-table-column label="订单状态" width="120">
                        <template #default="{ row }">
                              <order-status-tags type="order" :status="row.orderStatus" />
                        </template>
                  </el-table-column>
                  <el-table-column label="支付状态" width="120">
                        <template #default="{ row }">
                              <order-status-tags type="payment" :status="row.paymentStatus" />
                        </template>
                  </el-table-column>
                  <el-table-column label="下单时间" min-width="180">
                        <template #default="{ row }">
                              {{ formatDate(row.createdAt) }}
                        </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200" fixed="right">
                        <template #default="{ row }">
                              <el-button-group>
                                    <el-button type="primary" size="small" @click="handleViewDetail(row)">
                                          查看详情
                                    </el-button>
                                    <el-button v-if="row.orderStatus === OrderStatus.PENDING_SHIPMENT" type="success"
                                          size="small" @click="handleShip(row)">
                                          发货
                                    </el-button>
                              </el-button-group>
                        </template>
                  </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="mt-4 flex justify-end">
                  <el-pagination v-model:current-page="orderStore.currentPage" v-model:page-size="orderStore.pageSize"
                        :total="orderStore.total" :page-sizes="[10, 20, 50, 100]"
                        layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                        @current-change="handleCurrentChange" />
            </div>
      </el-card>
</template>

<script setup lang="ts">
import { useOrderStore } from '@/stores/order.store';
import { formatDate } from '@/utils/date';
import { OrderStatus } from '@/constants/orderStatus.enum';
import type { IOrder } from '@/types/order';
import OrderStatusTags from '@/components/order/OrderStatusTags.vue';

const orderStore = useOrderStore();

const emit = defineEmits(['viewDetail', 'ship', 'sizeChange', 'pageChange']);

// 分页处理
const handleSizeChange = (val: number) => {
      emit('sizeChange', val);
};

const handleCurrentChange = (val: number) => {
      emit('pageChange', val);
};

// 查看订单详情
const handleViewDetail = (row: IOrder) => {
      emit('viewDetail', row);
};

// 发货处理
const handleShip = (row: IOrder) => {
      emit('ship', row);
};
</script>