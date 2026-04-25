<template>
  <div>
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="alert-stat-card">
          <div class="as-value" style="color: #409eff;">{{ stats.todayCount || 0 }}</div>
          <div class="as-label">今日预警</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="alert-stat-card">
          <div class="as-value" style="color: #e6a23c;">{{ stats.unread || 0 }}</div>
          <div class="as-label">未读消息</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="alert-stat-card">
          <div class="as-value" style="color: #f56c6c;">{{ stats.severeCount || 0 }}</div>
          <div class="as-label">严重未处理</div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="alert-stat-card">
          <div class="as-value" style="color: #67c23a;">{{ stats.ruleCount || 0 }}</div>
          <div class="as-label">启用规则</div>
        </div>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab">
      <!-- 预警消息 -->
      <el-tab-pane label="预警消息" name="messages">
        <el-form :inline="true" :model="msgSearch" class="search-form">
          <el-form-item label="状态">
            <el-select v-model="msgSearch.status" placeholder="全部" clearable style="width: 120px;">
              <el-option label="未读" value="unread" />
              <el-option label="已读" value="read" />
              <el-option label="已处理" value="handled" />
            </el-select>
          </el-form-item>
          <el-form-item label="级别">
            <el-select v-model="msgSearch.level" placeholder="全部" clearable style="width: 120px;">
              <el-option label="提示" :value="1" />
              <el-option label="警告" :value="2" />
              <el-option label="严重" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadMessages">搜索</el-button>
            <el-button @click="msgSearch = {}; loadMessages()">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="messages" v-loading="msgLoading" stripe>
          <el-table-column label="级别" width="80">
            <template #default="{ row }">
              <el-tag :type="levelType(row.level)" size="small">{{ levelLabel(row.level) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="预警内容" min-width="250" />
          <el-table-column prop="device" label="设备" width="120">
            <template #default="{ row }">{{ row.device?.name || '-' }}</template>
          </el-table-column>
          <el-table-column label="触发值" width="90">
            <template #default="{ row }">{{ row.value ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'unread' ? 'danger' : row.status === 'read' ? 'warning' : 'success'" size="small">
                {{ { unread: '未读', read: '已读', handled: '已处理' }[row.status] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="时间" width="160">
            <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'unread'" type="primary" link @click="readMsg(row)">标记已读</el-button>
              <el-button v-if="row.status !== 'handled'" type="success" link @click="handleMsg(row)">处理</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination v-model:current-page="msgPage.page" v-model:page-size="msgPage.pageSize" :total="msgPage.total"
            layout="total, prev, pager, next" @current-change="loadMessages" />
        </div>
      </el-tab-pane>

      <!-- 预警规则 -->
      <el-tab-pane label="预警规则" name="rules">
        <div class="toolbar">
          <el-button type="primary" @click="showRuleDialog()">新增规则</el-button>
        </div>
        <el-table :data="rules" v-loading="rulesLoading" stripe>
          <el-table-column prop="name" label="规则名称" width="150" />
          <el-table-column prop="parameter" label="监控参数" width="120" />
          <el-table-column label="条件" width="120">
            <template #default="{ row }">{{ row.operator }} {{ row.threshold }}</template>
          </el-table-column>
          <el-table-column label="级别" width="80">
            <template #default="{ row }">
              <el-tag :type="levelType(row.level)" size="small">{{ levelLabel(row.level) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="持续时间" width="100">
            <template #default="{ row }">{{ row.duration ? row.duration + '分钟' : '立即' }}</template>
          </el-table-column>
          <el-table-column label="通知" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.notify_app" size="small" type="success">App</el-tag>
              <el-tag v-if="row.notify_sms" size="small" type="warning" style="margin-left:4px">短信</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="showRuleDialog(row)">编辑</el-button>
              <el-button type="danger" link @click="deleteRule(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 规则编辑弹窗 -->
    <el-dialog v-model="ruleDialogVisible" :title="ruleForm.id ? '编辑规则' : '新增规则'" width="550px">
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="ruleFormRules" label-width="90px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="如 高温预警" />
        </el-form-item>
        <el-form-item label="监控参数" prop="parameter">
          <el-select v-model="ruleForm.parameter" style="width: 100%;">
            <el-option label="温度" value="temperature" />
            <el-option label="湿度" value="humidity" />
            <el-option label="土壤湿度" value="soil_moisture" />
            <el-option label="CO2" value="co2" />
            <el-option label="光照" value="light_intensity" />
            <el-option label="风速" value="wind_speed" />
            <el-option label="降雨量" value="rainfall" />
            <el-option label="PH值" value="ph" />
            <el-option label="EC值" value="ec" />
          </el-select>
        </el-form-item>
        <el-form-item label="比较条件" prop="operator">
          <el-col :span="10">
            <el-select v-model="ruleForm.operator" style="width: 100%;">
              <el-option label="大于 (>)" value=">" />
              <el-option label="小于 (<)" value="<" />
              <el-option label="大于等于 (>=)" value=">=" />
              <el-option label="小于等于 (<=)" value="<=" />
              <el-option label="等于 (==)" value="==" />
            </el-select>
          </el-col>
          <el-col :span="14" style="padding-left: 8px;">
            <el-input-number v-model="ruleForm.threshold" :precision="1" controls-position="right" style="width: 100%;" />
          </el-col>
        </el-form-item>
        <el-form-item label="预警级别" prop="level">
          <el-radio-group v-model="ruleForm.level">
            <el-radio :label="1">提示</el-radio>
            <el-radio :label="2">警告</el-radio>
            <el-radio :label="3">严重</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="持续时间">
          <el-input-number v-model="ruleForm.duration" :min="0" :max="1440" />
          <span style="margin-left: 8px; color: #909399;">分钟（0=立即触发）</span>
        </el-form-item>
        <el-form-item label="通知方式">
          <el-checkbox v-model="ruleForm.notify_app">App推送</el-checkbox>
          <el-checkbox v-model="ruleForm.notify_sms">短信通知</el-checkbox>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="ruleForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="ruleLoading" @click="submitRule">确定</el-button>
      </template>
    </el-dialog>

    <!-- 处理弹窗 -->
    <el-dialog v-model="handleDialogVisible" title="处理预警" width="450px">
      <el-form>
        <el-form-item label="处理备注">
          <el-input v-model="handleNote" type="textarea" :rows="3" placeholder="请输入处理备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmHandle">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMessages, markRead, handle as handleApi, getMessageStats, getRules, createRule, updateRule, deleteRule as deleteRuleApi } from '@/api/alert'
import dayjs from 'dayjs'

const activeTab = ref('messages')
const stats = ref({})
const msgLoading = ref(false)
const rulesLoading = ref(false)
const ruleLoading = ref(false)

const messages = ref([])
const rules = ref([])
const msgSearch = reactive({ status: '', level: '' })
const msgPage = reactive({ page: 1, pageSize: 15, total: 0 })

const ruleDialogVisible = ref(false)
const ruleFormRef = ref(null)
const ruleForm = reactive({ id: null, name: '', parameter: '', operator: '>', threshold: 0, level: 1, duration: 0, notify_app: true, notify_sms: false, status: 1 })
const ruleFormRules = { name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }], parameter: [{ required: true, message: '请选择监控参数', trigger: 'change' }] }

const handleDialogVisible = ref(false)
const handleNote = ref('')
const handleTarget = ref(null)

const levelLabel = (l) => ({ 1: '提示', 2: '警告', 3: '严重' }[l] || '-')
const levelType = (l) => ({ 1: 'info', 2: 'warning', 3: 'danger' }[l] || '')
const formatTime = (t) => t ? dayjs(t).format('MM-DD HH:mm:ss') : '-'

const loadStats = async () => {
  try { stats.value = (await getMessageStats()).data || {} } catch (e) {}
}

const loadMessages = async () => {
  msgLoading.value = true
  try {
    const res = await getMessages({ page: msgPage.page, pageSize: msgPage.pageSize, ...msgSearch })
    messages.value = res.data || []
    msgPage.total = res.total || 0
  } finally { msgLoading.value = false }
}

const loadRules = async () => {
  rulesLoading.value = true
  try { rules.value = (await getRules({ pageSize: 50 })).data || [] } finally { rulesLoading.value = false }
}

const readMsg = async (row) => {
  await markRead(row.id)
  ElMessage.success('已标记为已读')
  loadMessages()
  loadStats()
}

const handleMsg = (row) => {
  handleTarget.value = row
  handleNote.value = ''
  handleDialogVisible.value = true
}

const confirmHandle = async () => {
  await handleApi(handleTarget.value.id, handleNote.value)
  ElMessage.success('处理成功')
  handleDialogVisible.value = false
  loadMessages()
  loadStats()
}

const showRuleDialog = (row) => {
  if (row) {
    Object.assign(ruleForm, row)
  } else {
    Object.assign(ruleForm, { id: null, name: '', parameter: '', operator: '>', threshold: 0, level: 1, duration: 0, notify_app: true, notify_sms: false, status: 1 })
  }
  ruleDialogVisible.value = true
}

const submitRule = async () => {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate(async (valid) => {
    if (!valid) return
    ruleLoading.value = true
    try {
      if (ruleForm.id) { await updateRule(ruleForm.id, ruleForm); ElMessage.success('更新成功') }
      else { await createRule(ruleForm); ElMessage.success('创建成功') }
      ruleDialogVisible.value = false
      loadRules()
    } finally { ruleLoading.value = false }
  })
}

const deleteRuleAction = async (row) => {
  await ElMessageBox.confirm('确定删除该预警规则吗？', '提示', { type: 'warning' })
  await deleteRuleApi(row.id)
  ElMessage.success('删除成功')
  loadRules()
}

onMounted(() => { loadStats(); loadMessages(); loadRules() })
</script>

<style scoped>
.stat-row { margin-bottom: 16px; }
.alert-stat-card {
  background: #fff; border-radius: 8px; padding: 20px; text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.as-value { font-size: 28px; font-weight: bold; font-family: 'Courier New', monospace; }
.as-label { font-size: 13px; color: #909399; margin-top: 4px; }
.search-form { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
