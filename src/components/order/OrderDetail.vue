<!-- src/components/order/OrderDetail.vue -->
<template>
      <el-drawer v-model="visible" title="订单详情" size="80%" destroy-on-close @closed="handleClosed">
            <div v-if="orderStore.currentOrder" class="p-4">
                  <div class="mb-6 flex justify-between items-center">
                        <div class="flex items-center">
                              <h3 class="text-xl font-bold">订单号: {{ orderStore.currentOrder.orderNo }}</h3>
                              <el-button type="primary" size="small" class="ml-2" @click="copyOrderInfo">
                                    <el-icon>
                                          <Document />
                                    </el-icon>复制
                              </el-button>
                              <el-button v-if="orderStore.currentOrder.orderStatus === OrderStatus.PENDING_SHIPMENT"
                                    type="success" size="small" class="ml-2"
                                    @click="handleShip(orderStore.currentOrder)">
                                    <el-icon>
                                          <Van />
                                    </el-icon>发货
                              </el-button>
                        </div>


                        <div>
                              <order-status-tags type="order" :status="orderStore.currentOrder.orderStatus" />
                              <order-status-tags type="payment" :status="orderStore.currentOrder.paymentStatus"
                                    class="ml-2" />
                        </div>
                  </div>

                  <!-- 基本信息 -->
                  <el-card class="mb-4">
                        <template #header>
                              <div class="font-bold">基本信息</div>
                        </template>
                        <el-descriptions :column="2" border>
                              <el-descriptions-item label="用户名">
                                    {{ orderStore.currentOrder.user?.username || '未知用户' }}
                              </el-descriptions-item>
                              <el-descriptions-item label="下单时间">
                                    {{ formatDate(orderStore.currentOrder.createdAt) }}
                              </el-descriptions-item>
                              <el-descriptions-item label="订单金额">
                                    {{ formatPrice(orderStore.currentOrder.totalAmount) }}
                              </el-descriptions-item>
                              <el-descriptions-item label="实付金额">
                                    {{ formatPrice(orderStore.currentOrder.paymentAmount) }}
                              </el-descriptions-item>
                              <el-descriptions-item label="最后更新">
                                    {{ formatDate(orderStore.currentOrder.updatedAt) }}
                              </el-descriptions-item>
                        </el-descriptions>
                  </el-card>

                  <!-- 收货地址 -->
                  <el-card class="mb-4">
                        <template #header>
                              <div class="font-bold">收货信息</div>
                        </template>
                        <div v-if="orderStore.currentOrder.shippingAddress" class="p-2">
                              <p><span class="font-medium">收货人：</span>{{
                                    orderStore.currentOrder.shippingAddress.receiverName }}</p>
                              <p><span class="font-medium">联系电话：</span>{{
                                    orderStore.currentOrder.shippingAddress.receiverPhone }}</p>
                              <p class="mt-2"><span class="font-medium">收货地址：</span>
                                    {{ orderStore.currentOrder.shippingAddress.province }}
                                    {{ orderStore.currentOrder.shippingAddress.city }}
                                    {{ orderStore.currentOrder.shippingAddress.detailAddress }}
                              </p>
                        </div>
                  </el-card>

                  <!-- 商品信息 -->
                  <el-card class="mb-4">
                        <template #header>
                              <div class="font-bold">商品信息</div>
                        </template>
                        <el-table :data="orderStore.currentOrder.orderItems || []" border>
                              <el-table-column label="商品图片" width="100">
                                    <template #default="{ row }">
                                          <el-image :src="row.mainImage" fit="cover" style="width: 80px; height: 80px"
                                                :preview-src-list="[row.mainImage]">
                                                <template #error>
                                                      <div
                                                            class="h-20 w-20 bg-gray-200 flex items-center justify-center">
                                                            <el-icon>
                                                                  <picture-filled />
                                                            </el-icon>
                                                      </div>
                                                </template>
                                          </el-image>
                                    </template>
                              </el-table-column>
                              <el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
                              <el-table-column label="规格" min-width="120">
                                    <template #default="{ row }">
                                          <div v-if="row.skuSpecs && row.skuSpecs.length">
                                                <template v-for="(spec, index) in row.skuSpecs" :key="index">
                                                      {{ spec.specName }}: {{ spec.specValue }}
                                                      <el-divider v-if="index < row.skuSpecs.length - 1"
                                                            direction="vertical" />
                                                </template>
                                          </div>
                                          <span v-else>-</span>
                                    </template>
                              </el-table-column>
                              <el-table-column prop="quantity" label="数量" width="80" />
                              <el-table-column label="单价" width="120">
                                    <template #default="{ row }">
                                          {{ formatPrice(row.unitPrice) }}
                                    </template>
                              </el-table-column>
                              <el-table-column label="小计" width="120">
                                    <template #default="{ row }">
                                          {{ formatPrice(row.totalPrice) }}
                                    </template>
                              </el-table-column>
                        </el-table>
                  </el-card>

                  <!-- 支付信息 -->
                  <el-card class="mb-4"
                        v-if="orderStore.currentOrder.paymentLogs && orderStore.currentOrder.paymentLogs.length">
                        <template #header>
                              <div class="font-bold">支付记录</div>
                        </template>
                        <el-table :data="orderStore.currentOrder.paymentLogs" border>
                              <el-table-column prop="paymentType" label="支付方式" width="120" />
                              <el-table-column label="支付金额" width="120">
                                    <template #default="{ row }">
                                          {{ formatPrice(row.amount) }}
                                    </template>
                              </el-table-column>
                              <el-table-column prop="transactionId" label="交易号" min-width="200" show-overflow-tooltip />
                              <el-table-column label="支付状态" width="120">
                                    <template #default="{ row }">
                                          <el-tag :type="row.status === 1 ? 'success' : 'info'">
                                                {{ row.status === 1 ? '支付成功' : '支付失败' }}
                                          </el-tag>
                                    </template>
                              </el-table-column>
                              <el-table-column label="支付时间" min-width="180">
                                    <template #default="{ row }">
                                          {{ formatDate(row.createdAt) }}
                                    </template>
                              </el-table-column>
                        </el-table>
                  </el-card>

                  <!-- 操作按钮 -->
                  <div class="flex justify-center mt-4">
                        <el-button v-if="orderStore.currentOrder.orderStatus === OrderStatus.PENDING_SHIPMENT"
                              type="primary" @click="handleShip(orderStore.currentOrder)">
                              发货
                        </el-button>
                  </div>
            </div>
            <div v-else class="flex justify-center items-center h-full">
                  <el-empty description="暂无订单详情" />
            </div>
      </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { PictureFilled } from '@element-plus/icons-vue';
