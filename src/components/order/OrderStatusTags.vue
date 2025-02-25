<!-- src/components/order/OrderStatusTags.vue -->
<template>
      <component :is="tag" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { h } from 'vue';
import { ElTag } from 'element-plus';
import { useOrderStore } from '@/stores/order.store';
import { OrderStatus, PaymentStatus } from '@/constants/orderStatus.enum';

const props = defineProps<{
      type: 'order' | 'payment';
      status: number;
}>();

const orderStore = useOrderStore();

const getOrderTagType = (status: number) => {
      switch (status) {
            case OrderStatus.PENDING_PAYMENT:
                  return 'warning';
            case OrderStatus.PENDING_SHIPMENT:
                  return 'primary';
            case OrderStatus.SHIPPED:
            case OrderStatus.COMPLETED:
                  return 'success';
            case OrderStatus.CANCELLED:
                  return 'info';
            default:
                  return 'info';
      }
};

const getPaymentTagType = (status: number) => {
      switch (status) {
            case PaymentStatus.PAID:
                  return 'success';
            case PaymentStatus.UNPAID:
                  return 'warning';
            default:
                  return 'info';
      }
};

const tag = computed(() => {
      if (props.type === 'order') {
            return h(
                  ElTag,
                  { type: getOrderTagType(props.status) },
                  { default: () => orderStore.getOrderStatusText(props.status) }
            );
      } else {
            return h(
                  ElTag,
                  { type: getPaymentTagType(props.status) },
                  { default: () => orderStore.getPaymentStatusText(props.status) }
            );
      }
});
</script>