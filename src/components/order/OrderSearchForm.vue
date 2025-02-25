<!-- src/components/order/OrderSearchForm.vue -->
<template>
      <el-card shadow="never" class="mb-4">
            <el-form :model="searchForm" label-width="100px">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <el-form-item label="订单状态">
                              <el-select v-model="searchForm.orderStatus" placeholder="全部状态" clearable class="w-full">
                                    <el-option v-for="option in orderStore.orderStatusOptions" :key="option.value"
                                          :label="option.label" :value="option.value" />
                              </el-select>
                        </el-form-item>
                        <el-form-item label="订单编号">
                              <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
                        </el-form-item>
                        <el-form-item label="开始日期">
                              <el-date-picker v-model="searchForm.startDate" type="date" placeholder="选择开始日期"
                                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="w-full" />
                        </el-form-item>
                        <el-form-item label="结束日期">
                              <el-date-picker v-model="searchForm.endDate" type="date" placeholder="选择结束日期"
                                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="w-full" />
                        </el-form-item>
                  </div>
                  <div class="flex justify-end">
                        <el-button @click="handleClearSearch">重置</el-button>
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                  </div>
            </el-form>
      </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useOrderStore } from '@/stores/order.store';

const orderStore = useOrderStore();

// 搜索表单
const searchForm = reactive({
      orderStatus: undefined as number | undefined,
      orderNo: '',
      startDate: '',
      endDate: ''
});

// 事件
const emit = defineEmits(['search', 'clearSearch']);

// 搜索处理
const handleSearch = () => {
      emit('search', { ...searchForm });
};

// 清除搜索
const handleClearSearch = () => {
      searchForm.orderStatus = undefined;
      searchForm.orderNo = '';
      searchForm.startDate = '';
      searchForm.endDate = '';

      emit('clearSearch');
};
</script>