<template>
  <div>
    <!-- 实时气象数据卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="4" v-for="item in weatherCards" :key="item.key">
        <div class="weather-card">
          <el-icon class="wc-icon" :style="{ color: item.color }"><component :is="item.icon" /></el-icon>
          <div class="wc-value">{{ current[item.key] ?? '-' }}<span class="wc-unit">{{ item.unit }}</span></div>
          <div class="wc-label">{{ item.label }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 24小时曲线 -->
      <el-col :xs="24" :lg="16">
        <div class="page-card">
          <div class="card-header">
            <h3>24小时气象趋势</h3>
            <el-radio-group v-model="chartParam" size="small" @change="updateChart">
              <el-radio-button value="temperature">温度</el-radio-button>
              <el-radio-button value="humidity">湿度</el-radio-button>
              <el-radio-button value="wind_speed">风速</el-radio-button>
              <el-radio-button value="light_intensity">光照</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="chartRef" class="chart-box"></div>
        </div>
      </el-col>

      <!-- 7天预报 -->
      <el-col :xs="24" :lg="8">
        <div class="page-card">
          <div class="card-header">
            <h3>7天天气预报</h3>
          </div>
          <div class="forecast-list">
            <div class="forecast-item" v-for="f in forecast" :key="f.date">
              <span class="fc-date">{{ formatShortDate(f.date) }}</span>
              <span class="fc-weather">{{ f.weather }}</span>
              <span class="fc-temp">{{ f.temp_low }}° ~ {{ f.temp_high }}°</span>
              <span class="fc-wind">{{ f.wind_direction }} {{ f.wind_speed }}m/s</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 历史数据 -->
    <div class="page-card" style="margin-top: 16px;">
      <div class="card-header">
        <h3>历史气象数据</h3>
        <el-button type="primary" link @click="loadData">刷新</el-button>
      </div>
      <el-table :data="historyTable" v-loading="historyLoading" stripe max-height="400">
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column prop="temperature" label="温度(℃)" width="100" />
        <el-table-column prop="humidity" label="湿度(%)" width="100" />
        <el-table-column prop="wind_speed" label="风速(m/s)" width="110" />
        <el-table-column prop="light_intensity" label="光照(lux)" width="110" />
        <el-table-column prop="rainfall" label="降雨量(mm)" width="110" />
        <el-table-column prop="co2" label="CO2(ppm)" width="110" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getCurrent, getHistory, getForecast } from '@/api/weather'

const chartRef = ref(null)
let chart = null
const chartParam = ref('temperature')
const historyLoading = ref(false)

const current = ref({})
const historyTable = ref([])
const forecast = ref([])

const weatherCards = [
  { key: 'temperature', label: '温度', unit: '℃', icon: 'Sunny', color: '#e6a23c' },
  { key: 'humidity', label: '湿度', unit: '%', icon: 'Drizzling', color: '#409eff' },
  { key: 'wind_speed', label: '风速', unit: 'm/s', icon: 'WindPower', color: '#67c23a' },
  { key: 'rainfall', label: '降雨量', unit: 'mm', icon: 'HeavyRain', color: '#909399' },
  { key: 'light_intensity', label: '光照', unit: 'lux', icon: 'Sunny', color: '#f39c12' },
  { key: 'co2', label: 'CO2', unit: 'ppm', icon: 'Cloudy', color: '#b37feb' }
]

const paramConfig = {
  temperature: { name: '温度(℃)', color: '#e6a23c' },
  humidity: { name: '湿度(%)', color: '#409eff' },
  wind_speed: { name: '风速(m/s)', color: '#67c23a' },
  light_intensity: { name: '光照(lux)', color: '#f39c12' }
}

const formatTime = (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'
const formatShortDate = (d) => dayjs(d).format('MM/DD')

const updateChart = () => {
  if (!chartRef.value || historyTable.value.length === 0) return
  if (!chart) chart = echarts.init(chartRef.value)

  const cfg = paramConfig[chartParam.value]
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: historyTable.value.map(d => dayjs(d.created_at).format('HH:mm'))
    },
    yAxis: { type: 'value', name: cfg.name },
    series: [{
      name: cfg.name,
      type: 'line',
      smooth: true,
      data: historyTable.value.map(d => d[chartParam.value]),
      itemStyle: { color: cfg.color },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: cfg.color + '40' }, { offset: 1, color: cfg.color + '05' }]) }
    }]
  })
}

const loadData = async () => {
  const [cur, hist, fc] = await Promise.all([
    getCurrent(),
    getHistory({ hours: 24 }),
    getForecast()
  ])
  current.value = cur.data || {}
  historyTable.value = hist.data || []
  forecast.value = fc.data || []
  updateChart()
}

const handleResize = () => chart?.resize()

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<style scoped>
.stat-row { margin-bottom: 16px; }
.weather-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.wc-icon { font-size: 28px; margin-bottom: 4px; }
.wc-value { font-size: 24px; font-weight: bold; color: #303133; font-family: 'Courier New', monospace; }
.wc-unit { font-size: 12px; color: #909399; margin-left: 2px; }
.wc-label { font-size: 13px; color: #909399; margin-top: 4px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card-header h3 { margin: 0; font-size: 16px; }
.chart-box { height: 320px; }
.forecast-list { max-height: 380px; overflow-y: auto; }
.forecast-item {
  display: flex; align-items: center; padding: 10px 0;
  border-bottom: 1px solid #f0f0f0; font-size: 13px;
}
.fc-date { width: 60px; color: #909399; }
.fc-weather { width: 70px; font-weight: 500; }
.fc-temp { flex: 1; text-align: center; color: #e6a23c; }
.fc-wind { width: 120px; text-align: right; color: #909399; font-size: 12px; }
</style>
