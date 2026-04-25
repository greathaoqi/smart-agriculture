<template>
  <div class="page-card">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="地块名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入地块名称" clearable />
      </el-form-item>
      <el-form-item label="所属农场">
        <el-select v-model="searchForm.farm_id" placeholder="请选择农场" clearable style="width: 180px;">
          <el-option v-for="farm in farmList" :key="farm.id" :label="farm.name" :value="farm.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px;">
          <el-option label="空闲" :value="1" />
          <el-option label="种植中" :value="2" />
          <el-option label="休耕" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增地块</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe>
      <el-table-column prop="code" label="地块编码" width="120" />
      <el-table-column prop="name" label="地块名称" min-width="150" />
      <el-table-column prop="farm" label="所属农场" width="150">
        <template #default="{ row }">{{ row.farm?.name || '-' }}</template>
      </el-table-column>
      <el-table-column prop="area" label="面积(亩)" width="100" />
      <el-table-column prop="soil_type" label="土壤类型" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status]?.type" size="small">{{ statusMap[row.status]?.label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
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
        <el-form-item label="地块编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入地块编码" />
        </el-form-item>
        <el-form-item label="地块名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入地块名称" />
        </el-form-item>
        <el-form-item label="所属农场" prop="farm_id">
          <el-select v-model="formData.farm_id" placeholder="请选择农场" style="width: 100%;">
            <el-option v-for="farm in farmList" :key="farm.id" :label="farm.name" :value="farm.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="面积" prop="area">
          <el-input-number v-model="formData.area" :min="0" :precision="2" />
          <span style="margin-left: 8px;">亩</span>
        </el-form-item>
        <el-form-item label="土壤类型" prop="soil_type">
          <el-select v-model="formData.soil_type" placeholder="请选择土壤类型" style="width: 100%;">
            <el-option label="沙土" value="沙土" />
            <el-option label="壤土" value="壤土" />
            <el-option label="粘土" value="粘土" />
            <el-option label="砂壤土" value="砂壤土" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">空闲</el-radio>
            <el-radio :label="2">种植中</el-radio>
            <el-radio :label="3">休耕</el-radio>
          </el-radio-group>
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
import { getPlotList, createPlot, updatePlot, deletePlot } from '@/api/plot'
import { getFarmList } from '@/api/farm'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const farmList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增地块')
const formRef = ref(null)

const statusMap = {
  1: { label: '空闲', type: 'info' },
  2: { label: '种植中', type: 'success' },
  3: { label: '休耕', type: 'warning' }
}

const searchForm = reactive({ keyword: '', farm_id: null, status: null })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const formData = reactive({ id: null, code: '', name: '', farm_id: null, area: null, soil_type: '', status: 1 })
const formRules = { name: [{ required: true, message: '请输入地块名称', trigger: 'blur' }] }

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPlotList({ page: pagination.page, pageSize: pagination.pageSize, ...searchForm })
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
  dialogTitle.value = '新增地块'
  Object.assign(formData, { id: null, code: '', name: '', farm_id: null, area: null, soil_type: '', status: 1 })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑地块'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该地块吗？', '提示', { type: 'warning' })
  await deletePlot(row.id)
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
        await updatePlot(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await createPlot(formData)
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
