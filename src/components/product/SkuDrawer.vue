// src/components/product/SkuDrawer.vue
<template>
      <el-drawer v-model="visible" :title="drawerTitle" size="1000px" append-to-body destroy-on-close>
            <div class="p-6 space-y-6">
                  <!-- 已有 SKU 列表展示 -->
                  <div v-if="existingSkus.length > 0">
                        <div class="flex justify-between items-center mb-4">
                              <h3 class="text-lg font-medium">已配置的规格组合</h3>
                              <span class="text-gray-500 text-sm">
                                    共 {{ existingSkus.length }} 个SKU
                              </span>
                        </div>

                        <el-table :data="existingSkus" border size="large"
                              :header-cell-style="{ background: '#F5F7FA' }">
                              <el-table-column v-for="spec in existingSpecs" :key="spec.id" :label="spec.name"
                                    align="center" width="120">
                                    <template #default="{ row }">
                                          {{ getSpecValue(row.sku_specs, spec.id) }}
                                    </template>
                              </el-table-column>

                              <el-table-column label="SKU编码" prop="skuCode" width="180" align="center">
                                    <template #default="{ row }">
                                          <span class="font-mono">{{ row.skuCode }}</span>
                                    </template>
                              </el-table-column>

                              <el-table-column label="SKU图片" width="120" align="center">
                                    <template #default="{ row }">
                                          <el-image v-if="row.image" :src="row.image" fit="cover"
                                                class="w-16 h-16 rounded" :preview-src-list="[row.image]" />
                                          <el-icon v-else class="text-gray-400">
                                                <Picture />
                                          </el-icon>
                                    </template>
                              </el-table-column>

                              <el-table-column label="创建时间" width="180" align="center">
                                    <template #default="{ row }">
                                          {{ formatDateTime(row.createdAt) }}
                                    </template>
                              </el-table-column>
                        </el-table>
                  </div>

                  <!-- 新增 SKU 配置区域 -->
                  <div v-if="canAddSpecs" class="border-t pt-6">
                        <div class="mb-4">
                              <h3 class="text-lg font-medium mb-4">新增规格组合</h3>
                              <SpecSelector @generate="handleGenerate" />
                        </div>

                        <div v-if="newSkus.length > 0" class="mt-6">
                              <div class="flex justify-between items-center mb-4">
                                    <h4 class="font-medium">待创建的规格组合</h4>
                                    <span class="text-gray-500 text-sm">
                                          共 {{ newSkus.length }} 个新SKU
                                    </span>
                              </div>

                              <el-table :data="newSkus" border size="large"
                                    :header-cell-style="{ background: '#F5F7FA' }">
                                    <el-table-column v-for="spec in selectedSpecs" :key="spec.id" :label="spec.name"
                                          align="center" width="120">
                                          <template #default="{ row }">
                                                {{ getSpecValue(row.specs, spec.id) }}
                                          </template>
                                    </el-table-column>

                                    <el-table-column label="SKU编码" width="220" align="center">
                                          <template #default="{ row }">
                                                <el-input v-model="row.skuCode" placeholder="请输入SKU编码" :maxlength="32">
                                                      <template #prefix>
                                                            <el-icon>
                                                                  <Key />
                                                            </el-icon>
                                                      </template>
                                                </el-input>
                                          </template>
                                    </el-table-column>

                                    <el-table-column label="SKU图片" width="120" align="center">
                                          <template #default="{ row }">
                                                <div class="flex flex-col items-center">
                                                      <el-image v-if="row.image" :src="row.image" fit="cover"
                                                            class="w-16 h-16 rounded mb-1" />
                                                      <el-button type="primary" link @click="handleSelectImage(row)">
                                                            {{ row.image ? '更换图片' : '选择图片' }}
                                                      </el-button>
                                                </div>
                                          </template>
                                    </el-table-column>

                              </el-table>
                        </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex justify-end gap-3 border-t pt-4">
                        <el-button @click="handleClose">取消</el-button>
                        <el-button v-if="newSkus.length > 0" type="primary" :loading="loading" :disabled="!canCreate"
                              @click="handleCreate">
                              创建SKU
                        </el-button>
                  </div>
            </div>

            <!-- 图片选择器弹窗 -->
            <ImageSelector v-model="imageDialogVisible" :selected-url="currentEditingSku?.image"
                  @select="handleImageSelected" />
      </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Key } from '@element-plus/icons-vue'
