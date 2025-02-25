// src/components/product/ProductSearch.vue
<template>
      <el-card shadow="never" class="mb-4">
            <el-form :model="searchForm" inline @keyup.enter="handleSearch">
                  <!-- 基础搜索项 -->
                  <el-form-item label="商品名称">
                        <el-input v-model="searchForm.keyword" placeholder="商品名称/编码" clearable class="w-[200px]" />
                  </el-form-item>

                  <el-form-item label="商品分类">
                        <el-cascader v-model="selectedCategory" :options="formatCategoryTree" :props="cascaderProps"
                              placeholder="请选择分类" clearable class="w-[200px]" @change="handleCategoryChange" />
                  </el-form-item>

                  <el-form-item label="商品状态">
                        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable class="w-[200px]">
                              <el-option v-for="status in Object.values(ProductStatus)" :key="status"
                                    :label="getStatusLabel(status)" :value="status" />
                        </el-select>
                  </el-form-item>

                  <!-- 高级搜索项 -->
                  <template v-if="isAdvanced">
                        <el-form-item label="促销商品">
                              <el-select v-model="searchForm.is_promotion" placeholder="请选择" clearable
                                    class="w-[200px]">
                                    <el-option label="是" :value="1" />
                                    <el-option label="否" :value="0" />
                              </el-select>
                        </el-form-item>

                        <el-form-item label="排序方式">
                              <el-select v-model="searchForm.sort" placeholder="请选择排序字段" clearable class="w-[200px]">
                                    <el-option label="库存" value="stock" />
                                    <el-option label="销量" value="sales" />
                                    <el-option label="创建时间" value="created" />
                              </el-select>
                        </el-form-item>

                        <el-form-item label="排序方向" v-if="searchForm.sort">
                              <el-select v-model="searchForm.order" placeholder="请选择排序方向" class="w-[200px]">
                                    <el-option label="升序" value="asc" />
                                    <el-option label="降序" value="desc" />
                              </el-select>
                        </el-form-item>
                  </template>

                  <!-- 操作按钮 -->
                  <el-form-item>
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                        <el-button @click="handleReset">重置</el-button>
                        <el-button link @click="toggleAdvanced">
                              {{ isAdvanced ? '收起' : '展开' }}
                              <el-icon class="ml-1">
                                    <ArrowUp v-if="isAdvanced" />
                                    <ArrowDown v-else />
                              </el-icon>
                        </el-button>
                  </el-form-item>
            </el-form>
      </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { useCategoryStore } from '@/stores/category.store'
import { ProductStatus } from '@/types/product'
import type { IProductQueryParams } from '@/types/product'
import type { CascaderValue } from 'element-plus'

const categoryStore = useCategoryStore()

const props = defineProps<{
      initialValues?: Partial<IProductQueryParams>
}>()

const emit = defineEmits<{
      (e: 'search', params: IProductQueryParams): void
      (e: 'reset'): void
}>()

// 级联选择器配置
const cascaderProps = {
      value: 'id',
      label: 'name',
      children: 'children',
      checkStrictly: false, // 只能选择叶子节点
      emitPath: true // 返回完整路径
}

// 搜索表单状态
const searchForm = reactive<IProductQueryParams>({
      keyword: '',
      categoryId: undefined,
      status: undefined,
      is_promotion: undefined,
      sort: undefined,
      order: 'desc',
      ...props.initialValues
})

// 分类选择状态
const selectedCategory = ref<CascaderValue>([])

// 格式化分类树数据
const formatCategoryTree = computed(() => {
      return categoryStore.categoryTree.map(category => ({
            ...category,
            children: category.children?.map(child => ({
                  ...child,
                  children: undefined // 确保只有两级
            }))
      }))
})

// 处理分类选择变化 
const handleCategoryChange = (value: CascaderValue) => {
      // 将 CascaderValue 转换为 string[]
      const values = value as string[]
      // 如果有选择分类，使用最后一个值（叶子节点）作为categoryId
      searchForm.categoryId = values?.length > 0 ? Number(values[values.length - 1]) : undefined
}

// 高级搜索开关
const isAdvanced = ref(false)

// 商品状态标签
const getStatusLabel = (status: ProductStatus): string => {
      const statusMap: Record<ProductStatus, string> = {
            [ProductStatus.DRAFT]: '草稿', 
            [ProductStatus.ONLINE]: '已上架',
            [ProductStatus.OFFLINE]: '已下架',
            [ProductStatus.DELETED]: '已删除'
      }
      return statusMap[status]
}

// 切换高级搜索
const toggleAdvanced = () => {
      isAdvanced.value = !isAdvanced.value
}

// 搜索处理
const handleSearch = () => {
      const params: IProductQueryParams = {}

      // 只传递有值的参数
      if (searchForm.keyword) params.keyword = searchForm.keyword
      if (searchForm.categoryId) params.categoryId = searchForm.categoryId
      if (searchForm.status) params.status = searchForm.status
      if (searchForm.is_promotion !== undefined) params.is_promotion = searchForm.is_promotion
      if (searchForm.sort) {
            params.sort = searchForm.sort
            params.order = searchForm.order
      }

      emit('search', params)
}

// 重置处理
const handleReset = () => {
      selectedCategory.value = [] // 重置分类选择
      Object.assign(searchForm, {
            keyword: '',
            categoryId: '',
            status: undefined,
            is_promotion: undefined,
            sort: undefined,
            order: 'desc'
      })
      emit('reset')
}

// 初始化时，如果有初始分类ID，需要设置级联选择器的值
if (props.initialValues?.categoryId) {
      const category = categoryStore.findCategoryById(props.initialValues.categoryId)
      if (category) {
            const path = categoryStore.getCategoryPath(category.id)
            selectedCategory.value = path.map(item => item.id)
      }
}
</script>

<style scoped>
.el-form--inline .el-form-item {
      margin-right: 16px;
      margin-bottom: 16px;
}
</style>