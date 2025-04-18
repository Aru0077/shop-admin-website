// src/components/product/StockManageDrawer.vue
<template>
      <el-drawer v-model="visible" :title="title" size="1000px" append-to-body destroy-on-close>
            <div class="p-6">
                  <el-table :data="skuList" border size="large" v-loading="loading">
                        <!-- 规格列 -->
                        <el-table-column v-for="spec in specs" :key="spec.id" :label="spec.name" align="center"
                              width="100">
                              <template #default="{ row }">
                                    {{ getSpecValue(row.sku_specs, spec.id) }}
                              </template>
                        </el-table-column>

                        <!-- SKU图片列 - 新增 -->
                        <el-table-column label="SKU图片" align="center" width="120">
                              <template #default="{ row }">
                                    <el-image v-if="row.image" :src="row.image" fit="cover" class="w-16 h-16 rounded"
                                          :preview-src-list="[row.image]" />
                                    <el-icon v-else class="text-gray-400">
                                          <Picture />
                                    </el-icon>
                              </template>
                        </el-table-column>

                        <!-- SKU编码 -->
                        <el-table-column label="SKU编码" prop="skuCode" align="center" width="120" />

                        <!-- 当前库存 -->
                        <el-table-column label="当前库存" prop="stock" align="center" width="100" />

                        <!-- 变更数量 -->
                        <el-table-column label="变更数量" align="center" width="160">
                              <template #default="{ row }">
                                    <el-input-number v-model="row.changeQuantity" :min="-(row.stock || 0)" :step="1"
                                          controls-position="right" size="small" />
                              </template>
                        </el-table-column>

                        <!-- 备注 -->
                        <el-table-column label="备注" align="center" min-width="150">
                              <template #default="{ row }">
                                    <el-input v-model="row.remark" placeholder="请输入备注信息" size="small" />
                              </template>
                        </el-table-column>
                  </el-table>

                  <!-- 底部按钮 -->
                  <div class="flex justify-end gap-3 mt-6">
                        <el-button @click="visible = false">取消</el-button>
                        <el-button type="primary" :loading="loading" :disabled="!hasChanges" @click="handleSubmit">
                              确认更新
                        </el-button>
                  </div>
            </div>
      </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useSkuStore } from '@/stores/sku.store'
import { useSpecStore } from '@/stores/spec.store'
import type { IProduct } from '@/types/product'
import type { ISku, ISkuSpec, IUpdateStockParams } from '@/types/sku'
import type { ISpec } from '@/types/spec'

interface Props {
      modelValue: boolean
      product?: IProduct
}

const props = withDefaults(defineProps<Props>(), {
      product: undefined
})

const emit = defineEmits<{
      'update:modelValue': [value: boolean]
      'success': []
}>()

const skuStore = useSkuStore()
const specStore = useSpecStore()
const loading = ref(false)
const specs = ref<ISpec[]>([])
const skuList = ref<(ISku & { changeQuantity?: number; remark?: string })[]>([])

const visible = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
})

const title = computed(() =>
      props.product ? `${props.product.name} - 库存管理` : '库存管理'
)

const hasChanges = computed(() =>
      skuList.value.some(sku => sku.changeQuantity && sku.changeQuantity !== 0)
)

const getSpecValue = (specs: ISkuSpec[], specId: number): string => {
      const spec = specs.find(s => s.specId === specId)
      return spec?.specValue?.value || '-'
}

async function loadData() {
      if (!props.product?.id) return

      try {
            loading.value = true
            const response = await skuStore.getSkuList(props.product.id, true, true)
            skuList.value = response.items.map(sku => ({
                  ...sku,
                  changeQuantity: 0,
                  remark: ''
            }))

            if (response.items.length > 0) {
                  const specIds = new Set(response.items[0].sku_specs.map(spec => spec.specId))
                  specs.value = await Promise.all(
                        Array.from(specIds).map(id => specStore.findSpecById(id))
                  ).then(specs => specs.filter((spec): spec is ISpec => spec !== undefined))
            }
      } catch (error) {
            ElMessage.error('加载SKU列表失败')
      } finally {
            loading.value = false
      }
}

async function handleSubmit() {
      if (!props.product?.id) return

      try {
            loading.value = true
            const updateItems: IUpdateStockParams[] = skuList.value
                  .filter(sku => sku.changeQuantity && sku.changeQuantity !== 0)
                  .map(sku => ({
                        skuId: sku.id,
                        changeQuantity: sku.changeQuantity!,
                        remark: sku.remark
                  }))

            await skuStore.updateStock(props.product.id, updateItems)
            ElMessage.success('库存更新成功')
            emit('success')
            visible.value = false
      } catch (error: any) {
            ElMessage.error(error.message || '库存更新失败')
      } finally {
            loading.value = false
      }
}

watch(() => visible.value, async (val) => {
      if (val) {
            await loadData()
      } else {
            skuList.value = []
            specs.value = []
      }
})
</script>