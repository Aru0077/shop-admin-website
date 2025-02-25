<!-- src/views/banner/index.vue -->
<template>
      <div class="container mx-auto px-4 py-8">
            <!-- 顶部标题和操作区 -->
            <div class="mb-6 flex justify-between items-center">
                  <h2 class="text-2xl font-bold">Banner管理</h2>
                  <el-button v-if="!bannerStore.banner" type="primary" @click="handleAdd">
                        新增Banner
                  </el-button>
            </div>

            <!-- Banner展示卡片 -->
            <el-card v-loading="bannerStore.loading" shadow="never" class="mb-4">
                  <div v-if="bannerStore.banner" class="banner-content">
                        <!-- Banner预览图 -->
                        <div class="preview mb-6">
                              <img :src="bannerStore.banner.imageUrl" 
                                   class="w-full h-64 object-cover rounded"
                                   alt="Banner预览" />
                        </div>
                        
                        <!-- Banner信息 -->
                        <el-descriptions :column="2" border>
                              <el-descriptions-item label="标题">
                                    {{ bannerStore.banner.title }}
                              </el-descriptions-item>
                              <el-descriptions-item label="创建时间">
                                    {{ formatDate(bannerStore.banner.createdAt) }}
                              </el-descriptions-item>
                              <el-descriptions-item :span="2" label="内容">
                                    {{ bannerStore.banner.content || '-' }}
                              </el-descriptions-item>
                        </el-descriptions>

                        <!-- 操作按钮 -->
                        <div class="mt-4 flex justify-end">
                              <el-button-group>
                                    <el-button type="primary" @click="handleEdit">
                                          编辑
                                    </el-button>
                                    <el-button type="danger" @click="handleDelete">
                                          删除
                                    </el-button>
                              </el-button-group>
                        </div>
                  </div>
                  <el-empty v-else description="暂无Banner数据" />
            </el-card>

            <!-- 新增/编辑对话框 -->
            <el-dialog 
                  v-model="dialogVisible" 
                  :title="dialogType === 'add' ? '新增Banner' : '编辑Banner'" 
                  width="500px"
                  @close="resetForm"
            >
                  <el-form 
                        ref="formRef" 
                        :model="formData" 
                        :rules="formRules" 
                        label-width="100px"
                  >
                        <!-- 图片选择 -->
                        <el-form-item label="图片" prop="imageUrl">
                              <div v-if="formData.imageUrl" class="selected-image mb-4">
                                    <img :src="formData.imageUrl" class="w-full h-32 object-cover rounded" />
                                    <el-button type="danger" size="small" class="mt-2" @click="removeSelectedImage">
                                          移除图片
                                    </el-button>
                              </div>
                              <el-button v-else type="primary" @click="showImageSelector">
                                    选择图片
                              </el-button>
                        </el-form-item>

                        <!-- 标题输入 -->
                        <el-form-item label="标题" prop="title">
                              <el-input v-model="formData.title" placeholder="请输入Banner标题" />
                        </el-form-item>

                        <!-- 内容输入 -->
                        <el-form-item label="内容" prop="content">
                              <el-input 
                                    v-model="formData.content" 
                                    type="textarea" 
                                    :rows="4"
                                    placeholder="请输入Banner内容描述" 
                              />
                        </el-form-item>
                  </el-form>

                  <template #footer>
                        <span class="dialog-footer">
                              <el-button @click="dialogVisible = false">取消</el-button>
                              <el-button 
                                    type="primary" 
                                    :loading="submitLoading" 
                                    @click="handleSubmit"
                              >
                                    确定
                              </el-button>
                        </span>
                  </template>
            </el-dialog>

            <!-- 图片选择对话框 -->
            <el-dialog v-model="imageSelectVisible" title="选择图片" width="800px">
                  <div v-loading="imageStore.loading">
                        <!-- 图片网格 -->
                        <div class="grid grid-cols-4 gap-4">
                              <div v-for="image in imageStore.imageList" 
                                   :key="image.id" 
                                   class="image-item cursor-pointer hover:opacity-80"
                                   @click="selectImage(image)"
                              >
                                    <img :src="image.imageUrl" 
                                         class="w-full h-32 object-cover rounded transition-opacity"
                                         :class="{'ring-2 ring-blue-500': formData.imageUrl === image.imageUrl}"
                                    />
                              </div>
                        </div>

                        <!-- 暂无数据 -->
                        <el-empty v-if="!imageStore.imageList.length" description="暂无图片数据" />

                        <!-- 分页器 -->
                        <div class="mt-4 flex justify-end">
                              <el-pagination
                                    v-model:current-page="imageStore.currentPage"
                                    v-model:page-size="imageStore.pageSize"
                                    :total="imageStore.total"
                                    :page-sizes="[12, 24, 36, 48]"
                                    layout="total, sizes, prev, pager, next"
                                    @size-change="handleImagePageSizeChange"
                                    @current-change="handleImagePageChange"
                              />
                        </div>
                  </div>
            </el-dialog>
      </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useBannerStore } from '@/stores/banner.store'
