<template>
  <div class="page-card">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="计划名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入计划名称" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 140px;">
          <el-option label="计划中" :value="0" />
          <el-option label="进行中" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="已取消" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增种植计划</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe>
      <el-table-column prop="name" label="计划名称" min-width="150" />
      <el-table-column prop="plot" label="地块" width="150">
        <template #default="{ row }">{{ row.plot?.name || '-' }}</template>
      </el-table-column>
      <el-table-column prop="crop" label="作物" width="120">
        <template #default="{ row }">{{ row.crop?.name || '-' }}</template>
      </el-table-column>
      <el-table-column prop="planned_area" label="计划面积(亩)" width="120" />
      <el-table-column prop="planned_yield" label="计划产量(kg)" width="120" />
      <el-table-column prop="start_date" label="开始日期" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status]?.type" size="small">{{ statusMap[row.status]?.label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" link @click="handleRecord(row)">记录</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入计划名称" />
        </el-form-item>
        <el-form-item label="地块" prop="plot_id">
          <el-select v-model="formData.plot_id" placeholder="请选择地块" style="width: 100%;">
            <el-option v-for="plot in plotList" :key="plot.id" :label="plot.name" :value="plot.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作物" prop="crop_id">
          <el-select v-model="formData.crop_id" placeholder="请选择作物" style="width: 100%;">
            <el-option v-for="crop in cropList" :key="crop.id" :label="crop.name" :value="crop.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划面积">
          <el-input-number v-model="formData.planned_area" :min="0" :precision="2" />
          <span style="margin-left: 8px;">亩</span>
        </el-form-item>
        <el-form-item label="计划产量">
          <el-input-number v-model="formData.planned_yield" :min="0" :precision="2" />
          <span style="margin-left: 8px;">kg</span>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="formData.start_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="预计结束日期">
          <el-date-picker v-model="formData.end_date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" style="width: 100%;">
            <el-option label="计划中" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="recordDialogVisible" title="种植记录" width="800px">
      <div style="margin-bottom: 16px;">
        <el-button type="primary" size="small" @click="handleAddRecord">添加记录</el-button>
      </div>
      <el-table :data="recordList" v-loading="recordLoading" max-height="400">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="content" label="内容" min-width="200" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDeleteRecord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="addRecordDialogVisible" title="添加种植记录" width="500px">
      <el-form ref="recordFormRef" :model="recordForm" label-width="80px">
        <el-form-item label="日期" prop="date">
          <el-date-picker v-model="recordForm.date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="recordForm.type" style="width: 100%;">
            <el-option label="播种" value="播种" />
            <el-option label="施肥" value="施肥" />
            <el-option label="灌溉" value="灌溉" />
            <el-option label="除草" value="除草" />
            <el-option label="病虫害防治" value="病虫害防治" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="recordForm.content" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="recordForm.operator" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addRecordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRecord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPlanList, createPlan, updatePlan, deletePlan, getRecordList, createRecord, deleteRecord } from '@/api/planting'
import { getPlotList } from '@/api/plot'
import { getAllCrops } from '@/api/crop'

const loading = ref(false)
const submitLoading = ref(false)
const recordLoading = ref(false)
const tableData = ref([])
const plotList = ref([])
const cropList = ref([])
const dialogVisible = ref(false)
const recordDialogVisible = ref(false)
const addRecordDialogVisible = ref(false)
const dialogTitle = ref('新增种植计划')
const formRef = ref(null)
const recordFormRef = ref(null)
const recordList = ref([])
const currentPlanId = ref(null)

const statusMap = {
  0: { label: '计划中', type: 'info' },
  1: { label: '进行中', type: 'primary' },
  2: { label: '已完成', type: 'success' },
  3: { label: '已取消', type: 'danger' }
}

const searchForm = reactive({ keyword: '', status: null })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const formData = reactive({ id: null, name: '', plot_id: null, crop_id: null, planned_area: null, planned_yield: null, start_date: '', end_date: '', status: 0, remark: '' })
const formRules = { name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }] }
const recordForm = reactive({ plan_id: null, date: '', type: '', content: '', operator: '' })

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPlanList({ page: pagination.page, pageSize: pagination.pageSize, ...searchForm })
    tableData.value = res.data
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const loadPlots = async () => {
  try { plotList.value = (await getPlotList({ pageSize: 100 })).data } catch (e) {}
}

const loadCrops = async () => {
  try { cropList.value = (await getAllCrops()).data } catch (e) {}
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { searchForm.keyword = ''; searchForm.status = null; handleSearch() }

const handleAdd = () => {
  dialogTitle.value = '新增种植计划'
  Object.assign(formData, { id: null, name: '', plot_id: null, crop_id: null, planned_area: null, planned_yield: null, start_date: '', end_date: '', status: 0, remark: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑种植计划'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该种植计划吗？', '提示', { type: 'warning' })
  await deletePlan(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const handleRecord = async (row) => {
  currentPlanId.value = row.id
  recordDialogVisible.value = true
  recordLoading.value = true
  try {
    const res = await getRecordList({ plan_id: row.id })
    recordList.value = res.data || []
  } finally {
    recordLoading.value = false
  }
}

const handleAddRecord = () => {
  Object.assign(recordForm, { plan_id: currentPlanId.value, date: '', type: '', content: '', operator: '' })
  addRecordDialogVisible.value = true
}

const handleSubmitRecord = async () => {
  await createRecord(recordForm)
  ElMessage.success('添加成功')
  addRecordDialogVisible.value = false
  const res = await getRecordList({ plan_id: currentPlanId.value })
  recordList.value = res.data || []
}

const handleDeleteRecord = async (row) => {
  await ElMessageBox.confirm('确定要删除该记录吗？', '提示', { type: 'warning' })
  await deleteRecord(row.id)
  ElMessage.success('删除成功')
  const res = await getRecordList({ plan_id: currentPlanId.value })
  recordList.value = res.data || []
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (formData.id) {
        await updatePlan(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await createPlan(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(() => { loadPlots(); loadCrops(); loadData() })
</script>

<style scoped>
.search-form { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
