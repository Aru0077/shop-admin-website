// src/components/product/PromotionManageDrawer.vue
<template>
      <el-drawer v-model="visible" :title="title" size="1200px" append-to-body destroy-on-close>
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

                        <!-- 原价 -->
                        <el-table-column label="原价" align="center" width="120">
                              <template #default="{ row }">
                                    {{ formatPrice(row.price) }}
                              </template>
                        </el-table-column>

                        <!-- 当前促销价 -->
                        <el-table-column label="当前促销价" align="center" width="120">
                              <template #default="{ row }">
                                    {{ row.promotion_price ? formatPrice(row.promotion_price) : '-' }}
                              </template>
                        </el-table-column>

                        <!-- 新促销价 -->
                        <el-table-column label="新促销价" align="center" width="190">
                              <template #default="{ row }">
                                    <el-input-number v-model="row.newPromotionPrice" :min="0" :max="row.price"
                                          :step="1000" :precision="0" controls-position="right" size="small"
                                          placeholder="不填则取消促销" />
                                    <div class="text-xs text-gray-400 mt-1">
                                          最高可设置 {{ formatPrice(row.price) }}
                                    </div>
                              </template>
                        </el-table-column>

                        <!-- 折扣率 -->
                        <el-table-column label="折扣率" align="center" min-width="100">
                              <template #default="{ row }">
                                    <template v-if="row.newPromotionPrice">
                                          {{ calculateDiscount(row.newPromotionPrice, row.price) }}%
                                    </template>
                                    <span v-else>-</span>
                              </template>
                        </el-table-column>
                  </el-table>

                  <!-- 底部按钮 -->
                  <div class="flex justify-end gap-3 mt-6">
                        <el-button @click="visible = false">取消</el-button>
                        <el-button v-if="hasPromotionPrice" type="danger" :loading="cancelLoading"
                              @click="handleCancelPromotion">
                              取消所有促销价
                        </el-button>
                        <el-button type="primary" :loading="loading" :disabled="!hasChanges" @click="handleSubmit">
                              确认更新
                        </el-button>
                  </div>
            </div>
      </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSkuStore } from '@/stores/sku.store'
import { useSpecStore } from '@/stores/spec.store'
import type { IProduct } from '@/types/product'
import type { ISku, ISkuSpec, IUpdatePromotionPriceParams } from '@/types/sku'
import type { ISpec } from '@/types/spec'
import { useProductStore } from '@/stores/product.store'

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
const productStore = useProductStore()
const loading = ref(false)
const specs = ref<ISpec[]>([])
const skuList = ref<(ISku & { newPromotionPrice?: number | null })[]>([])
const cancelLoading = ref(false)

const visible = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
})

const title = computed(() =>
      props.product ? `${props.product.name} - 促销管理` : '促销管理'
)

const hasChanges = computed(() =>
      skuList.value.some(sku => {
            if (sku.newPromotionPrice === undefined) return false
            if (sku.newPromotionPrice === null && !sku.promotion_price) return false
            return sku.newPromotionPrice !== sku.promotion_price
      })
)

function formatPrice(price: number): string {
      // 添加千分位分隔符并保留2位小数
      const formattedPrice = price.toLocaleString('mn-MN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
      })
      // 添加蒙古图格里克符号
      return `${formattedPrice} ₮`
}

function calculateDiscount(promotionPrice: number, originalPrice: number): string {
      return ((promotionPrice / originalPrice) * 100).toFixed(1)
}

const getSpecValue = (specs: ISkuSpec[], specId: number): string => {
      const spec = specs.find(s => s.specId === specId)
      return spec?.specValue?.value || '-'
}

async function loadData() {
      if (!props.product?.id) return

      try {
            loading.value = true
            const response = await skuStore.getSkuList(props.product.id, true, false)
            skuList.value = response.items.map(sku => ({
                  ...sku,
                  newPromotionPrice: sku.promotion_price || null
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
            const updateItems: IUpdatePromotionPriceParams[] = skuList.value
                  .filter(sku => {
                        if (sku.newPromotionPrice === undefined) return false
                        if (sku.newPromotionPrice === null && !sku.promotion_price) return false
                        return sku.newPromotionPrice !== sku.promotion_price
                  })
                  .map(sku => ({
                        skuId: sku.id,
                        promotionPrice: sku.newPromotionPrice || 0
                  }))

            await skuStore.updatePromotionPrices(props.product.id, updateItems)

            // 更新商品store中的促销状态
            if (props.product && productStore.findProductById(props.product.id)) {
                  await productStore.updateLocalProductPromotion(props.product.id, 1)
            }

            ElMessage.success('促销价更新成功')
            emit('success')
            visible.value = false
      } catch (error: any) {
            ElMessage.error(error.message || '促销价更新失败')
      } finally {
            loading.value = false
      }
}

// 添加取消促销的方法
async function handleCancelPromotion() {
      if (!props.product?.id) return

      try {
            cancelLoading.value = true
            await ElMessageBox.confirm(
                  '确定要取消该商品的所有促销价吗？此操作将清除所有SKU的促销价设置。',
                  '取消促销',
                  {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                  }
            )

            await skuStore.cancelPromotion(props.product.id)

            // 更新商品store中的促销状态
            if (props.product && productStore.findProductById(props.product.id)) {
                  await productStore.updateLocalProductPromotion(props.product.id, 0)
            }

            ElMessage.success('已成功取消所有促销价')
            emit('success')
            visible.value = false
      } catch (error: any) {
            if (error !== 'cancel') { // 用户点击取消按钮时不显示错误
                  ElMessage.error(error.message || '取消促销价失败')
            }
      } finally {
            cancelLoading.value = false
      }
}

const hasPromotionPrice = computed(() => {
      // 判断当前是否有任何SKU设置了促销价
      return skuList.value.some(sku => sku.promotion_price && sku.promotion_price > 0);
});

watch(() => visible.value, async (val) => {
      if (val) {
            await loadData()
      } else {
            skuList.value = []
            specs.value = []
      }
})
</script>