import { useOrderStore } from '@/stores/order.store';
import { formatDate } from '@/utils/date';
import { OrderStatus } from '@/constants/orderStatus.enum';
import type { IOrder } from '@/types/order';
import OrderStatusTags from '@/components/order/OrderStatusTags.vue';
import { Document, Van } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';


const props = defineProps<{
      modelValue: boolean
}>();

const emit = defineEmits(['update:modelValue', 'ship', 'closed']);

const orderStore = useOrderStore();
const visible = ref(props.modelValue);

// 格式化价格为蒙古图格里克格式
const formatPrice = (price: number): string => {
      // 添加千分位分隔符
      const formattedPrice = price.toLocaleString('mn-MN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
      });
      // 添加蒙古图格里克符号
      return `${formattedPrice} ₮`;
};

// 复制订单信息方法
const copyOrderInfo = () => {
      if (!orderStore.currentOrder) return;

      // 格式化收货地址
      const address = orderStore.currentOrder.shippingAddress ?
            `${orderStore.currentOrder.shippingAddress.province} ${orderStore.currentOrder.shippingAddress.city} ${orderStore.currentOrder.shippingAddress.detailAddress}` :
            '未提供';

      // 基本订单信息
      let text = `User Name: ${orderStore.currentOrder.user?.username || '未知用户'}
Payment Amount: ${formatPrice(orderStore.currentOrder.paymentAmount)}
To: ${orderStore.currentOrder.shippingAddress?.receiverName || '未提供'}
Phone: ${orderStore.currentOrder.shippingAddress?.receiverPhone || '未提供'}
Address: ${address}
`;

      // 添加所有商品信息
      if (orderStore.currentOrder.orderItems && orderStore.currentOrder.orderItems.length > 0) {
            text += `\n-- Products (${orderStore.currentOrder.orderItems.length}) --\n`;

            orderStore.currentOrder.orderItems.forEach((item, index) => {
                  // 格式化规格信息
                  let specText = '-';
                  if (item.skuSpecs && item.skuSpecs.length > 0) {
                        specText = item.skuSpecs.map((spec: { specName: any; specValue: any; }) => `${spec.specName}: ${spec.specValue}`).join(', ');
                  }

                  text += `
${index + 1}. Product Name: ${item.productName || '未提供'}
   Specifications: ${specText}
   Quantity: ${item.quantity || 0}
   Unit Price: ${formatPrice(item.unitPrice || 0)}
   Total Price: ${formatPrice(item.totalPrice || 0)}
`;
            });
      }

      // 复制到剪贴板
      navigator.clipboard.writeText(text)
            .then(() => {
                  ElMessage.success('订单信息已复制到剪贴板');
            })
            .catch(() => {
                  ElMessage.error('复制失败，请手动复制');
                  console.log(text); // 如果复制失败，至少在控制台打印出来
            });
};

watch(() => props.modelValue, (newVal) => {
      visible.value = newVal;
});

watch(() => visible.value, (newVal) => {
      emit('update:modelValue', newVal);
});

// 发货处理
const handleShip = (order: IOrder) => {
      emit('ship', order);
};

// 关闭抽屉时触发
const handleClosed = () => {
      emit('closed');
};
</script>