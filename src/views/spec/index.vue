<!-- src/views/spec/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-2xl font-bold">规格管理</h2>
      <div class="flex gap-2">
        <el-button @click="handleRefresh" :loading="specStore.loading">刷新</el-button>
        <el-button type="primary" @click="handleAdd">新增规格</el-button>
      </div>
    </div>

    <!-- 规格列表 -->
    <el-card shadow="never" class="mb-4">
      <el-table v-loading="specStore.loading" :data="specStore.specList" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="规格名称" width="150" />
        <el-table-column label="规格值" min-width="300">
          <template #default="{ row }">
            <el-tag v-for="value in row.values" :key="value.id" class="mr-2 mb-2">
              {{ value.value }}
            </el-tag>
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
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增规格' : '编辑规格'" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="规格名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="规格值" prop="values">
          <div class="flex flex-wrap gap-2 mb-2">
            <el-tag v-for="(value, index) in formData.values" :key="index" closable @close="removeValue(index)">
              {{ value }}
            </el-tag>
          </div>
          <div class="flex">
            <el-input v-model="newValue" placeholder="请输入规格值" @keyup.enter="addValue">
              <template #append>
                <el-button @click="addValue">添加</el-button>
              </template>
            </el-input>
          </div>
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
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useSpecStore } from "@/stores/spec.store";
import type { ISpec } from "@/types/spec";

const specStore = useSpecStore();

// 对话框相关 
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const submitLoading = ref(false);
const currentId = ref(0);
const newValue = ref("");

// 表单相关
const formRef = ref<FormInstance>();
const formData = reactive({
  name: "",
  values: [] as string[],
});

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: "请输入规格名称", trigger: "blur" },
    { min: 2, message: "规格名称不能少于2个字符", trigger: "blur" },
    {
      validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
        validateSpecName(_rule, value, callback).catch((error) => callback(error));
      },
      trigger: "blur"
    }
  ],
  values: [
    {
      required: true,
      validator: (_rule: any, value: string[], callback: (error?: Error) => void) => {
        if (!value || value.length === 0) {
          callback(new Error("请至少添加一个规格值"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
};

// 验证规格名称是否重复
async function validateSpecName(_rule: any, value: string, callback: (error?: Error) => void) {
  if (!value) return callback();

  const exists = specStore.isSpecNameExists(
    value,
    dialogType.value === 'edit' ? currentId.value : undefined
  );

  if (exists) {
    callback(new Error("规格名称已存在"));
  } else {
    callback();
  }
}

// 初始化数据
onMounted(async () => {
  await fetchData();
});

// 获取数据
const fetchData = async () => {
  try {
    await specStore.getSpecList();
  } catch (error: any) {
    ElMessage.error("获取规格列表失败：" + error.message);
  }
};

// 手动刷新数据
const handleRefresh = () => {
  specStore.getSpecList(true);
};

// 新增规格值
const addValue = () => {
  const value = newValue.value.trim();
  if (!value) {
    ElMessage.warning("请输入规格值");
    return;
  }
  if (formData.values.includes(value)) {
    ElMessage.warning("该规格值已存在");
    return;
  }
  formData.values.push(value);
  newValue.value = "";
  // 触发表单验证
  formRef.value?.validateField('values');
};

// 删除规格值
const removeValue = (index: number) => {
  formData.values.splice(index, 1);
  // 触发表单验证
  formRef.value?.validateField('values');
};

// 新增规格
const handleAdd = () => {
  dialogType.value = "add";
  dialogVisible.value = true;
};

// 编辑规格
const handleEdit = (row: ISpec) => {
  dialogType.value = "edit";
  currentId.value = row.id;
  formData.name = row.name;
  formData.values = row.values.map((v) => v.value);
  dialogVisible.value = true;
};

// 删除规格
const handleDelete = async (row: ISpec) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除规格"${row.name}"吗？删除后无法恢复`,
      "提示",
      {
        type: "warning",
        confirmButtonText: "确定删除",
        cancelButtonText: "取消"
      }
    );
    await specStore.deleteSpec(row.id);
    ElMessage.success("删除成功");
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("删除失败：" + error.message);
    }
  }
};

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    if (dialogType.value === "add") {
      await specStore.createSpec({
        name: formData.name,
        values: formData.values,
      });
      ElMessage.success("添加成功");
    } else {
      await specStore.updateSpec(Number(currentId.value), {
        name: formData.name,
        values: formData.values,
      });
      ElMessage.success("更新成功");
    }

    dialogVisible.value = false;
  } catch (error: any) {
    if (error.message.includes('验证失败')) {
      // Form validation error, already shown to user
      return;
    }
    ElMessage.error(dialogType.value === "add" ? "添加失败：" : "更新失败：" + error.message);
  } finally {
    submitLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.name = "";
  formData.values = [];
  currentId.value = 0;
  newValue.value = "";
};
</script>