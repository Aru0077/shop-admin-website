<!-- src/components/order/ShipmentDialog.vue -->
<template>
      <el-dialog v-model="visible" title="订单发货" width="500px" @closed="handleClosed">
            <el-form ref="shipFormRef" :model="shipForm" :rules="shipFormRules" label-width="100px">
                  <el-form-item label="物流单号" prop="trackingNumber">
                        <el-input v-model="shipForm.trackingNumber" placeholder="请输入物流单号" />
                  </el-form-item>
                  <el-form-item label="备注信息" prop="remark">
                        <el-input v-model="shipForm.remark" type="textarea" :rows="3" placeholder="可选，请输入备注信息" />
                  </el-form-item>
            </el-form>
            <template #footer>
                  <span class="dialog-footer">
                        <el-button @click="visible = false">取消</el-button>
                        <el-button type="primary" :loading="submitLoading" @click="submitShipForm">确定发货</el-button>
                  </span>
            </template>
      </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

const props = defineProps<{
      modelValue: boolean,
      loading?: boolean
}>();

const emit = defineEmits(['update:modelValue', 'submit', 'closed']);

// 表单相关
const shipFormRef = ref<FormInstance>();
const shipForm = reactive({
      trackingNumber: '',
      remark: ''
});

// 表单验证规则
const shipFormRules: FormRules = {
      trackingNumber: [
            { required: true, message: '请输入物流单号', trigger: 'blur' },
            { min: 6, message: '物流单号长度不能少于6个字符', trigger: 'blur' }
      ]
};

// 对话框相关
const visible = ref(props.modelValue);
const submitLoading = ref(props.loading || false);

watch(() => props.modelValue, (newVal) => {
      visible.value = newVal;
});

watch(() => visible.value, (newVal) => {
      emit('update:modelValue', newVal);
});

watch(() => props.loading, (newVal) => {
      if (newVal !== undefined) {
            submitLoading.value = newVal;
      }
});

// 提交发货表单
const submitShipForm = async () => {
      if (!shipFormRef.value) return;

      try {
            await shipFormRef.value.validate();
            emit('submit', {
                  trackingNumber: shipForm.trackingNumber,
                  remark: shipForm.remark || undefined
            });
      } catch (error) {
            console.error('表单验证失败', error);
      }
};

// 重置发货表单
const resetForm = () => {
      if (shipFormRef.value) {
            shipFormRef.value.resetFields();
      }
      shipForm.trackingNumber = '';
      shipForm.remark = '';
};

// 关闭对话框时触发
const handleClosed = () => {
      resetForm();
      emit('closed');
};
</script>