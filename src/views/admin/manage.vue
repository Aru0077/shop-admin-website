<!-- src/views/admin/manage.vue -->
<template>
      <div class="container mx-auto px-4 py-8">
            <div class="mb-6 flex justify-between items-center">
                  <h2 class="text-2xl font-bold">管理员列表</h2>
                  <el-button type="primary" @click="handleAdd">新增管理员</el-button>
            </div>

            <!-- 列表 -->
            <el-card shadow="never" class="mb-4">
                  <el-table v-loading="adminStore.loading" :data="adminStore.adminList" border stripe>
                        <el-table-column prop="id" label="ID" width="80" />
                        <el-table-column prop="username" label="用户名" width="120"/>
                        <el-table-column prop="isSuper" label="角色" width="120">
                              <template #default="{ row }">
                                    <el-tag :type="row.isSuper ? 'danger' : 'info'">
                                          {{ row.isSuper ? '超级管理员' : '普通管理员' }}
                                    </el-tag>
                              </template>
                        </el-table-column>
                        <el-table-column prop="status" label="状态" width="100">
                              <template #default="{ row }">
                                    <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                                          {{ row.status === 1 ? '启用' : '禁用' }}
                                    </el-tag>
                              </template>
                        </el-table-column>
                        <el-table-column label="最后登录时间" width="180">
                              <template #default="{ row }">
                                    {{ row.lastLoginTime ? formatDate(row.lastLoginTime) : '-' }}
                              </template>
                        </el-table-column>
                        <el-table-column label="创建时间" width="180">
                              <template #default="{ row }">
                                    {{ formatDate(row.createdAt) }}
                              </template>
                        </el-table-column>
                        <el-table-column label="操作" width="250" fixed="right">
                              <template #default="{ row }">
                                    <el-button-group v-if="!row.isSuper">
                                          <el-button :type="row.status === 1 ? 'danger' : 'success'" size="small"
                                                @click="handleUpdateStatus(row)">
                                                {{ row.status === 1 ? '禁用' : '启用' }}
                                          </el-button>
                                          <el-button type="warning" size="small" @click="handleResetPassword(row)">
                                                重置密码
                                          </el-button>
                                          <el-button type="danger" size="small" @click="handleDelete(row)">
                                                删除
                                          </el-button>
                                    </el-button-group>
                                    <el-tag v-else type="info">超级管理员不可操作</el-tag>
                              </template>
                        </el-table-column>
                  </el-table>

                  <!-- 分页 -->
                  <div class="mt-4 flex justify-end">
                        <el-pagination v-model:current-page="adminStore.currentPage"
                              v-model:page-size="adminStore.pageSize" :total="adminStore.total"
                              :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next"
                              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                  </div>
            </el-card>

            <!-- 新增/编辑对话框 -->
            <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增管理员' : '重置密码'" width="500px"
                  @close="resetForm">
                  <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
                        <template v-if="dialogType === 'add'">
                              <el-form-item label="用户名" prop="username">
                                    <el-input v-model="formData.username" />
                              </el-form-item>
                              <el-form-item label="密码" prop="password">
                                    <el-input v-model="formData.password" type="password" show-password />
                              </el-form-item>
                        </template>
                        <template v-else>
                              <el-form-item label="新密码" prop="newPassword">
                                    <el-input v-model="formData.newPassword" type="password" show-password />
                              </el-form-item>
                        </template>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAdminStore } from '@/stores/admin-user.store'
import { formatDate } from '@/utils/date'

const adminStore = useAdminStore()

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'reset'>('add')
const submitLoading = ref(false)
const currentId = ref<number | null>(null)

// 表单相关
const formRef = ref<FormInstance>()
const formData = reactive({
      username: '',
      password: '',
      newPassword: '',
})

// 表单验证规则
const formRules: FormRules = {
      username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, message: '用户名长度不能小于3个字符', trigger: 'blur' }
      ],
      password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
      ],
      newPassword: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
      ]
}

// 初始化数据
onMounted(() => {
      fetchData()
})

// 获取数据
const fetchData = () => {
      adminStore.getAdminList({
            page: adminStore.currentPage,
            limit: adminStore.pageSize
      })
}

// 分页处理
const handleSizeChange = (val: number) => {
      adminStore.getAdminList({ page: 1, limit: val })
}

const handleCurrentChange = (val: number) => {
      adminStore.getAdminList({ page: val, limit: adminStore.pageSize })
}

// 新增管理员
const handleAdd = () => {
      dialogType.value = 'add'
      dialogVisible.value = true
}

// 更新状态
const handleUpdateStatus = async (row: any) => {
      if (row.isSuper) {
            ElMessage.warning('超级管理员不可操作')
            return
      }

      try {
            await ElMessageBox.confirm(
                  `确定要${row.status === 1 ? '禁用' : '启用'}该管理员吗？`,
                  '提示',
                  { type: 'warning' }
            )
            await adminStore.updateAdminStatus(row.id, { status: row.status === 1 ? 0 : 1 })
            ElMessage.success('操作成功')
      } catch (error: any) {
            if (error !== 'cancel') {
                  ElMessage.error(error.message || '操作失败')
            }
      }
}

// 重置密码
const handleResetPassword = (row: any) => {
      if (row.isSuper) {
            ElMessage.warning('超级管理员不可操作')
            return
      }

      dialogType.value = 'reset'
      currentId.value = Number(row.id)
      dialogVisible.value = true
}

// 删除管理员
const handleDelete = async (row: any) => {
      if (row.isSuper) {
            ElMessage.warning('超级管理员不可操作')
            return
      }

      try {
            await ElMessageBox.confirm('确定要删除该管理员吗？', '提示', {
                  type: 'warning'
            })
            await adminStore.deleteAdmin(row.id)
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
                  await adminStore.createAdmin({
                        username: formData.username,
                        password: formData.password,
                        isSuper: false // 固定为普通管理员
                  })
                  ElMessage.success('添加成功')
            } else {
                  await adminStore.resetPassword(currentId.value!, {
                        newPassword: formData.newPassword
                  })
                  ElMessage.success('重置成功')
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
      formData.username = ''
      formData.password = ''
      formData.newPassword = ''
      currentId.value = null
}
</script>