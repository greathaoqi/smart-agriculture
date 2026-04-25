<template>
  <div>
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="温棚名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入温棚名称" clearable />
      </el-form-item>
      <el-form-item label="所属农场">
        <el-select v-model="searchForm.farm_id" placeholder="请选择农场" clearable style="width: 180px;">
          <el-option v-for="f in farmList" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增温棚</el-button>
    </div>

    <!-- 温棚卡片视图 -->
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :lg="8" v-for="item in tableData" :key="item.id">
        <div class="gh-card" @click="openDetail(item)">
          <div class="gh-header">
            <span class="gh-name">{{ item.name }}</span>
            <el-tag :type="item.status === 1 ? 'success' : 'info'" size="small">{{ item.status === 1 ? '正常' : '停用' }}</el-tag>
          </div>
          <div class="gh-info">
            <div class="gh-info-item"><span>所属农场：</span>{{ item.farm?.name || '-' }}</div>
            <div class="gh-info-item"><span>面积：</span>{{ item.area ? item.area + ' m²' : '-' }}</div>
            <div class="gh-info-item"><span>设备数：</span>{{ item.devices?.length || 0 }} 台</div>
          </div>
          <div class="gh-env" v-if="item._env">
            <div class="env-item" v-for="e in envParams" :key="e.key">
              <span class="env-label">{{ e.label }}</span>
              <span class="env-val">{{ item._env[e.key] ?? '-' }}{{ e.unit }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="pagination-wrapper" v-if="pagination.total > 0">
      <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total"
        :page-sizes="[12, 24, 48]" layout="total, prev, pager, next" @current-change="loadData" />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="温棚名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入温棚名称" />
        </el-form-item>
        <el-form-item label="所属农场" prop="farm_id">
          <el-select v-model="formData.farm_id" placeholder="请选择农场" style="width: 100%;">
            <el-option v-for="f in farmList" :key="f.id" :label="f.name" :value="f.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="面积(m²)" prop="area">
          <el-input-number v-model="formData.area" :min="0" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入位置描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="detailData.name + ' - 监控详情'" width="900px" top="5vh">
      <el-tabs v-model="detailTab">
        <el-tab-pane label="环境数据" name="env">
          <div ref="envChartRef" class="env-chart"></div>
        </el-tab-pane>
        <el-tab-pane label="设备控制" name="control">
          <el-row :gutter="16">
            <el-col :span="8" v-for="ctrl in controlDevices" :key="ctrl.id">
              <div class="ctrl-card">
                <div class="ctrl-name">{{ ctrl.name }}</div>
                <div class="ctrl-status">
                  <el-switch v-model="ctrl._on" active-text="开启" inactive-text="关闭" @change="sendControl(ctrl)" />
                </div>
              </div>
            </el-col>
          </el-row>
          <el-empty v-if="controlDevices.length === 0" description="暂无控制设备" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { getList, getById, create, update, remove, getEnvironment, control } from '@/api/greenhouse'
import { getFarmList } from '@/api/farm'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const farmList = ref([])
const dialogVisible = ref(false)
const detailVisible = ref(false)
const detailTab = ref('env')
const dialogTitle = ref('新增温棚')
const formRef = ref(null)
const envChartRef = ref(null)
let envChart = null
const detailData = ref({})
const controlDevices = ref([])

const envParams = [
  { key: 'temperature', label: '温度', unit: '℃' },
  { key: 'humidity', label: '湿度', unit: '%' },
  { key: 'co2', label: 'CO2', unit: 'ppm' },
  { key: 'light_intensity', label: '光照', unit: 'lux' }
]

const searchForm = reactive({ keyword: '', farm_id: null })
const pagination = reactive({ page: 1, pageSize: 12, total: 0 })
const formData = reactive({ id: null, name: '', farm_id: null, area: null, location: '', status: 1 })
const formRules = { name: [{ required: true, message: '请输入温棚名称', trigger: 'blur' }], farm_id: [{ required: true, message: '请选择农场', trigger: 'change' }] }

const loadData = async () => {
  loading.value = true
  try {
    const res = await getList({ page: pagination.page, pageSize: pagination.pageSize, ...searchForm })
    tableData.value = (res.data || []).map(g => ({ ...g, _env: null }))
    pagination.total = res.total || 0
    // Load env for each greenhouse
    for (const g of tableData.value) {
      try {
        const envRes = await getEnvironment(g.id)
        g._env = envRes.data?.latest || null
      } catch (e) {}
    }
  } finally {
    loading.value = false
  }
}

const loadFarms = async () => {
  try { const res = await getFarmList({ pageSize: 100 }); farmList.value = res.data || [] } catch (e) {}
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(searchForm, { keyword: '', farm_id: null }); handleSearch() }

const handleAdd = () => {
  dialogTitle.value = '新增温棚'
  Object.assign(formData, { id: null, name: '', farm_id: null, area: null, location: '', status: 1 })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑温棚'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const openDetail = async (item) => {
  detailData.value = item
  detailTab.value = 'env'
  detailVisible.value = true

  try {
    const res = await getById(item.id)
    const sensors = res.data?.devices?.filter(d => d.type === 'sensor') || []
    const controllers = res.data?.devices?.filter(d => d.type !== 'sensor') || []
    controlDevices.value = controllers.map(c => ({ ...c, _on: c.status === 1 }))

    const envRes = await getEnvironment(item.id)
    const histData = envRes.data?.history || []

    await nextTick()
    if (envChartRef.value) {
      if (envChart) envChart.dispose()
      envChart = echarts.init(envChartRef.value)
      const timeData = histData.map(d => d.created_at ? new Date(d.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '')
      envChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['温度', '湿度', 'CO2'], top: 0 },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
        xAxis: { type: 'category', data: timeData },
        yAxis: [
          { type: 'value', name: '℃/%' },
          { type: 'value', name: 'ppm', splitLine: { show: false } }
        ],
        series: [
          { name: '温度', type: 'line', data: histData.map(d => d.temperature), smooth: true, itemStyle: { color: '#e6a23c' } },
          { name: '湿度', type: 'line', data: histData.map(d => d.humidity), smooth: true, itemStyle: { color: '#409eff' } },
          { name: 'CO2', type: 'line', yAxisIndex: 1, data: histData.map(d => d.co2), smooth: true, itemStyle: { color: '#67c23a' } }
        ]
      })
    }
  } catch (e) {
    console.error(e)
  }
}