import { useImageStore } from '@/stores/image.store'
import { formatDate } from '@/utils/date'
import type { IImage } from '@/types/image'

// Store实例
const bannerStore = useBannerStore()
const imageStore = useImageStore()

// 对话框状态
const dialogVisible = ref(false)
const imageSelectVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)

// 表单相关
const formRef = ref<FormInstance>()
const formData = reactive({
      imageUrl: '',
      title: '',
      content: ''
})

// 表单验证规则
const formRules: FormRules = {
      imageUrl: [
            { required: true, message: '请选择Banner图片', trigger: 'change' }
      ],
      title: [
            { required: true, message: '请输入标题', trigger: 'blur' },
            { min: 2, max: 100, message: '标题长度需在2-100个字符之间', trigger: 'blur' }
      ],
      content: [
            { max: 500, message: '内容不能超过500个字符', trigger: 'blur' }
      ]
}

// 生命周期钩子
onMounted(async () => {
      await Promise.all([
            fetchBannerData(),
            fetchImageList()
      ])
})

// 数据获取方法
const fetchBannerData = () => {
      return bannerStore.getBanner()
}

const fetchImageList = () => {
      return imageStore.getImageList({
            page: imageStore.currentPage,
            limit: imageStore.pageSize
      })
}

// Banner相关操作方法
const handleAdd = () => {
      dialogType.value = 'add'
      dialogVisible.value = true
}

const handleEdit = () => {
      const banner = bannerStore.banner
      if (!banner) return

      dialogType.value = 'edit'
      formData.imageUrl = banner.imageUrl
      formData.title = banner.title
      formData.content = banner.content || ''
      dialogVisible.value = true
}

const handleDelete = async () => {
      try {
            await ElMessageBox.confirm('确定要删除Banner吗？删除后将无法恢复', '提示', {
                  type: 'warning',
                  confirmButtonText: '确定删除',
                  cancelButtonText: '取消'
            })
            await bannerStore.deleteBanner()
            ElMessage.success('删除成功')
      } catch (error: any) {
            if (error !== 'cancel') {
                  ElMessage.error(error.message || '删除失败')
            }
      }
}

// 表单相关方法
const handleSubmit = async () => {
      if (!formRef.value) return

      try {
            await formRef.value.validate()
            submitLoading.value = true

            const params = {
                  imageUrl: formData.imageUrl,
                  title: formData.title,
                  content: formData.content
            }

            if (dialogType.value === 'add') {
                  await bannerStore.createBanner(params)
                  ElMessage.success('Banner创建成功')
            } else {
                  await bannerStore.updateBanner(params)
                  ElMessage.success('Banner更新成功')
            }

            dialogVisible.value = false
      } catch (error: any) {
            ElMessage.error(error.message || '操作失败')
      } finally {
            submitLoading.value = false
      }
}

const resetForm = () => {
      if (formRef.value) {
            formRef.value.resetFields()
      }
      formData.imageUrl = ''
      formData.title = ''
      formData.content = ''
}

// 图片选择相关方法
const showImageSelector = () => {
      imageSelectVisible.value = true
}

const selectImage = (image: IImage) => {
      formData.imageUrl = image.imageUrl
      imageSelectVisible.value = false
}

const removeSelectedImage = () => {
      formData.imageUrl = ''
}

// 图片列表分页方法
const handleImagePageSizeChange = (val: number) => {
      imageStore.getImageList({ page: 1, limit: val })
}

const handleImagePageChange = (val: number) => {
      imageStore.getImageList({ page: val, limit: imageStore.pageSize })
}
</script>