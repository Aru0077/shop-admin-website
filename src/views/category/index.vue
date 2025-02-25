<!-- # src/views/category/index.vue -->
<template>
      <div class="container mx-auto px-4 py-8">
            <div class="mb-6 flex justify-between items-center">
                  <h2 class="text-2xl font-bold">分类管理</h2>
                  <el-button type="primary" @click="handleAdd">新增分类</el-button>
            </div>

            <!-- 分类树表格 -->
            <el-card shadow="never" class="mb-4">
                  <el-table v-loading="categoryStore.loading" :data="categoryTree" row-key="id" border
                        default-expand-all :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
                        <el-table-column prop="id" label="ID" width="80" />
                        <el-table-column prop="name" label="分类名称" min-width="200" />
                        <el-table-column prop="level" label="层级" width="80" />
                        <el-table-column label="创建时间" width="180">
                              <template #default="{ row }">
                                    {{ formatDate(row.createdAt) }}
                              </template>
                        </el-table-column>
                        <el-table-column label="操作" width="200" fixed="right">
                              <template #default="{ row }">
                                    <el-button-group>
                                          <el-button type="primary" size="small" @click="handleEdit(row)">
                                                编辑
                                          </el-button>
                                          <el-button type="danger" size="small" @click="handleDelete(row)">
                                                删除
                                          </el-button>
                                    </el-button-group>
                              </template>
                        </el-table-column>
                  </el-table>
            </el-card>

            <!-- 新增/编辑对话框 -->
            <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增分类' : '编辑分类'" width="500px"
                  @close="resetForm">
                  <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
                        <el-form-item label="分类名称" prop="name">
                              <el-input v-model="formData.name" />
                        </el-form-item>
                        <el-form-item label="父级分类" prop="parentId">
                              <el-select v-model="formData.parentId" placeholder="请选择父级分类" clearable>
                                    <el-option label="顶级分类" :value="0" />
                                    <el-option v-for="category in availableParentCategories" :key="category.id"
                                          :label="category.name" :value="Number(category.id)"
                                          :disabled="isDisabledParent(category)" />
                              </el-select>
                        </el-form-item>
                  </el-form>
                  <template #footer>
                        <span class="dialog-footer">
                              <el-button @click="dialogVisible = false">取消</el-button>
                              <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
                                    确定
                              </el-button>
                        </span>
                  </template>
            </el-dialog>
      </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useCategoryStore } from '@/stores/category.store'
import { formatDate } from '@/utils/date'
import type { ICategory } from '@/types/category'

const categoryStore = useCategoryStore()

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const currentId = ref('')

// 表单相关
const formRef = ref<FormInstance>()
const formData = reactive({
      name: '',
      parentId: 0
})

// 表单验证规则
const formRules: FormRules = {
      name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' },
            { min: 2, message: '分类名称不能少于2个字符', trigger: 'blur' }
      ],
      parentId: [
            { required: true, message: '请选择父级分类', trigger: 'change' }
      ]
}

// 获取分类树数据
const categoryTree = computed(() => {
      return categoryStore.categoryTree;
})

// 获取可用的父级分类列表（排除当前编辑的分类及其子分类）
const availableParentCategories = computed(() => {
      const result: ICategory[] = []
      const currentCategory = currentId.value ?
            categoryStore.findCategoryById(Number(currentId.value)) : null

      const flatten = (categories: ICategory[], category?: ICategory) => {
            categories.forEach(cat => {
                  if (!category || (cat.id !== category.id && !isChildOf(cat, category))) {
                        result.push(cat)
                  }
                  if (cat.children?.length) {
                        flatten(cat.children, category)
                  }
            })
      }

      flatten(categoryStore.categoryTree, currentCategory || undefined)
      return result
})

// 检查是否是禁用的父级选项
const isDisabledParent = (category: ICategory) => {
      if (!currentId.value) return false
      return category.id === Number(currentId.value) || isChildOf(category, categoryStore.findCategoryById(Number(currentId.value)))
}

// 检查是否是子分类
const isChildOf = (possibleChild: ICategory, parent?: ICategory | null): boolean => {
      if (!parent) return false
      if (possibleChild.parentId === parent.id) return true
      const parentCategory = categoryStore.findCategoryById(possibleChild.parentId)
      return parentCategory ? isChildOf(parentCategory, parent) : false
}

// 初始化数据
onMounted(() => {
      fetchData()
})

// 获取数据
const fetchData = () => {
      categoryStore.getCategoryTree(false) 
}

// 新增分类
const handleAdd = () => {
      dialogType.value = 'add'
      dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row: ICategory) => {
      dialogType.value = 'edit'
      currentId.value = String(row.id)
      formData.name = row.name
      formData.parentId = Number(row.parentId)
      dialogVisible.value = true
}

// 删除分类
const handleDelete = async (row: ICategory) => {
      try {
            await ElMessageBox.confirm('确定要删除该分类吗？删除后无法恢复', '提示', {
                  type: 'warning'
            })
            await categoryStore.deleteCategory(row.id)
            ElMessage.success('删除成功')
      } catch (error: any) {
            if (error !== 'cancel') {
                  ElMessage.error(error.message || '删除失败')
            }
      }
}

// 表单提交
const handleSubmit = async () => {
      if (!formRef.value) return

      try {
            await formRef.value.validate()
            submitLoading.value = true

            if (dialogType.value === 'add') {
                  await categoryStore.createCategory({
                        name: formData.name,
                        parentId: formData.parentId
                  })
                  ElMessage.success('添加成功')
            } else {
                  await categoryStore.updateCategory(Number(currentId.value), {
                        name: formData.name,
                        parentId: formData.parentId
                  })
                  ElMessage.success('更新成功')
            }

            dialogVisible.value = false
      } catch (error: any) {
            ElMessage.error(error.message || '操作失败')
      } finally {
            submitLoading.value = false
      }
}

// 重置表单
const resetForm = () => {
      if (formRef.value) {
            formRef.value.resetFields()
      }
      formData.name = ''
      formData.parentId = 0
      currentId.value = ''
}
</script>