const sendControl = async (ctrl) => {
  try {
    await control(detailData.value.id, { device_id: ctrl.id, command: ctrl._on ? 'on' : 'off' })
    ElMessage.success(`已${ctrl._on ? '开启' : '关闭'} ${ctrl.name}`)
  } catch (e) {
    ctrl._on = !ctrl._on
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该温棚吗？', '提示', { type: 'warning' })
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
      if (formData.id) { await update(formData.id, formData); ElMessage.success('更新成功') }
      else { await create(formData); ElMessage.success('创建成功') }
      dialogVisible.value = false
      loadData()
    } finally { submitLoading.value = false }
  })
}

const handleResize = () => envChart?.resize()

onMounted(() => { loadFarms(); loadData(); window.addEventListener('resize', handleResize) })
onUnmounted(() => { window.removeEventListener('resize', handleResize); envChart?.dispose() })
</script>

<style scoped>
.search-form { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: center; }
.gh-card {
  background: #fff; border-radius: 8px; padding: 16px;
  margin-bottom: 16px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: box-shadow 0.3s;
}
.gh-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
.gh-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.gh-name { font-size: 16px; font-weight: 600; color: #303133; }
.gh-info { margin-bottom: 12px; }
.gh-info-item { font-size: 13px; color: #606266; margin-bottom: 4px; }
.gh-info-item span { color: #909399; }
.gh-env { display: flex; gap: 12px; flex-wrap: wrap; }
.env-item { background: #f5f7fa; border-radius: 4px; padding: 6px 12px; font-size: 12px; }
.env-label { color: #909399; }
.env-val { font-weight: 600; color: #303133; margin-left: 4px; }
.env-chart { height: 380px; }
.ctrl-card { background: #f5f7fa; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 16px; }
.ctrl-name { font-size: 14px; font-weight: 500; margin-bottom: 12px; }
</style>
