# src/components/product/ProductFormDrawer.vue
<template>
  <el-drawer v-model="visible" :title="drawerType === 'add' ? '新增商品' : '编辑商品'" size="1000px" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" class="px-4">
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>

      <el-form-item label="商品编码" prop="productCode" v-if="drawerType === 'add'">
        <el-input v-model="formData.productCode" />
      </el-form-item>

      <el-form-item label="商品分类" prop="categoryId">
        <el-cascader v-model="formData.categoryId" :options="categoryCascaderOptions" :props="categoryProps"
          placeholder="请选择商品分类" clearable />
      </el-form-item>

      <el-form-item label="商品主图" prop="mainImage">
        <div class="image-uploader" @click="showImageSelector = true">
          <el-image v-if="formData.mainImage" :src="formData.mainImage" fit="cover" class="uploaded-image" />
          <div v-else class="upload-placeholder">
            <el-icon class="el-icon--upload">
              <Plus />
            </el-icon>
            <div class="upload-text">点击选择图片</div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="详情图片" prop="detailImages">
        <div class="detail-images-container">
          <div v-for="(image, index) in formData.detailImages" :key="index" class="detail-image-item">
            <el-image :src="image" fit="cover" class="detail-image" />
            <div class="detail-image-actions">
              <el-button type="danger" circle size="small" @click="removeDetailImage(index)">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </div>
          </div>
          <div class="image-uploader" @click="handleAddDetailImages" v-if="(formData.detailImages?.length || 0) < 8">
            <div class="upload-placeholder">
              <el-icon class="el-icon--upload">
                <Plus />
              </el-icon>
              <div class="upload-text">批量添加详情图片</div>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="商品描述" prop="content">
        <el-input v-model="formData.content" type="textarea" :rows="3" placeholder="请输入商品描述" />
      </el-form-item>

    </el-form>

    <template #footer>
      <div class="flex justify-end">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-drawer>

  <!-- 图片选择器组件 -->
  <ImageSelector v-model="showImageSelector"
    :selected-url="currentSelectingDetailImage ? undefined : formData.mainImage" @select="handleImageSelect" />

  <!-- 多图片选择器组件 -->
  <MultiImageSelector v-model="showMultiImageSelector" :max-select="8 - (formData.detailImages?.length || 0)"
    @select="handleMultiImageSelect" />

</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useCategoryStore } from '@/stores/category.store'
import { useProductStore } from '@/stores/product.store'
import type { IProduct, ICategory, ICreateProductParams, IUpdateProductParams } from '@/types/product'
import { Plus, Delete } from '@element-plus/icons-vue'
import ImageSelector from '@/components/common/ImageSelector.vue'
import MultiImageSelector from '@/components/common/MultiImageSelector.vue'
import { IImage } from '@/types/image'


const props = defineProps<{
  modelValue: boolean
  type: 'add' | 'edit'
  product?: IProduct
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const categoryStore = useCategoryStore()
const productStore = useProductStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const drawerType = computed(() => props.type)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const showImageSelector = ref(false)
const currentSelectingDetailImage = ref(false)
const showMultiImageSelector = ref(false)

// 分类级联选择器配置
const categoryProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: false
}

// 将分类树转换为级联选择器选项
const categoryCascaderOptions = computed(() => {
  const transformCategory = (categories: ICategory[]): any[] => {
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      children: category.children ? transformCategory(category.children) : []
    }))
  }
  return transformCategory(categoryStore.categoryTree)
})

// 表单数据
const formData = reactive<ICreateProductParams | IUpdateProductParams>({
  name: '',
  categoryId: undefined,
  productCode: '',
  mainImage: '',
  detailImages: [],
  content: '',
  is_promotion: 0
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 200, message: '商品名称长度为2-200个字符', trigger: 'blur' }
  ],
  productCode: [
    { required: drawerType.value === 'add', message: '请输入商品编码', trigger: 'blur' },
    { min: 1, max: 50, message: '商品编码长度为1-50个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  mainImage: [
    { required: true, message: '请选择商品主图', trigger: 'blur' }
  ],
  detailImages: [
    { type: 'array', max: 8, message: '最多上传8张详情图片', trigger: 'change' }
  ]
}

// 初始化表单数据
// 初始化表单数据
const initFormData = () => {
  if (props.product && drawerType.value === 'edit') {
    // 转换详情图片数据
    let parsedDetailImages: string[] = []
    if (typeof props.product.detailImages === 'string') {
      try {
        parsedDetailImages = JSON.parse(props.product.detailImages)
      } catch (e) {
        console.error('解析详情图片失败:', e)
        parsedDetailImages = []
      }
    } else if (Array.isArray(props.product.detailImages)) {
      parsedDetailImages = props.product.detailImages
    }

    Object.assign(formData, {
      name: props.product.name,
      categoryId: props.product.categoryId,
      mainImage: props.product.mainImage || '',
      detailImages: parsedDetailImages,
      content: props.product.content || '',
      is_promotion: props.product.is_promotion
    })
  } else {
    Object.assign(formData, {
      name: '',
      categoryId: undefined,
      productCode: '',
      mainImage: '',
      detailImages: [],
      content: '',
      is_promotion: 0
    })
  }
}

// 监听抽屉显示状态变化
watch(() => visible.value, (val) => {
  if (val) {
    initFormData()
  }
})

// 选择图片
const handleImageSelect = (image: { imageUrl: string }) => {
  if (currentSelectingDetailImage.value) {
    formData.detailImages = [...(formData.detailImages || []), image.imageUrl]
    currentSelectingDetailImage.value = false
  } else {
    formData.mainImage = image.imageUrl
  }
  showImageSelector.value = false
}

// 处理多图选择
const handleAddDetailImages = () => {
  showMultiImageSelector.value = true
}

const handleMultiImageSelect = (images: IImage[]) => {
  formData.detailImages = [
    ...(formData.detailImages || []),
    ...images.map(img => img.imageUrl)
  ]
}

// 移除详情图片 
const removeDetailImage = (index: number) => {
  formData.detailImages = formData.detailImages?.filter((_, i) => i !== index) || []
}


// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (drawerType.value === 'add' && formData.productCode && productStore.isProductCodeExists(formData.productCode)) {
      ElMessage.error('商品编码已存在')
      return
    }

    submitLoading.value = true

    if (drawerType.value === 'add') {
      await productStore.createProduct(formData as ICreateProductParams)
      ElMessage.success('添加成功')
    } else if (props.product) {
      await productStore.updateProduct(props.product.id, formData as IUpdateProductParams)
      ElMessage.success('更新成功')
    }

    visible.value = false
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 处理抽屉关闭
const handleClose = (done: () => void) => {
  formRef.value?.resetFields()
  initFormData()
  showImageSelector.value = false
  showMultiImageSelector.value = false
  done()
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}

.image-uploader {
  width: 178px;
  height: 178px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.image-uploader:hover {
  border-color: #409EFF;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8c939d;
}

.el-icon--upload {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
  text-align: center;
  color: #8c939d;
}

.detail-images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-image-item {
  position: relative;
  width: 178px;
  height: 178px;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.detail-image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}
</style>