import { useSkuStore } from '@/stores/sku.store'
import { useSpecStore } from '@/stores/spec.store'
import type { ISpec } from '@/types/spec'
import type { IProduct } from '@/types/product'
import type { ISku, ICreateSkuParams, ISkuSpec } from '@/types/sku'
import SpecSelector from './SpecSelector.vue'
import ImageSelector from '@/components/common/ImageSelector.vue'
import { IImage } from '@/types/image'

interface Props {
      modelValue: boolean
      product?: IProduct
}

interface IExtendedCreateSkuParams {
      specs: Array<{ specId: number; specValueId: number }>
      skuCode: string
      image?: string
}


const props = withDefaults(defineProps<Props>(), {
      product: undefined
})

const emit = defineEmits<{
      'update:modelValue': [value: boolean]
      'success': []
}>()

// Store
const skuStore = useSkuStore()
const specStore = useSpecStore()

// 状态管理
const loading = ref(false)
const existingSkus = ref<ISku[]>([])
const existingSpecs = ref<ISpec[]>([])
const newSkus = ref<IExtendedCreateSkuParams[]>([])
const selectedSpecs = ref<ISpec[]>([])

const imageDialogVisible = ref(false)
const currentEditingSku = ref<IExtendedCreateSkuParams | null>(null)

// 计算属性
const visible = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
})

const drawerTitle = computed(() =>
      props.product ? `${props.product.name} - SKU配置` : 'SKU管理'
)

const canAddSpecs = computed(() =>
      props.product !== undefined
)

const canCreate = computed(() =>
      newSkus.value.length > 0 && newSkus.value.every(sku => sku.skuCode.trim())
)

// 工具方法
function formatDateTime(date: string | Date): string {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getSpecValue(specs: ISkuSpec[] | ICreateSkuParams['specs'], specId: number): string {
      // 处理已有SKU的规格值
      if (Array.isArray(specs) && 'specValue' in specs[0]) {
            const spec = (specs as ISkuSpec[]).find(s => s.specId === specId)
            return spec?.specValue?.value || '-'
      }

      // 处理新增SKU的规格值
      const spec = (specs as ICreateSkuParams['specs']).find(s => s.specId === specId)
      if (!spec) return '-'

      const specInfo = specStore.findSpecById(spec.specId)
      const valueInfo = specInfo?.values.find(v => v.id === spec.specValueId)
      return valueInfo?.value || '-'
}

// 事件处理
async function loadExistingSkus() {
      if (!props.product?.id) return

      try {
            const response = await skuStore.getSkuList(props.product.id, true, false)
            existingSkus.value = response.items
            if (response.items.length > 0) {
                  const specIds = new Set(response.items[0].sku_specs.map(spec => spec.specId))
                  existingSpecs.value = await Promise.all(
                        Array.from(specIds).map(id => specStore.findSpecById(id))
                  ).then(specs => specs.filter((spec): spec is ISpec => spec !== undefined))
            }
      } catch (error) {
            ElMessage.error('加载SKU列表失败')
      }
}

function handleGenerate(combinations: Array<{ specId: number; specValueId: number }[]>) {
      selectedSpecs.value = combinations[0]
            .map(combo => specStore.findSpecById(combo.specId))
            .filter((spec): spec is ISpec => spec !== undefined)

      newSkus.value = combinations.map(specs => ({
            specs,
            skuCode: '',
            image: undefined
      }))
}

// 添加图片选择相关方法
function handleSelectImage(sku: IExtendedCreateSkuParams) {
      currentEditingSku.value = sku
      imageDialogVisible.value = true
}

function handleImageSelected(image: IImage) {
      if (currentEditingSku.value) {
            currentEditingSku.value.image = image.imageUrl
      }
      currentEditingSku.value = null
}

async function handleCreate() {
      if (!props.product?.id || newSkus.value.length === 0) return

      try {
            loading.value = true
            // 准备包含图片的 SKU 创建参数
            const skusToCreate = newSkus.value.map(({ specs, skuCode, image }) => ({
                  specs,
                  skuCode,
                  image // 包含 image 字段
            }))

            await skuStore.createSkus(props.product.id, skusToCreate)
            ElMessage.success('SKU创建成功')
            emit('success')
            handleClose()
      } catch (error: any) {
            ElMessage.error(error.message || 'SKU创建失败')
      } finally {
            loading.value = false
      }
}

function handleClose() {
      visible.value = false
      resetState()
}

function resetState() {
      existingSkus.value = []
      existingSpecs.value = []
      newSkus.value = []
      selectedSpecs.value = []
      currentEditingSku.value = null
}

// 监听器
watch(() => visible.value, async (val) => {
      if (val) {
            await loadExistingSkus()
      } else {
            resetState()
      }
})
</script>