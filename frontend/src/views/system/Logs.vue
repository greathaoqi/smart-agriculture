<template>
  <div class="page-card">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="操作描述">
        <el-input v-model="searchForm.keyword" placeholder="请输入操作描述" clearable />
      </el-form-item>
      <el-form-item label="模块">
        <el-select v-model="searchForm.module" placeholder="请选择模块" clearable style="width: 140px;">
          <el-option v-for="m in modules" :key="m" :label="m" :value="m" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作类型">
        <el-select v-model="searchForm.action" placeholder="请选择" clearable style="width: 120px;">
          <el-option v-for="a in actions" :key="a" :label="a" :value="a" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px;"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" stripe>
      <el-table-column prop="user" label="操作用户" width="120">
        <template #default="{ row }">{{ row.user?.real_name || row.user?.username || '-' }}</template>
      </el-table-column>
      <el-table-column prop="module" label="模块" width="120" />
      <el-table-column prop="action" label="操作类型" width="100" />
      <el-table-column prop="description" label="操作描述" min-width="250" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP地址" width="140" />
      <el-table-column prop="created_at" label="操作时间" width="180" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">详情</el-button>
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

    <el-dialog v-model="detailDialogVisible" title="日志详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="操作用户">{{ currentLog.user?.real_name || currentLog.user?.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ currentLog.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ currentLog.action }}</el-descriptions-item>
        <el-descriptions-item label="操作描述">{{ currentLog.description }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentLog.created_at }}</el-descriptions-item>
        <el-descriptions-item label="用户代理">{{ currentLog.user_agent }}</el-descriptions-item>
        <el-descriptions-item label="请求数据">
          <pre style="max-height: 200px; overflow: auto; background: #f5f5f5; padding: 8px; border-radius: 4px;">{{ formatJson(currentLog.request_data) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getLogList, getLogById, getLogModules, getLogActions } from '@/api/log'

const loading = ref(false)
const tableData = ref([])
const modules = ref([])
const actions = ref([])
const dateRange = ref([])
const detailDialogVisible = ref(false)
const currentLog = ref({})

const searchForm = reactive({ keyword: '', module: '', action: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    const res = await getLogList(params)
    tableData.value = res.data
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const loadModules = async () => {
  try { modules.value = (await getLogModules()).data } catch (e) {}
}

const loadActions = async () => {
  try { actions.value = (await getLogActions()).data } catch (e) {}
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.module = ''
  searchForm.action = ''
  dateRange.value = []
  handleSearch()
}

const handleView = async (row) => {
  try {
    const res = await getLogById(row.id)
    currentLog.value = res.data
    detailDialogVisible.value = true
  } catch (e) {}
}

const formatJson = (data) => {
  if (!data) return '-'
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return data
  }
}

onMounted(() => { loadData(); loadModules(); loadActions() })
</script>

<style scoped>
.search-form { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
