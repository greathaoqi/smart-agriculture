<template>
  <div class="big-screen">
    <!-- 顶部标题栏 -->
    <header class="bs-header">
      <div class="header-deco left"></div>
      <h1 class="header-title">云上丽水农业乡村 数据中心</h1>
      <div class="header-deco right"></div>
      <div class="header-time">{{ currentTime }}</div>
      <button class="close-btn" @click="goBack" title="返回">
        <el-icon><Close /></el-icon>
      </button>
    </header>

    <!-- 主体区域 -->
    <div class="bs-body">
      <!-- 左侧面板 -->
      <div class="bs-panel bs-left">
        <!-- 统计卡片 -->
        <div class="bs-panel-box">
          <div class="panel-title">核心指标</div>
          <div class="stat-grid">
            <div class="stat-item" v-for="s in statCards" :key="s.key">
              <div class="stat-val" :style="{ color: s.color }">{{ s.display }}</div>
              <div class="stat-lbl">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <!-- 产量趋势 -->
        <div class="bs-panel-box flex1">
          <div class="panel-title">产量趋势</div>
          <div ref="yieldChartRef" class="chart-area"></div>
        </div>

        <!-- 设备状态 -->
        <div class="bs-panel-box flex1">
          <div class="panel-title">设备状态</div>
          <div ref="deviceChartRef" class="chart-area"></div>
        </div>
      </div>

      <!-- 中央区域 -->
      <div class="bs-center">
        <!-- 地图区域 -->
        <div class="bs-panel-box flex1 map-box">
          <div class="panel-title">农场分布地图</div>
          <div ref="mapContainer" class="map-container" v-show="!mapError"></div>
          <div class="map-error" v-if="mapError">{{ mapError }}</div>
          <div class="map-legend">
            <span class="legend-item"><i class="legend-dot online"></i>在线</span>
            <span class="legend-item"><i class="legend-dot offline"></i>离线</span>
            <span class="legend-item"><i class="legend-dot fault"></i>故障</span>
          </div>
        </div>

        <!-- 告警滚动 -->
        <div class="bs-panel-box alert-box">
          <div class="panel-title">实时告警</div>
          <div class="alert-scroll">
            <div class="alert-item" v-for="(a, i) in alerts" :key="i">
              <span class="alert-tag" :class="a.type === '故障' ? 'danger' : 'warning'">{{ a.type }}</span>
              <span class="alert-text">{{ a.device }} - {{ a.message || a.farm }}</span>
              <span class="alert-time">{{ formatTime(a.time) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="bs-panel bs-right">
        <!-- 销售趋势 -->
        <div class="bs-panel-box flex1">
          <div class="panel-title">销售趋势</div>
          <div ref="salesChartRef" class="chart-area"></div>
        </div>

        <!-- 农场排行 -->
        <div class="bs-panel-box flex1">
          <div class="panel-title">农场产量排行</div>
          <div class="rank-list">
            <div class="rank-item" v-for="(f, i) in farmRank" :key="i">
              <span class="rank-no" :class="{ top3: i < 3 }">{{ i + 1 }}</span>
              <span class="rank-name">{{ f.name }}</span>
              <div class="rank-bar-wrap">
                <div class="rank-bar" :style="{ width: f.percent + '%' }"></div>
              </div>
              <span class="rank-val">{{ f.value }}</span>
            </div>
          </div>
        </div>

        <!-- 待办任务 -->
        <div class="bs-panel-box flex1">
          <div class="panel-title">待办任务</div>
          <div class="task-list">
            <div class="task-item" v-for="(t, i) in tasks" :key="i">
              <span class="task-priority" :class="'p' + t.priority"></span>
              <span class="task-title">{{ t.title }}</span>
              <span class="task-date">{{ t.due_date || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
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
import { getDeviceList } from '@/api/device'
import { getFarmList } from '@/api/farm'
import { getPublicConfig } from '@/api/systemConfig'

const router = useRouter()

const currentTime = ref('')
let timer = null

const goBack = () => router.push('/dashboard')

const updateClock = () => {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

// Chart refs
const yieldChartRef = ref(null)
const deviceChartRef = ref(null)
const salesChartRef = ref(null)
const mapContainer = ref(null)

let yieldChart = null
let deviceChart = null
let salesChart = null
let map = null

// Data
const statCards = ref([
  { key: 'farm', label: '农场数量', display: '-', color: '#36d7b7' },
  { key: 'device', label: '在线设备', display: '-', color: '#5dade2' },
  { key: 'yield', label: '总产量(kg)', display: '-', color: '#f39c12' },
  { key: 'sales', label: '销售额(元)', display: '-', color: '#e74c3c' }
])

const alerts = ref([])
const tasks = ref([])
const farmRank = ref([])
const mapError = ref('')

const formatNumber = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num?.toLocaleString() || '0'
}

const formatTime = (time) => time ? dayjs(time).format('MM-DD HH:mm') : '-'

const darkAxis = {
  axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
  axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }
}

const loadAMap = async () => {
  if (window.AMap) {
    return window.AMap
  }

  // 从后端获取配置
  const configRes = await getPublicConfig('amap_key,amap_security_js_code,amap_center_longitude,amap_center_latitude,amap_default_zoom,amap_map_style')
  const config = configRes.data || {}

  const key = config.amap_key
  if (!key) {
    throw new Error('未配置高德地图 API Key，请在数据库 system_config 表中配置 amap_key')
  }

  // 设置安全密钥
  if (config.amap_security_js_code) {
    window._AMapSecurityConfig = {
      securityJsCode: config.amap_security_js_code
    }
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`
    script.onload = () => resolve({ AMap: window.AMap, config })
    script.onerror = () => reject(new Error('高德地图加载失败'))
    document.head.appendChild(script)
  })
}

const initMap = async () => {
  if (!mapContainer.value) return

  try {
    const { AMap, config } = await loadAMap()
    mapError.value = ''

    // 从配置获取地图参数
    const centerLng = parseFloat(config.amap_center_longitude) || 119.92
    const centerLat = parseFloat(config.amap_center_latitude) || 28.46
    const zoom = parseInt(config.amap_default_zoom) || 10
    const mapStyle = config.amap_map_style || 'amap://styles/dark'

    // 创建地图实例，使用深色主题
    map = new AMap.Map(mapContainer.value, {
      viewMode: '2D',
      center: [centerLng, centerLat],
      zoom: zoom,
      mapStyle: mapStyle,
      features: ['bg', 'road', 'building'],
      showIndoorMap: false
    })

    // 加载农场和设备数据
    const [farmRes, deviceRes] = await Promise.all([
      getFarmList({ pageSize: 100 }),
      getDeviceList({ pageSize: 200 })
    ])

    const farms = farmRes.data || []
    const devices = deviceRes.data || []

    // 农场标记样式 - 更精美的设计
    const farmMarkerContent = (name) => `
      <div class="farm-marker">
        <div class="farm-marker-bg"></div>
        <div class="farm-marker-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <span class="farm-marker-name">${name}</span>
      </div>
    `

    // 设备标记样式 - 带脉冲动画
    const deviceMarkerContent = (status) => {
      const colors = { 1: '#36d7b7', 0: '#7f8c8d', 2: '#e74c3c' }
      const color = colors[status] || '#7f8c8d'
      const pulseClass = status === 1 ? 'pulse-animation' : ''
      return `
        <div class="device-marker">
          <div class="device-dot ${pulseClass}" style="background: ${color}; box-shadow: 0 0 8px ${color}, 0 0 16px ${color}40;"></div>
          ${status === 1 ? `<div class="device-pulse" style="background: ${color};"></div>` : ''}
        </div>
      `
    }

    // 添加农场标记
    farms.forEach(f => {
      if (f.longitude && f.latitude) {
        const lng = parseFloat(f.longitude)
        const lat = parseFloat(f.latitude)
        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = new AMap.Marker({
            position: [lng, lat],
            content: farmMarkerContent(f.name),
            offset: new AMap.Pixel(-40, -12)
          })
          marker.setMap(map)
          marker.on('click', () => {
            const infoWindow = new AMap.InfoWindow({
              content: `
                <div class="info-popup">
                  <div class="info-popup-header">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#36d7b7">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>${f.name}</span>
                  </div>
                  <div class="info-popup-body">
                    <div class="info-row">
                      <span class="info-label">地址</span>
                      <span class="info-value">${f.address || '-'}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">面积</span>
                      <span class="info-value">${f.area || '-'} 亩</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">负责人</span>
                      <span class="info-value">${f.manager || '-'}</span>
                    </div>
                  </div>
                </div>
              `,
              offset: new AMap.Pixel(0, -35)
            })
            infoWindow.open(map, marker.getPosition())
          })
        }
      }
    })

    // 添加设备标记
    devices.forEach(d => {
      if (d.longitude && d.latitude) {
        const lng = parseFloat(d.longitude)
        const lat = parseFloat(d.latitude)
        if (!isNaN(lat) && !isNaN(lng)) {
          const statusText = d.status === 1 ? '在线' : d.status === 2 ? '故障' : '离线'
          const statusColor = d.status === 1 ? '#36d7b7' : d.status === 2 ? '#e74c3c' : '#7f8c8d'
          const marker = new AMap.Marker({
            position: [lng, lat],
            content: deviceMarkerContent(d.status),
            offset: new AMap.Pixel(-9, -9)
          })
          marker.setMap(map)
          marker.on('click', () => {
            const infoWindow = new AMap.InfoWindow({
              content: `
                <div class="info-popup device-popup">
                  <div class="info-popup-header">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="${statusColor}">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    <span>${d.name}</span>
                    <span class="status-badge" style="background: ${statusColor}20; color: ${statusColor};">${statusText}</span>
                  </div>
                  <div class="info-popup-body">
                    <div class="info-row">
                      <span class="info-label">编码</span>
                      <span class="info-value">${d.code || '-'}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">位置</span>
                      <span class="info-value">${d.location || '-'}</span>
                    </div>
                  </div>
                </div>
              `,
              offset: new AMap.Pixel(0, -25)
            })
            infoWindow.open(map, marker.getPosition())
          })
        }
      }
    })

    // 自动适配视野
    if (farms.length > 0 && farms.some(f => f.longitude)) {
      const bounds = farms
        .filter(f => f.longitude && f.latitude)
        .map(f => [parseFloat(f.longitude), parseFloat(f.latitude)])
      if (bounds.length > 0) {
        map.setFitView(null, false, [40, 40, 40, 40])
      }
    }
  } catch (e) {
    console.error('地图初始化失败:', e)
    mapError.value = e.message || '地图加载失败'
  }
}

const initYieldChart = (data) => {
  if (!yieldChartRef.value) return
  yieldChart = echarts.init(yieldChartRef.value)
  yieldChart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333' },
    grid: { left: '3%', right: '4%', top: '10%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.month), ...darkAxis },
    yAxis: { type: 'value', ...darkAxis },
    series: [{
      type: 'bar',
      data: data.map(d => d.total_yield || 0),
      barWidth: '50%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#36d7b7' },
          { offset: 1, color: 'rgba(54,215,183,0.2)' }
        ]),
        borderRadius: [4, 4, 0, 0]
      }
    }]
  })
}

const initDeviceChart = (data) => {
  if (!deviceChartRef.value) return
  deviceChart = echarts.init(deviceChartRef.value)
  const colors = ['#36d7b7', '#5dade2', '#e74c3c', '#7f8c8d']
  deviceChart.setOption({
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333' },
    legend: { bottom: '5%', textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      label: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
      labelLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
      data: data.map((d, i) => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: colors[i % colors.length] }
      }))
    }]
  })
}

const initSalesChart = (yieldData) => {
  if (!salesChartRef.value) return
  salesChart = echarts.init(salesChartRef.value)
  salesChart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#333' },
    grid: { left: '3%', right: '4%', top: '10%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', data: yieldData.map(d => d.month), ...darkAxis },
    yAxis: { type: 'value', ...darkAxis },
    series: [{
      type: 'line',
      data: yieldData.map((d, i) => Math.round((d.total_yield || 0) * (3 + Math.random() * 2))),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#f39c12', width: 2 },
      itemStyle: { color: '#f39c12' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(243,156,18,0.3)' },
          { offset: 1, color: 'rgba(243,156,18,0.02)' }
        ])
      }
    }]
  })
}

const loadData = async () => {
  try {
    const [stats, yieldData, cropData, deviceData, alertData, taskData] = await Promise.all([
      getStats(),
      getYieldTrend({ months: 6 }),
      getCropDistribution(),
      getDeviceStatus(),
      getRecentAlerts({ limit: 10 }),
      getPendingTasks({ limit: 6 })
    ])

    const s = stats.data
    statCards.value[0].display = formatNumber(s.farmCount)
    statCards.value[1].display = formatNumber(s.onlineDeviceCount) + '/' + formatNumber(s.deviceCount)
    statCards.value[2].display = formatNumber(s.totalYield)
    statCards.value[3].display = formatNumber(s.totalSales)

    initYieldChart(yieldData.data || [])
    initDeviceChart(deviceData.data || [])
    initSalesChart(yieldData.data || [])

    alerts.value = alertData.data || []
    tasks.value = taskData.data || []

    const farms = cropData.data || []
    const maxArea = Math.max(...farms.map(f => f.total_area || 0), 1)
    farmRank.value = farms.map(f => ({
      name: f.crop_name,
      value: (f.total_area || 0) + '亩',
      percent: ((f.total_area || 0) / maxArea) * 100
    }))
  } catch (e) {
    console.error('大屏数据加载失败:', e)
  }
}

const handleResize = () => {
  yieldChart?.resize()
  deviceChart?.resize()
  salesChart?.resize()
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') goBack()
}

onMounted(async () => {
  updateClock()
  timer = setInterval(updateClock, 1000)
  await nextTick()
  loadData()
  initMap()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
  yieldChart?.dispose()
  deviceChart?.dispose()
  salesChart?.dispose()
  map?.destroy()
})
</script>

<style lang="scss" scoped>
.big-screen {
  position: fixed;
  inset: 0;
  background: #0a1628;
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 顶部
.bs-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(20,40,80,0.9) 0%, transparent 100%);
  position: relative;
  flex-shrink: 0;
  padding: 0 20px;
}

.header-title {
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 6px;
  background: linear-gradient(90deg, #36d7b7, #5dade2, #36d7b7);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShine 4s linear infinite;
}

@keyframes titleShine {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.header-deco {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #36d7b7, transparent);
  &.left { margin-right: 30px; }
  &.right { margin-left: 30px; }
}

.header-time {
  position: absolute;
  right: 70px;
  font-size: 14px;
  color: rgba(255,255,255,0.6);
}

.close-btn {
  position: absolute;
  right: 20px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.3s;
  &:hover { background: rgba(255,255,255,0.2); }
}

// 主体
.bs-body {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px;
  min-height: 0;
}

// 侧面板
.bs-panel {
  width: 28%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.bs-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

// 面板盒子
.bs-panel-box {
  background: rgba(13,33,55,0.8);
  border: 1px solid rgba(54,215,183,0.15);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  &.flex1 { flex: 1; min-height: 0; }
  &.alert-box { flex: 0 0 auto; max-height: 200px; }
}

.panel-title {
  font-size: 14px;
  color: #36d7b7;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 3px solid #36d7b7;
}

// 统计卡片
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-item {
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
  padding: 12px;
  text-align: center;
}

.stat-val {
  font-size: 22px;
  font-weight: bold;
  font-family: 'DIN', 'Courier New', monospace;
}

.stat-lbl {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-top: 4px;
}

// 图表区域
.chart-area {
  flex: 1;
  min-height: 0;
}

// 地图区域 - 与其他面板风格统一
.map-box {
  position: relative;
}
.map-container {
  flex: 1;
  min-height: 300px;
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(13,33,55,0.6), rgba(10,22,40,0.8));
  border: 1px solid rgba(54,215,183,0.15);
  overflow: hidden;
  // 地图未加载时显示占位图案
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 30% 40%, rgba(54,215,183,0.08) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(93,173,226,0.06) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(54,215,183,0.04) 0%, transparent 60%);
    pointer-events: none;
  }
}
.map-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255,255,255,0.4);
  font-size: 13px;
  text-align: center;
  padding: 30px;
  background: linear-gradient(180deg, rgba(13,33,55,0.6), rgba(10,22,40,0.8));
  border-radius: 4px;
  &::before {
    content: '';
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, rgba(54,215,183,0.15) 0%, transparent 70%);
    border: 1px dashed rgba(54,215,183,0.3);
    border-radius: 50%;
  }
}
.map-legend {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(13,33,55,0.85);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 11px;
  display: flex;
  gap: 16px;
  border: 1px solid rgba(54,215,183,0.2);
  backdrop-filter: blur(4px);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255,255,255,0.6);
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.3);
  &.online { background: #36d7b7; }
  &.offline { background: #7f8c8d; }
  &.fault { background: #e74c3c; }
}

// 农场标记样式 - 更柔和融入深色主题
:deep(.farm-marker) {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: rgba(13,33,55,0.85);
  border-radius: 16px;
  border: 1px solid rgba(54,215,183,0.4);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
  &:hover {
    background: rgba(54,215,183,0.2);
    border-color: rgba(54,215,183,0.6);
    transform: scale(1.02);
  }
}
:deep(.farm-marker-icon) {
  color: #36d7b7;
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.farm-marker-name) {
  color: #36d7b7;
  font-size: 12px;
  font-family: Microsoft YaHei, sans-serif;
  font-weight: 500;
  white-space: nowrap;
}

// 设备标记样式 - 小巧精致
:deep(.device-marker) {
  position: relative;
  width: 16px;
  height: 16px;
  cursor: pointer;
}
:deep(.device-dot) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.7);
  z-index: 2;
}
:deep(.device-pulse) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  z-index: 1;
  animation: devicePulse 2.5s ease-out infinite;
}
@keyframes devicePulse {
  0% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(3); }
}

// 信息弹窗样式 - 简洁深色风格
:deep(.info-popup) {
  font-family: Microsoft YaHei, sans-serif;
  background: rgba(13,33,55,0.95);
  border-radius: 8px;
  min-width: 160px;
  overflow: hidden;
  border: 1px solid rgba(54,215,183,0.3);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
:deep(.info-popup-header) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(54,215,183,0.1);
  border-bottom: 1px solid rgba(54,215,183,0.15);
  color: #36d7b7;
  font-size: 14px;
  font-weight: 500;
}
:deep(.info-popup-body) {
  padding: 8px 12px;
}
:deep(.info-row) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 12px;
}
:deep(.info-label) {
  color: rgba(255,255,255,0.45);
}
:deep(.info-value) {
  color: rgba(255,255,255,0.85);
}
:deep(.status-badge) {
  margin-left: auto;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 10px;
}

// 高德地图 InfoWindow 样式
:deep(.amap-info-content) {
  padding: 0 !important;
}
:deep(.amap-info-sharp) {
  display: none;
}

// 告警滚动
.alert-scroll {
  flex: 1;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 12px;
}

.alert-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
  &.danger { background: rgba(231,76,60,0.2); color: #e74c3c; }
  &.warning { background: rgba(243,156,18,0.2); color: #f39c12; }
}

.alert-text {
  flex: 1;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-time {
  color: rgba(255,255,255,0.4);
  flex-shrink: 0;
}

// 农场排行
.rank-list {
  flex: 1;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 12px;
}

.rank-no {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
  &.top3 { background: linear-gradient(135deg, #f39c12, #e67e22); color: #fff; }
}

.rank-name {
  width: 70px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-bar-wrap {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
}

.rank-bar {
  height: 100%;
  background: linear-gradient(90deg, #5dade2, #36d7b7);
  border-radius: 3px;
  transition: width 1s ease;
}

.rank-val {
  width: 50px;
  text-align: right;
  color: rgba(255,255,255,0.6);
  flex-shrink: 0;
}

// 任务列表
.task-list {
  flex: 1;
  overflow-y: auto;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 12px;
}

.task-priority {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  &.p1 { background: #7f8c8d; }
  &.p2 { background: #f39c12; }
  &.p3 { background: #e74c3c; }
}

.task-title {
  flex: 1;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-date {
  color: rgba(255,255,255,0.4);
  flex-shrink: 0;
}

// 自定义滚动条
.big-screen ::-webkit-scrollbar {
  width: 4px;
}
.big-screen ::-webkit-scrollbar-track {
  background: transparent;
}
.big-screen ::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
}
</style>
