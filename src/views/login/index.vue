<!-- src/views/login/index.vue -->
<template>
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <div class="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                  <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold text-gray-900">管理系统登录</h2>
                  </div>

                  <el-form ref="formRef" :model="loginForm" :rules="rules" class="space-y-6">
                        <el-form-item prop="username">
                              <el-input v-model="loginForm.username" placeholder="用户名" :prefix-icon="User" />
                        </el-form-item>

                        <el-form-item prop="password">
                              <el-input v-model="loginForm.password" type="password" placeholder="密码"
                                    :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
                        </el-form-item>

                        <el-form-item>
                              <el-button type="primary" class="w-full" :loading="loading" @click="handleLogin">
                                    {{ loading ? '登录中...' : '登录' }}
                              </el-button>
                        </el-form-item>
                  </el-form>
            </div>
      </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useAdminStore } from '@/stores/admin-user.store'

const router = useRouter()
const adminStore = useAdminStore()

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
      username: '',
      password: ''
})

// 表单验证规则
const rules: FormRules = {
      username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, message: '用户名长度不能小于3个字符', trigger: 'blur' }
      ],
      password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
      ]
}

// 登录处理
const handleLogin = async () => {
      if (!formRef.value) return

      try {
            await formRef.value.validate()
            loading.value = true

            await adminStore.login(loginForm)
            ElMessage.success('登录成功')
            router.push('/admin/dashboard')
      } catch (error: any) {
            ElMessage.error(error.message || '登录失败')
      } finally {
            loading.value = false
      }
}
</script>