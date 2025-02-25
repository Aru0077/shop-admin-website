<!-- # src/views/product/index.vue -->
<template>
      <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="mb-6 flex justify-between items-center">
                  <h2 class="text-2xl font-bold">商品管理</h2>
                  <el-button type="primary" @click="handleAdd">新增商品</el-button>
            </div>

            <!-- Search Form -->
            <ProductSearch :initial-values="searchForm" @search="handleSearchSubmit" @reset="handleSearchReset" />

            <!-- Product List -->
            <ProductList :products="productStore.productList" :loading="productStore.loading"
                  :total="productStore.total" v-model:page="page" v-model:limit="limit" @edit="handleEdit"
                  @sku="handleSku" @delete="handleDelete" />

            <!-- Product Form Dialog -->
            <ProductFormDrawer v-model="dialogVisible" :type="dialogType" :product="currentProduct"
                  @success="handleSuccess" />

            <SkuDrawer v-model="skuDialogVisible" :type="skuDialogType" :product="currentProduct"
                  @success="handleSuccess" />
      </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProductStore } from '@/stores/product.store'
import { useCategoryStore } from '@/stores/category.store'
import { ProductStatus } from '@/types/product'
import type { IProduct, IProductQueryParams } from '@/types/product'
import ProductSearch from '@/components/product/ProductSearch.vue'
import ProductFormDrawer from '@/components/product/ProductFormDrawer.vue'
import SkuDrawer from '@/components/product/SkuDrawer.vue'
import ProductList from '@/components/product/ProductList.vue'

const productStore = useProductStore()
const categoryStore = useCategoryStore()

// Pagination
const page = ref(1)
const limit = ref(10)

// SKU 管理相关
const skuDialogVisible = ref(false)
const skuDialogType = ref<'add' | 'edit'>('add')

// 处理 SKU 管理
const handleSku = (row: IProduct) => {
      currentProduct.value = row
      skuDialogType.value = row.skus.length > 0 ? 'edit' : 'add'
      skuDialogVisible.value = true
}

// Search form
const searchForm = reactive<IProductQueryParams>({
      keyword: '',
      categoryId: undefined,
      status: undefined,
      is_promotion: undefined,
      sort: undefined,
      order: 'desc'
})

// 处理搜索提交
const handleSearchSubmit = (params: IProductQueryParams) => {
      Object.assign(searchForm, params)
      page.value = 1
      fetchData()
}

// 处理搜索重置
const handleSearchReset = () => {
      Object.assign(searchForm, {
            keyword: '',
            categoryId: '',
            status: undefined,
            is_promotion: undefined,
            sort: undefined,
            order: 'desc'
      })
      page.value = 1
      fetchData()
}

// Dialog
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentProduct = ref<IProduct>()

// Data fetching
const fetchData = () => {
      productStore.getProductList({
            page: page.value,
            limit: limit.value,
            ...searchForm
      })
}

onMounted(() => {
      fetchData()
      categoryStore.getCategoryTree()
})

const handleAdd = () => {
      dialogType.value = 'add'
      currentProduct.value = undefined
      dialogVisible.value = true
}

const handleEdit = (row: IProduct) => {
      dialogType.value = 'edit'
      currentProduct.value = row
      dialogVisible.value = true
}


const handleDelete = async (row: IProduct) => {
      try {
            await ElMessageBox.confirm('确定要删除该商品吗？删除后无法恢复', '提示', {
                  type: 'warning'
            })
            await productStore.updateProductStatus(row.id, {
                  status: ProductStatus.DELETED
            })
            ElMessage.success('删除成功')
            fetchData()
      } catch (error: any) {
            if (error !== 'cancel') {
                  ElMessage.error(error.message || '删除失败')
            }
      }
}

const handleSuccess = () => {
      fetchData()
}
</script>