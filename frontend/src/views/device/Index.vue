<template>
  <div class="page-card">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="设备名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入设备名称" clearable />
      </el-form-item>
      <el-form-item label="所属农场">
        <el-select v-model="searchForm.farm_id" placeholder="请选择农场" clearable style="width: 180px;">
          <el-option v-for="farm in farmList" :key="farm.id" :label="farm.name" :value="farm.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px;">
          <el-option label="在线" :value="1" />
          <el-option label="离线" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增设备</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe>
      <el-table-column prop="code" label="设备编码" width="120" />
      <el-table-column prop="name" label="设备名称" min-width="150" />
      <el-table-column prop="type" label="设备类型" width="120" />
      <el-table-column prop="farm" label="所属农场" width="150">
        <template #default="{ row }">{{ row.farm?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">数据</el-button>
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
        <el-form-item label="设备编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入设备编码" />
        </el-form-item>
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择设备类型" style="width: 100%;">
            <el-option label="土壤传感器" value="soil_sensor" />
            <el-option label="气象站" value="weather_station" />
            <el-option label="摄像头" value="camera" />
            <el-option label="灌溉设备" value="irrigation" />
            <el-option label="温室控制" value="greenhouse" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属农场" prop="farm_id">
          <el-select v-model="formData.farm_id" placeholder="请选择农场" style="width: 100%;">
            <el-option v-for="farm in farmList" :key="farm.id" :label="farm.name" :value="farm.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">在线</el-radio>
            <el-radio :label="0">离线</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dataDialogVisible" title="设备数据" width="800px">
      <el-table :data="deviceData" v-loading="dataLoading" max-height="400">
        <el-table-column prop="temperature" label="温度(℃)" width="100" />
        <el-table-column prop="humidity" label="湿度(%)" width="100" />
        <el-table-column prop="soil_moisture" label="土壤湿度(%)" width="120" />
        <el-table-column prop="light" label="光照(lux)" width="100" />
        <el-table-column prop="created_at" label="采集时间" width="180" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDeviceList, createDevice, updateDevice, deleteDevice, getDeviceHistory } from '@/api/device'
import { getFarmList } from '@/api/farm'

const loading = ref(false)
const submitLoading = ref(false)
const dataLoading = ref(false)
const tableData = ref([])
const farmList = ref([])
const dialogVisible = ref(false)
const dataDialogVisible = ref(false)
const dialogTitle = ref('新增设备')
const formRef = ref(null)
const deviceData = ref([])

const searchForm = reactive({ keyword: '', farm_id: null, status: null })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const formData = reactive({ id: null, code: '', name: '', type: '', farm_id: null, location: '', status: 1 })
const formRules = { name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }] }

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDeviceList({ page: pagination.page, pageSize: pagination.pageSize, ...searchForm })
    tableData.value = res.data
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const loadFarms = async () => {
  try {
    const res = await getFarmList({ pageSize: 100 })
    farmList.value = res.data
  } catch (e) {}
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(searchForm, { keyword: '', farm_id: null, status: null }); handleSearch() }

const handleAdd = () => {
  dialogTitle.value = '新增设备'
  Object.assign(formData, { id: null, code: '', name: '', type: '', farm_id: null, location: '', status: 1 })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑设备'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleView = async (row) => {
  dataDialogVisible.value = true
  dataLoading.value = true
  try {
    const res = await getDeviceHistory(row.id)
    deviceData.value = res.data || []
  } finally {
    dataLoading.value = false
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该设备吗？', '提示', { type: 'warning' })
  await deleteDevice(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (formData.id) {
        await updateDevice(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await createDevice(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(() => { loadFarms(); loadData() })
</script>

<style scoped>
.search-form { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
