<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6" v-for="stat in statCards" :key="stat.key">
        <div class="stat-card" :class="stat.type">
          <el-icon class="stat-icon"><component :is="stat.icon" /></el-icon>
          <div class="stat-value">{{ formatNumber(stat.value) }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <div class="page-card">
          <div class="card-header">
            <h3>产量趋势</h3>
          </div>
          <div ref="yieldChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="page-card">
          <div class="card-header">
            <h3>设备状态</h3>
          </div>
          <div ref="deviceChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 作物分布 & 告警信息 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :lg="12">
        <div class="page-card">
          <div class="card-header">
            <h3>作物分布</h3>
          </div>
          <div ref="cropChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="page-card">
          <div class="card-header">
            <h3>最近告警</h3>
            <el-button type="primary" link>查看全部</el-button>
          </div>
          <el-table :data="alerts" style="width: 100%" :show-header="false">
            <el-table-column width="60">
              <template #default="{ row }">
                <el-tag :type="row.type === '故障' ? 'danger' : 'warning'" size="small">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="device" label="设备" />
            <el-table-column prop="farm" label="农场" width="120" />
            <el-table-column label="时间" width="120">
              <template #default="{ row }">
                {{ formatTime(row.time) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <!-- 待办任务 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <div class="page-card">
          <div class="card-header">
            <h3>待办任务</h3>
            <el-button type="primary" link>查看全部</el-button>
          </div>
          <el-table :data="tasks" style="width: 100%">
            <el-table-column prop="title" label="任务名称" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="priorityType(row.priority)" size="small">
                  {{ priorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="assignee" label="负责人" width="100" />
            <el-table-column label="截止日期" width="120">
              <template #default="{ row }">
                {{ row.due_date || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">
                  {{ statusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, markRaw } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import {
  getStats,
  getYieldTrend,
  getCropDistribution,
  getDeviceStatus,
  getRecentAlerts,
  getPendingTasks
} from '@/api/dashboard'

// 图表引用
const yieldChartRef = ref(null)
const deviceChartRef = ref(null)
const cropChartRef = ref(null)

let yieldChart = null
let deviceChart = null
let cropChart = null

// 统计数据
const statCards = reactive([
  { key: 'farm', label: '农场数量', value: 0, icon: 'OfficeBuilding', type: '' },
  { key: 'device', label: '在线设备', value: 0, icon: 'Monitor', type: 'success' },
  { key: 'yield', label: '总产量(kg)', value: 0, icon: 'TrendCharts', type: 'warning' },
  { key: 'sales', label: '销售额(元)', value: 0, icon: 'Money', type: 'info' }
])

// 告警数据
const alerts = ref([])

// 任务数据
const tasks = ref([])

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num?.toLocaleString() || 0
}

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('MM-DD HH:mm')
}

// 优先级
const priorityType = (p) => ({ 1: '', 2: 'warning', 3: 'danger' }[p] || '')
const priorityText = (p) => ({ 1: '低', 2: '中', 3: '高' }[p] || '-')

// 状态
const statusType = (s) => ({ 0: 'info', 1: 'warning', 2: 'success', 3: 'info' }[s] || '')
const statusText = (s) => ({ 0: '待处理', 1: '进行中', 2: '已完成', 3: '已取消' }[s] || '-')

// 初始化产量趋势图
const initYieldChart = (data) => {
  if (!yieldChartRef.value) return

  yieldChart = echarts.init(yieldChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.month)
    },
    yAxis: {
      type: 'value',
      name: '产量(kg)'
    },
    series: [{
      name: '产量',
      type: 'bar',
      data: data.map(d => d.total_yield || 0),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#67c23a' },
          { offset: 1, color: '#95d475' }
        ])
      },
      smooth: true
    }]
  }

  yieldChart.setOption(option)
}

// 初始化设备状态图
const initDeviceChart = (data) => {
  if (!deviceChartRef.value) return

  deviceChart = echarts.init(deviceChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [{
      name: '设备状态',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: data.map(d => ({
        name: d.name,
        value: d.value,
        itemStyle: {
          color: d.name === '在线' ? '#67c23a' : d.name === '离线' ? '#909399' : '#f56c6c'
        }
      }))
    }]
  }

  deviceChart.setOption(option)
}

// 初始化作物分布图
const initCropChart = (data) => {
  if (!cropChartRef.value) return

  cropChart = echarts.init(cropChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '15%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '面积(亩)'
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.crop_name).reverse()
    },
    series: [{
      name: '种植面积',
      type: 'bar',
      data: data.map(d => d.total_area || 0).reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#66b1ff' }
        ])
      }
    }]
  }

  cropChart.setOption(option)
}

// 加载数据
const loadData = async () => {
  try {
    const [stats, yieldData, cropData, deviceData, alertData, taskData] = await Promise.all([
      getStats(),
      getYieldTrend({ months: 6 }),
      getCropDistribution(),
      getDeviceStatus(),
      getRecentAlerts({ limit: 5 }),
      getPendingTasks({ limit: 5 })
    ])

    // 更新统计卡片
    statCards[0].value = stats.data.farmCount
    statCards[1].value = stats.data.onlineDeviceCount + '/' + stats.data.deviceCount
    statCards[2].value = stats.data.totalYield
    statCards[3].value = stats.data.totalSales

    // 更新图表
    initYieldChart(yieldData.data || [])
    initDeviceChart(deviceData.data || [])
    initCropChart(cropData.data || [])

    // 更新告警和任务
    alerts.value = alertData.data || []
    tasks.value = taskData.data || []
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  yieldChart?.resize()
  deviceChart?.resize()
  cropChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  yieldChart?.dispose()
  deviceChart?.dispose()
  cropChart?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-row {
    margin-bottom: 20px;
  }

  .chart-container {
    height: 300px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      color: var(--text-color);
    }
  }

  .el-table {
    :deep(.el-table__body-wrapper) {
      max-height: 250px;
      overflow-y: auto;
    }
  }
}

@media (max-width: 768px) {
  .stat-row {
    :deep(.el-col) {
      margin-bottom: 12px;
    }
  }

  .chart-container {
    height: 250px;
  }
}
</style>
