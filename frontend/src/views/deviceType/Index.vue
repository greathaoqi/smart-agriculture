<template>
  <div class="page-card">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="类型名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入类型名称" clearable />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 140px;">
          <el-option label="传感器" value="sensor" />
          <el-option label="控制器" value="controller" />
          <el-option label="摄像头" value="camera" />
          <el-option label="网关" value="gateway" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增设备类型</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe>
      <el-table-column prop="code" label="类型编码" width="160" />
      <el-table-column prop="name" label="类型名称" width="150" />
      <el-table-column label="分类" width="100">
        <template #default="{ row }">
          <el-tag :type="categoryType(row.category)" size="small">{{ categoryLabel(row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="属性定义" min-width="200">
        <template #default="{ row }">
          <span v-for="(p, i) in (row.properties || [])" :key="i" class="prop-tag">
            {{ p.label }}({{ p.unit || '-' }})
          </span>
          <span v-if="!row.properties || row.properties.length === 0">-</span>
        </template>
      </el-table-column>
      <el-table-column label="命令" width="180">
        <template #default="{ row }">
          <span v-for="(c, i) in (row.commands || [])" :key="i" class="cmd-tag">{{ c.label }}</span>
          <span v-if="!row.commands || row.commands.length === 0">-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total"
        :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="类型编码" prop="code">
              <el-input v-model="formData.code" placeholder="如 temp_sensor" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型名称" prop="name">
              <el-input v-model="formData.name" placeholder="如 温湿度传感器" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="formData.category" style="width: 100%;">
                <el-option label="传感器" value="sensor" />
                <el-option label="控制器" value="controller" />
                <el-option label="摄像头" value="camera" />
                <el-option label="网关" value="gateway" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图标" prop="icon">
              <el-input v-model="formData.icon" placeholder="Element Plus 图标名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="属性定义">
          <el-input v-model="propertiesJson" type="textarea" :rows="5" placeholder='JSON格式，如 [{"name":"temperature","label":"温度","unit":"℃"}]' />
        </el-form-item>
        <el-form-item label="命令定义">
          <el-input v-model="commandsJson" type="textarea" :rows="4" placeholder='JSON格式，如 [{"name":"on","label":"开启","params":[]}]' />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getList, create, update, remove } from '@/api/deviceType'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增设备类型')
const formRef = ref(null)
const propertiesJson = ref('[]')
const commandsJson = ref('[]')

const searchForm = reactive({ keyword: '', category: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const formData = reactive({ id: null, name: '', code: '', category: 'sensor', icon: '', status: 1 })
const formRules = {
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入类型编码', trigger: 'blur' }]
}

const categoryLabel = (c) => ({ sensor: '传感器', controller: '控制器', camera: '摄像头', gateway: '网关' }[c] || c)
const categoryType = (c) => ({ sensor: '', controller: 'success', camera: 'warning', gateway: 'info' }[c] || '')

const loadData = async () => {
  loading.value = true
  try {
    const res = await getList({ page: pagination.page, pageSize: pagination.pageSize, ...searchForm })
    tableData.value = res.data || []
    pagination.total = res.total || 0
  } finally { loading.value = false }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(searchForm, { keyword: '', category: '' }); handleSearch() }

const handleAdd = () => {
  dialogTitle.value = '新增设备类型'
  Object.assign(formData, { id: null, name: '', code: '', category: 'sensor', icon: '', status: 1 })
  propertiesJson.value = '[]'
  commandsJson.value = '[]'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑设备类型'
  Object.assign(formData, { id: row.id, name: row.name, code: row.code, category: row.category, icon: row.icon, status: row.status })
  propertiesJson.value = JSON.stringify(row.properties || [], null, 2)
  commandsJson.value = JSON.stringify(row.commands || [], null, 2)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该设备类型吗？', '提示', { type: 'warning' })
  await remove(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      let props = [], cmds = []
      try { props = JSON.parse(propertiesJson.value) } catch (e) { ElMessage.error('属性定义JSON格式错误'); return }
      try { cmds = JSON.parse(commandsJson.value) } catch (e) { ElMessage.error('命令定义JSON格式错误'); return }

      const payload = { ...formData, properties: props, commands: cmds }
      if (payload.id) { await update(payload.id, payload); ElMessage.success('更新成功') }
      else { await create(payload); ElMessage.success('创建成功') }
      dialogVisible.value = false
      loadData()
    } finally { submitLoading.value = false }
  })
}

onMounted(() => loadData())
</script>

<style scoped>
.search-form { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
.prop-tag, .cmd-tag {
  display: inline-block; padding: 2px 8px; margin: 2px; border-radius: 4px;
  background: #ecf5ff; color: #409eff; font-size: 12px;
}
.cmd-tag { background: #f0f9eb; color: #67c23a; }
</style>
