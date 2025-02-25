<template>
      <el-drawer v-model="visible" title="商品库存记录" size="60%" direction="rtl" destroy-on-close>
            <div class="p-4">
                  <div class="mb-4 flex items-center">
                        <h3 class="text-lg font-bold">{{ product?.name }}</h3>
                        <el-tag class="ml-2">{{ product?.productCode }}</el-tag>
                  </div>

                  <el-table v-loading="stockLogsLoading" :data="stockLogsData.data" border stripe>
                        <el-table-column prop="createdAt" label="时间" width="180">
                              <template #default="{ row }">
                                    {{ formatDateTime(row.createdAt) }}
                              </template>
                        </el-table-column>
                        <el-table-column label="SKU" width="200">
                              <template #default="{ row }">
                                    <div>
                                          <div> {{ row.sku?.skuCode || '-' }}</div>
                                          <div v-if="row.skuInfo?.sku_specs?.length">
                                                <template v-for="(spec, index) in row.skuInfo.sku_specs" :key="index">
                                                      {{ spec.spec.name }}: {{ spec.specValue.value }}
                                                      <el-divider v-if="index < row.skuInfo.sku_specs.length - 1"
                                                            direction="vertical" />
                                                </template>
                                          </div>
                                    </div>
                              </template>
                        </el-table-column>
                        <el-table-column prop="type" label="操作类型" width="100">
                              <template #default="{ row }">
                                    <el-tag :type="getStockChangeTypeTag(row.type)">
                                          {{ getStockChangeTypeLabel(row.type) }}
                                    </el-tag>
                              </template>
                        </el-table-column>
                        <el-table-column prop="changeQuantity" label="变更数量" width="100">
                              <template #default="{ row }">
                                    <span :class="row.changeQuantity > 0 ? 'text-green-500' : 'text-red-500'">
                                          {{ row.changeQuantity > 0 ? '+' : '' }}{{ row.changeQuantity }}
                                    </span>
                              </template>
                        </el-table-column>
                        <el-table-column prop="currentStock" label="当前库存" width="100" />
                        <el-table-column prop="operator" label="操作员" width="120" />
                        <el-table-column prop="orderNo" label="订单号" width="180" />
                        <el-table-column prop="remark" label="备注" min-width="120" />
                  </el-table>

                  <div class="flex justify-end mt-4">
                        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                              :total="stockLogsData.total" :page-sizes="[10, 20, 50, 100]"
                              layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                              @current-change="handleCurrentChange" />
                  </div>
            </div>
      </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { IProduct } from '@/types/product'
import { useProductStore } from '@/stores/product.store'

interface Props {
      modelValue: boolean
      product?: IProduct
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const productStore = useProductStore()
const stockLogsData = computed(() => productStore.stockLogsData)
const stockLogsLoading = computed(() => productStore.stockLogsLoading)

const visible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
})

const currentPage = ref(1)
const pageSize = ref(10)

// 监听drawer打开，自动加载第一页数据
watch(() => props.modelValue, (newVal) => {
      if (newVal && props.product) {
            currentPage.value = 1
            pageSize.value = 10
            loadStockLogs()
      }
})

const loadStockLogs = async () => {
      if (props.product) {
            await productStore.getProductStockLogs(props.product.id, {
                  page: currentPage.value,
                  limit: pageSize.value
            })
      }
}

const handleSizeChange = (val: number) => {
      pageSize.value = val
      loadStockLogs()
}

const handleCurrentChange = (val: number) => {
      currentPage.value = val
      loadStockLogs()
}

// 格式化日期时间
const formatDateTime = (date: string): string => {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// 库存变更类型
const getStockChangeTypeLabel = (type: number): string => {
      const typeMap: Record<number, string> = {
            1: '入库',
            2: '出库',
            3: '订单锁定',
            4: '订单释放',
            5: '盘点增加',
            6: '盘点减少',
            0: '其他'
      }
      return typeMap[type] || '未知'
}

// 获取库存变更类型对应的tag类型
const getStockChangeTypeTag = (type: number): 'success' | 'warning' | 'info' | 'primary' | 'danger' | undefined => {
    const tagMap: Record<number, 'success' | 'warning' | 'info' | 'primary' | 'danger' | undefined> = {
        1: 'success',  // 入库
        2: 'danger',   // 出库
        3: 'warning',  // 订单锁定
        4: 'info',     // 订单释放
        5: 'success',  // 盘点增加
        6: 'danger',   // 盘点减少
        0: undefined   // 其他 - use undefined instead of empty string
    };
    
    return tagMap[type] || undefined; // Return undefined for unknown types
}
</script>