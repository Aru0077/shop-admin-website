# src/components/common/MultiImageSelector.vue
<template>
      <el-dialog v-model="visible" title="选择详情图片" width="800px" append-to-body destroy-on-close>
            <div class="flex items-center justify-between mb-4">
                  <el-radio-group v-model="filterUsed" @change="handleFilterChange">
                        <el-radio-button :value="1">已使用</el-radio-button>
                        <el-radio-button :value="0">未使用</el-radio-button>
                        <el-radio-button :value="''">全部</el-radio-button>
                  </el-radio-group>

                  <div class="flex items-center space-x-2">
                        <span class="text-gray-500">已选择 {{ selectedImages.length }}/{{ maxSelect }} 张</span>
                        <el-button type="primary" @click="handleConfirm" :disabled="selectedImages.length === 0">
                              确认选择
                        </el-button>
                  </div>
            </div>

            <div class="grid grid-cols-4 gap-4">
                  <div v-for="image in imageStore.imageList" :key="image.id"
                        class="relative cursor-pointer hover:shadow-lg transition-shadow"
                        @click="toggleImageSelection(image)">
                        <el-image :src="image.imageUrl" fit="cover" class="w-full h-40 rounded" loading="lazy" />
                        <div v-if="isImageSelected(image)"
                              class="absolute inset-0 bg-primary/20 flex items-center justify-center rounded">
                              <div
                                    class="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                                    {{ getImageIndex(image) + 1 }}
                              </div>
                              <el-icon class="text-2xl text-primary">
                                    <Check />
                              </el-icon>
                        </div>
                        <div v-if="!isImageSelected(image) && isMaxSelected"
                              class="absolute inset-0 bg-black/40 rounded flex items-center justify-center">
                              <span class="text-white text-sm">已达上限</span>
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

// 已选择图片的简化类型
interface ISelectedImage extends Pick<IImage, 'id' | 'imageUrl'> {
      isUsed: number;
      createdAt: string;
}

const props = defineProps<{
      modelValue: boolean
      maxSelect?: number
      selectedUrls?: string[]
}>()

const emit = defineEmits<{
      'update:modelValue': [value: boolean]
      'select': [images: ISelectedImage[]]
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

// 已选择的图片
const selectedImages = ref<ISelectedImage[]>([])
const maxSelect = computed(() => props.maxSelect || 8)
const isMaxSelected = computed(() => selectedImages.value.length >= maxSelect.value)

// 初始化已选择的图片
watch(() => props.selectedUrls, (newUrls) => {
      if (newUrls) {
            selectedImages.value = newUrls.map(url => ({
                  id: 0,
                  imageUrl: url,
                  isUsed: 1,
                  createdAt: new Date().toISOString()
            }))
      } else {
            selectedImages.value = []
      }
}, { immediate: true })

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

// 图片选择相关方法
const isImageSelected = (image: IImage) => {
      return selectedImages.value.some(selected => selected.imageUrl === image.imageUrl)
}

const getImageIndex = (image: IImage) => {
      return selectedImages.value.findIndex(selected => selected.imageUrl === image.imageUrl)
}

const toggleImageSelection = (image: IImage) => {
      const index = getImageIndex(image)
      if (index > -1) {
            selectedImages.value.splice(index, 1)
      } else if (!isMaxSelected.value) {
            selectedImages.value.push({
                  id: image.id,
                  imageUrl: image.imageUrl,
                  isUsed: image.isUsed,
                  createdAt: image.createdAt
            })
      }
}

// 确认选择
const handleConfirm = () => {
      emit('select', selectedImages.value)
      visible.value = false
}

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
</script>

<style scoped>
.el-radio-group {
      margin-bottom: 1rem;
}
</style>