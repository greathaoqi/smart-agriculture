<template>
  <div class="page-card">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="角色名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入角色名称" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px;">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe>
      <el-table-column prop="code" label="角色编码" width="150" />
      <el-table-column prop="name" label="角色名称" min-width="150" />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column prop="user_count" label="用户数" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)" :disabled="row.code === 'admin'">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)" :disabled="row.code === 'admin'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="权限配置">
          <el-tree
            ref="treeRef"
            :data="permissionTree"
            show-checkbox
            node-key="key"
            :default-checked-keys="checkedPermissions"
            :props="{ label: 'label', children: 'children' }"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoleList, createRole, updateRole, deleteRole } from '@/api/role'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formRef = ref(null)
const treeRef = ref(null)
const checkedPermissions = ref([])

const searchForm = reactive({ keyword: '', status: null })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const formData = reactive({ id: null, code: '', name: '', description: '', permissions: [], status: 1, sort: 0 })
const formRules = {
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

const permissionTree = [
  { key: '*', label: '全部权限' },
  {
    key: 'farm', label: '农场管理', children: [
      { key: 'farm:view', label: '查看' },
      { key: 'farm:create', label: '新增' },
      { key: 'farm:update', label: '编辑' },
      { key: 'farm:delete', label: '删除' }
    ]
  },
  {
    key: 'plot', label: '地块管理', children: [
      { key: 'plot:view', label: '查看' },
      { key: 'plot:create', label: '新增' },
      { key: 'plot:update', label: '编辑' },
      { key: 'plot:delete', label: '删除' }
    ]
  },
  {
    key: 'device', label: '设备管理', children: [
      { key: 'device:view', label: '查看' },
      { key: 'device:create', label: '新增' },
      { key: 'device:update', label: '编辑' },
      { key: 'device:delete', label: '删除' }
    ]
  },
  {
    key: 'user', label: '用户管理', children: [
      { key: 'user:view', label: '查看' },
      { key: 'user:create', label: '新增' },
      { key: 'user:update', label: '编辑' },
      { key: 'user:delete', label: '删除' }
    ]
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRoleList({ page: pagination.page, pageSize: pagination.pageSize, ...searchForm })
    tableData.value = res.data
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { searchForm.keyword = ''; searchForm.status = null; handleSearch() }

const handleAdd = () => {
  dialogTitle.value = '新增角色'
  Object.assign(formData, { id: null, code: '', name: '', description: '', permissions: [], status: 1, sort: 0 })
  checkedPermissions.value = []
  dialogVisible.value = true
  nextTick(() => { treeRef.value?.setCheckedKeys([]) })
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  Object.assign(formData, row)
  checkedPermissions.value = row.permissions || []
  dialogVisible.value = true
  nextTick(() => { treeRef.value?.setCheckedKeys(checkedPermissions.value) })
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该角色吗？', '提示', { type: 'warning' })
  await deleteRole(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const permissions = treeRef.value?.getCheckedKeys() || []
      const data = { ...formData, permissions }
      if (formData.id) {
        await updateRole(formData.id, data)
        ElMessage.success('更新成功')
      } else {
        await createRole(data)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(() => { loadData() })
</script>

<style scoped>
.search-form { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
