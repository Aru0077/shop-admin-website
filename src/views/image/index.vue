# src/views/image/index.vue
<template>
      <div class="container mx-auto px-4 py-8">
            <div class="mb-6 flex justify-between items-center">
                  <h2 class="text-2xl font-bold">图片管理</h2>
                  <el-upload :show-file-list="false" :multiple="true" :http-request="customUpload" accept="image/*"
                        :before-upload="beforeUpload">
                        <el-button type="primary">上传图片</el-button>
                  </el-upload>
            </div>

            <!-- 图片列表 -->
            <el-card shadow="never" class="mb-4">
                  <div class="mb-4">
                        <el-radio-group v-model="filterValue">
                              <el-radio value="">全部</el-radio>
                              <el-radio :value="1">已使用</el-radio>
                              <el-radio :value="0">未使用</el-radio>
                        </el-radio-group>
                  </div>

                  <el-table v-loading="imageStore.loading" :data="imageStore.imageList" border stripe
                        @selection-change="handleSelectionChange">
                        <el-table-column type="selection" width="55" />
                        <el-table-column prop="id" label="ID" width="80" />
                        <el-table-column label="图片预览" width="120">
                              <template #default="{ row }">
                                    <el-image :src="row.imageUrl" :preview-src-list="[row.imageUrl]" fit="cover"
                                          class="w-20 h-20 object-cover" />
                              </template>
                        </el-table-column>
                        <el-table-column prop="imageUrl" label="图片地址" min-width="300" />
                        <el-table-column prop="isUsed" label="使用状态" width="100">
                              <template #default="{ row }">
                                    <el-tag :type="row.isUsed === 1 ? 'success' : 'info'">
                                          {{ row.isUsed === 1 ? '已使用' : '未使用' }}
                                    </el-tag>
                              </template>
                        </el-table-column>
                        <el-table-column label="上传时间" width="180">
                              <template #default="{ row }">
                                    {{ formatDate(row.createdAt) }}
                              </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120" fixed="right">
                              <template #default="{ row }">
                                    <el-button v-if="row.isUsed === 0" type="danger" size="small"
                                          @click="handleDelete(row)">
                                          删除
                                    </el-button>
                                    <el-tag v-else type="info">使用中</el-tag>
                              </template>
                        </el-table-column>
                  </el-table>

                  <!-- 批量操作 -->
                  <div class="mt-4 flex justify-between items-center">
                        <el-button v-if="selectedRows.length > 0" type="danger" @click="handleBatchDelete">
                              批量删除({{ selectedRows.length }})
                        </el-button>
                        <div></div>

                        <!-- 分页 -->
                        <el-pagination v-model:current-page="imageStore.currentPage"
                              v-model:page-size="imageStore.pageSize" :total="imageStore.total"
                              :page-sizes="[12, 24, 36, 48]" layout="total, sizes, prev, pager, next"
                              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                  </div>
            </el-card>
      </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadRawFile } from 'element-plus'
import { useImageStore } from '@/stores/image.store'
import { formatDate } from '@/utils/date'
import type { IImage } from '@/types/image'

type UsedStatus = number | null;

interface ImageListParams {
      page: number;
      limit: number;
      isUsed: UsedStatus;
}

const imageStore = useImageStore()
const filterValue = ref<string | number>('');
const selectedRows = ref<IImage[]>([])


// 初始化数据
onMounted(() => {
      fetchData()
})

// 获取数据
const fetchData = () => {
      const params: ImageListParams = {
            page: imageStore.currentPage,
            limit: imageStore.pageSize,
            isUsed: filterValue.value === '' ? null : Number(filterValue.value)
      }
      imageStore.getImageList(params)
}

// 筛选处理
watch(filterValue, (newVal) => {
    const params: ImageListParams = {
        page: 1,
        limit: imageStore.pageSize,
        isUsed: newVal === '' ? null : Number(newVal)
    }
    imageStore.getImageList(params, true)
})

// 分页处理
const handleSizeChange = (val: number) => {
      const params: ImageListParams = {
            page: 1,
            limit: val,
            isUsed: filterValue.value === '' ? null : Number(filterValue.value)
      }
      imageStore.getImageList(params)
}

const handleCurrentChange = (val: number) => {
      const params: ImageListParams = {
            page: 1,
            limit: val,
            isUsed: filterValue.value === '' ? null : Number(filterValue.value)
      }
      imageStore.getImageList(params)
}

// 文件上传前验证
const beforeUpload = (file: UploadRawFile) => {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
            ElMessage.error('只能上传图片文件!')
            return false
      }
      if (!isLt5M) {
            ElMessage.error('图片大小不能超过 5MB!')
            return false
      }
      return true
}

// 自定义上传处理
const customUpload = async (options: any) => {
      try {
            await imageStore.uploadImages([options.file])
            ElMessage.success('上传成功')
      } catch (error: any) {
            ElMessage.error(error.message || '上传失败')
      }
}

// 表格选择处理
const handleSelectionChange = (rows: IImage[]) => {
      selectedRows.value = rows.filter(row => row.isUsed === 0)
}

// 删除图片
const handleDelete = async (row: IImage) => {
      try {
            await ElMessageBox.confirm('确定要删除该图片吗？删除后无法恢复', '提示', {
                  type: 'warning'
            })
            await imageStore.deleteImage(row.id)
            ElMessage.success('删除成功')
      } catch (error: any) {
            if (error !== 'cancel') {
                  ElMessage.error(error.message || '删除失败')
            }
      }
}

// 批量删除
const handleBatchDelete = async () => {
      if (selectedRows.value.length === 0) {
            ElMessage.warning('请选择要删除的图片')
            return
      }

      try {
            await ElMessageBox.confirm(
                  `确定要删除选中的 ${selectedRows.value.length} 张图片吗？删除后无法恢复`,
                  '提示',
                  { type: 'warning' }
            )
            await imageStore.batchDeleteImages({
                  ids: selectedRows.value.map(row => row.id.toString())
            })
            ElMessage.success('批量删除成功')
      } catch (error: any) {
            if (error !== 'cancel') {
                  ElMessage.error(error.message || '批量删除失败')
            }
      }
}
</script>