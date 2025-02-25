// src/components/product/ProductList.vue
<template>
      <el-card shadow="never">
            <el-table v-loading="loading" :data="products" border>
                  <el-table-column prop="productCode" label="商品编码" width="100" />
                  <el-table-column prop="name" label="商品名称" width="180" />
                  <el-table-column label="商品主图" width="100">
                        <template #default="{ row }">
                              <el-image v-if="row.mainImage" :src="row.mainImage" :preview-src-list="[row.mainImage]"
                                    fit="cover" class="w-16 h-16" />
                              <span v-else>-</span>
                        </template>
                  </el-table-column>

                  <el-table-column label="状态" width="260">
                        <template #default="{ row }">
                              <div class="flex">
                                    <el-button v-for="status in Object.values(ProductStatus)" :key="status"
                                          :type="row.status === status ? 'primary' : 'default'" size="small"
                                          @click="handleStatusChange(row, status)" :disabled="row.status === status">
                                          {{ getStatusLabel(status) }}
                                    </el-button>
                              </div>
                        </template>
                  </el-table-column>

                  <el-table-column label="促销" width="80">
                        <template #default="{ row }">
                              <el-tag :type="row.is_promotion ? 'danger' : 'info'">
                                    {{ row.is_promotion ? '是' : '否' }}
                              </el-tag>
                        </template>
                  </el-table-column>

                  <el-table-column label="创建时间" width="160">
                        <template #default="{ row }">
                              {{ formatDateTime(row.createdAt) }}
                        </template>
                  </el-table-column>

                  <el-table-column label="操作" min-width="400" fixed="right">
                        <template #default="{ row }">
                              <el-button-group>
                                    <el-button type="primary" size="small"
                                          :disabled="row.status === ProductStatus.DELETED" @click="$emit('edit', row)">
                                          编辑商品
                                    </el-button>
                                    <el-button type="warning" size="small" @click="$emit('sku', row)">
                                          SKU管理
                                    </el-button>
                                    <el-button type="info" size="small" @click="handleStockManage(row)">
                                          库存管理
                                    </el-button>
                                    <el-button type="success" size="small" @click="handlePriceManage(row)">
                                          价格管理
                                    </el-button>
                                    <el-button type="danger" size="small" @click="handlePromotionManage(row)">
                                          促销管理
                                    </el-button>
                                    <el-button type="primary" size="small" @click="handleStockLogs(row)">
                                          库存记录
                                    </el-button>

                              </el-button-group>
                        </template>
                  </el-table-column>
            </el-table>

            <!-- Pagination -->
            <div class="flex justify-end mt-4">
                  <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
                        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next"
                        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>

            <StockManageDrawer v-model="stockDrawerVisible" :product="currentProduct" @success="handleManageSuccess" />

            <PriceManageDrawer v-model="priceDrawerVisible" :product="currentProduct" @success="handleManageSuccess" />

            <PromotionManageDrawer v-model="promotionDrawerVisible" :product="currentProduct"
                  @success="handleManageSuccess" />

                  <StockLogsDrawer v-model="stockLogsDrawerVisible" :product="currentProduct" />

      </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ProductStatus } from '@/types/product'
import type { IProduct } from '@/types/product'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useProductStore } from '@/stores/product.store'
import StockManageDrawer from './StockManageDrawer.vue'
import PriceManageDrawer from './PriceManageDrawer.vue'
import PromotionManageDrawer from './PromotionManageDrawer.vue'
import StockLogsDrawer from './StockLogsDrawer.vue'

interface Props {
      products: IProduct[]
      loading?: boolean
      total: number
      page: number
      limit: number
}

const stockDrawerVisible = ref(false)
const priceDrawerVisible = ref(false)
const promotionDrawerVisible = ref(false)
const currentProduct = ref<IProduct>()

interface Emits {
      (e: 'edit', product: IProduct): void
      (e: 'sku', product: IProduct): void
      (e: 'stock', product: IProduct): void
      (e: 'price', product: IProduct): void
      (e: 'promotion', product: IProduct): void
      (e: 'update:page', page: number): void
      (e: 'update:limit', limit: number): void
      (e: 'statusChange', product: IProduct, status: ProductStatus): void
}

const props = withDefaults(defineProps<Props>(), {
      loading: false
})

const emit = defineEmits<Emits>()

const productStore = useProductStore()

// 分页相关
const currentPage = computed({
      get: () => props.page,
      set: (value) => emit('update:page', value)
})

const pageSize = computed({
      get: () => props.limit,
      set: (value) => emit('update:limit', value)
})

// 工具方法
function formatDateTime(date: string): string {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const getStatusLabel = (status: ProductStatus): string => {
      const statusMap: Record<ProductStatus, string> = {
            [ProductStatus.DRAFT]: '草稿',
            [ProductStatus.ONLINE]: '上架',
            [ProductStatus.OFFLINE]: '下架',
            [ProductStatus.DELETED]: '删除'
      }
      return statusMap[status]
}

// 事件处理方法
const handleSizeChange = (val: number) => {
      emit('update:limit', val)
}

const handleCurrentChange = (val: number) => {
      emit('update:page', val)
}

const handleStatusChange = async (product: IProduct, newStatus: ProductStatus) => {
      try {
            await ElMessageBox.confirm(
                  `确定要将商品状态变更为"${getStatusLabel(newStatus)}"吗？`,
                  '状态变更确认',
                  {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                  }
            )

            await productStore.updateProductStatus(product.id, { status: newStatus })
            ElMessage.success('状态更新成功')
            emit('statusChange', product, newStatus)
      } catch (error: any) {
            if (error !== 'cancel') {
                  ElMessage.error(error.message || '状态更新失败')
            }
      }
}

// 添加处理方法
const handleStockManage = (product: IProduct) => {
      currentProduct.value = product
      stockDrawerVisible.value = true
}

const handlePriceManage = (product: IProduct) => {
      currentProduct.value = product
      priceDrawerVisible.value = true
}

const handlePromotionManage = (product: IProduct) => {
      currentProduct.value = product
      promotionDrawerVisible.value = true
}

// 添加回调处理
const handleManageSuccess = () => {
      // 触发列表刷新
      emit('statusChange', currentProduct.value!, currentProduct.value!.status)
}

// 在变量声明部分添加
const stockLogsDrawerVisible = ref(false)

// 添加处理方法
const handleStockLogs = (product: IProduct) => {
    currentProduct.value = product
    stockLogsDrawerVisible.value = true
}


</script>