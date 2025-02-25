# src/components/common/ImageSelector.vue
<template>
      <el-dialog v-model="visible" title="选择图片" width="800px" append-to-body destroy-on-close>
            <div class="mb-4">
                  <el-radio-group v-model="filterUsed" @change="handleFilterChange">
                        <el-radio-button :value="1">已使用</el-radio-button>
                        <el-radio-button :value="0">未使用</el-radio-button>
                        <el-radio-button :value="''">全部</el-radio-button>
                  </el-radio-group>
            </div>

            <div class="grid grid-cols-4 gap-4">
                  <div v-for="image in imageStore.imageList" :key="image.id"
                        class="relative cursor-pointer hover:shadow-lg transition-shadow" @click="handleSelect(image)">
                        <el-image :src="image.imageUrl" fit="cover" class="w-full h-40 rounded" loading="lazy" />
                        <div v-if="selectedImageUrl === image.imageUrl"
                              class="absolute inset-0 bg-primary/20 flex items-center justify-center rounded">
                              <el-icon class="text-2xl text-primary">
                                    <Check />
                              </el-icon>
                        </div>
                  </div>
            </div>

            <div class="flex justify-end mt-4">
                  <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="imageStore.total"
                        :page-sizes="[12, 24, 36, 48]" layout="total, sizes, prev, pager, next"
                        @size-change="handleSizeChange" @current-change="handlePageChange" />
            </div>
      </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { useImageStore } from '@/stores/image.store'
import type { IImage } from '@/types/image'

const props = defineProps<{
      modelValue: boolean
      selectedUrl?: string
}>()

const emit = defineEmits<{
      'update:modelValue': [value: boolean]
      'select': [image: IImage]
}>()

const imageStore = useImageStore()

// 弹窗控制
const visible = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
})

// 分页和筛选
const page = ref(1)
const pageSize = ref(12)
const filterUsed = ref<number | ''>('')
const selectedImageUrl = computed(() => props.selectedUrl)

// 加载图片列表
const loadImages = async () => {
      await imageStore.getImageList({
            page: page.value,
            limit: pageSize.value,
            isUsed: filterUsed.value || null
      })
}

// 监听弹窗显示
watch(() => visible.value, async (val) => {
      if (val) {
            await loadImages()
      }
})

// 分页和筛选处理
const handleSizeChange = (val: number) => {
      pageSize.value = val
      page.value = 1
      loadImages()
}

const handlePageChange = (val: number) => {
      page.value = val
      loadImages()
}

const handleFilterChange = () => {
      page.value = 1
      loadImages()
}

// 选择图片
const handleSelect = (image: IImage) => {
      emit('select', image)
      visible.value = false
}
</script>

<style scoped>
.el-radio-group {
      margin-bottom: 1rem;
}
</style>