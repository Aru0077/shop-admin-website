# src/components/product/SpecSelector.vue
<template>
      <div>
            <!-- 规格选择 -->
            <div class="mb-4">
                  <div class="font-bold mb-2">选择规格</div>
                  <el-select v-model="selectedSpecs" multiple placeholder="请选择规格" class="w-full"
                        @change="handleSpecChange">
                        <el-option v-for="spec in specStore.specList" :key="spec.id" :label="spec.name"
                              :value="spec.id" />
                  </el-select>
            </div>

            <!-- 规格值组合 -->
            <div v-if="selectedSpecs.length > 0" class="mb-4">
                  <div class="font-bold mb-2">规格值</div>
                  <div v-for="specId in selectedSpecs" :key="specId" class="mb-2">
                        <div class="text-sm text-gray-600 mb-1">
                              {{ findSpecById(specId)?.name }}
                        </div>
                        <el-checkbox-group v-model="specValueSelections[specId]">
                              <el-checkbox v-for="value in findSpecById(specId)?.values" :key="value.id"
                                    :value="value.id">
                                    {{ value.value }}
                              </el-checkbox>
                        </el-checkbox-group>
                  </div>
                  <el-button type="primary" @click="generateCombinations" class="mt-2">
                        生成SKU列表
                  </el-button>
            </div>
      </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useSpecStore } from '@/stores/spec.store'
import type { SpecCombinationsType } from '@/types/spec'

const emit = defineEmits<{
    generate: [combinations: SpecCombinationsType]
}>()


const specStore = useSpecStore()

// 规格选择
const selectedSpecs = ref<string[]>([])
const specValueSelections = reactive<Record<string, string[]>>({})

// 处理规格选择变化
const handleSpecChange = () => {
      // 清空之前的选择
      Object.keys(specValueSelections).forEach(key => {
            if (!selectedSpecs.value.includes(key)) {
                  delete specValueSelections[key]
            }
      })

      // 初始化新选择的规格
      selectedSpecs.value.forEach(specId => {
            if (!specValueSelections[specId]) {
                  specValueSelections[specId] = []
            }
      })
}

// 查找规格
const findSpecById = (id: string) => {
      return specStore.specList.find(spec => spec.id === Number(id))
}

// 生成规格组合
const generateCombinations = () => {
      // 检查是否每个规格都选择了至少一个规格值
      const hasEmptySelection = selectedSpecs.value.some(
            specId => !specValueSelections[specId]?.length
      )

      if (hasEmptySelection) {
            ElMessage.warning('请为每个规格至少选择一个规格值')
            return
      }

      // 生成规格值组合
      const combinations: Array<{ specId: string, specValueId: string }[]> = []
      const generateHelper = (specs: string[], current: number, temp: any[]) => {
            if (current === specs.length) {
                  combinations.push([...temp])
                  return
            }

            const specId = specs[current]
            for (const valueId of specValueSelections[specId]) {
                  temp.push({ specId, specValueId: valueId })
                  generateHelper(specs, current + 1, temp)
                  temp.pop()
            }
      }

      generateHelper(selectedSpecs.value, 0, [])
      const typedCombinations: SpecCombinationsType = combinations.map(combo => 
        combo.map(spec => ({
            specId: Number(spec.specId),
            specValueId: Number(spec.specValueId)
        }))
    )

    emit('generate', typedCombinations)
}

// 初始化数据
const init = async () => {
      await specStore.getSpecList()
}

init()
</script>

<style scoped>
.el-checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
}
</style>