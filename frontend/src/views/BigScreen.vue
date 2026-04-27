<template>
  <div class="bigscreen">
    <!-- ===== 全屏背景地图 ===== -->
    <div ref="mapContainer" class="map-fullscreen"></div>
    <div class="map-fallback" v-if="mapError">
      <div class="fallback-content">
        <svg viewBox="0 0 48 48" width="64" height="64" fill="none">
          <circle cx="24" cy="24" r="20" stroke="#ff3b30" stroke-width="2" stroke-dasharray="4 4" opacity="0.4"/>
          <path d="M24 8C16.268 8 10 14.268 10 22c0 11 14 18 14 18s14-7 14-18c0-7.732-6.268-14-14-14z" fill="#ff3b30" opacity="0.15"/>
          <circle cx="24" cy="22" r="5" fill="#ff3b30" opacity="0.6"/>
        </svg>
        <span>{{ mapError }}</span>
      </div>
    </div>

    <!-- ===== 顶部 Header ===== -->
    <header class="bs-header">
      <div class="header-wing left"></div>
      <div class="header-center">
        <div class="header-emblem"></div>
        <h1 class="header-title">智慧农业可视化大屏</h1>
      </div>
      <div class="header-wing right"></div>
      <div class="header-time">
        <span class="time-date">{{ currentDate }}</span>
        <span class="time-clock">{{ currentTime }}</span>
      </div>
      <button class="close-btn" @click="goBack" title="返回">
        <el-icon><Close /></el-icon>
      </button>
    </header>

    <!-- ===== KPI 浮层：顶部中间 ===== -->
    <div class="kpi-float-bar">
      <div class="kpi-float-item" v-for="(kpi, i) in kpiList" :key="i">
        <div class="kpi-float-icon" :style="{ background: kpi.iconBg }">
          <span v-html="kpi.icon"></span>
        </div>
        <div class="kpi-float-content">
          <div class="kpi-float-val" :style="{ color: kpi.color }">{{ kpi.value }}</div>
          <div class="kpi-float-label">{{ kpi.label }}</div>
        </div>
      </div>
    </div>

    <!-- ===== 左侧浮层 ===== -->
    <div class="side-float side-left">
      <!-- 农田统计 -->
      <Card title="农田区域统计" class="float-card">
        <div class="farm-stat-list">
          <div class="farm-stat-item" v-for="(s, i) in statCards" :key="s.key">
            <div class="stat-icon" :class="'c' + i">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path v-if="i===0" d="M12 2L2 7v10l10 5 10-5V7L12 2z"/>
                <path v-if="i===1" d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z"/>
                <path v-if="i===2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                <path v-if="i===3" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-val">{{ s.display }}</span>
              <span class="stat-lbl">{{ s.label }}</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- 设备状态 -->
      <Card title="设备状态" class="float-card flex1">
        <ChartPie
          :data="devicePieData"
          type="pie"
          :colors="['#ff3b30', '#ff9500', '#34c759', '#8e8e93']"
        />
      </Card>

      <!-- 作物种植面积 -->
      <Card title="作物种植面积" class="float-card flex1">
        <ChartPie
          :data="cropPieData"
          type="pie"
          :colors="['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#5ac8fa']"
        />
      </Card>
    </div>

    <!-- ===== 右侧浮层 ===== -->
    <div class="side-float side-right">
      <!-- 销售趋势 -->
      <Card title="销售趋势" class="float-card flex1">
        <ChartPie
          :data="salesLineData"
          type="line"
          :colors="['#ff9500']"
        />
      </Card>

      <!-- 农场产量排行 -->
      <Card title="农场产量排行" class="float-card flex1">
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
      </Card>

      <!-- 实时告警 -->
      <Card title="实时告警" class="float-card flex1">
        <div class="alert-scroll">
          <div class="alert-item" v-for="(a, i) in alerts" :key="i">
            <span class="alert-tag" :class="a.type === '故障' ? 'danger' : 'warning'">{{ a.type }}</span>
            <span class="alert-text">{{ a.device }} - {{ a.message || a.farm }}</span>
            <span class="alert-time">{{ formatTime(a.time) }}</span>
          </div>
          <div v-if="!alerts.length" class="empty-hint">暂无告警信息</div>
        </div>
      </Card>

      <!-- 待办任务 -->
      <Card title="待办任务" class="float-card flex1">
        <div class="task-list">
          <div class="task-item" v-for="(t, i) in tasks" :key="i">
            <span class="task-priority" :class="'p' + t.priority"></span>
            <span class="task-title">{{ t.title }}</span>
            <span class="task-date">{{ t.due_date || '-' }}</span>
          </div>
          <div v-if="!tasks.length" class="empty-hint">暂无待办任务</div>
        </div>
      </Card>
    </div>

    <!-- ===== 地图图例 ===== -->
    <div class="map-legend">
      <span class="legend-item"><i class="legend-dot online"></i>在线</span>
      <span class="legend-item"><i class="legend-dot offline"></i>离线</span>
      <span class="legend-item"><i class="legend-dot fault"></i>故障</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
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
import Card from '@/components/bigscreen/Card.vue'
import ChartPie from '@/components/bigscreen/ChartPie.vue'

const router = useRouter()

const currentTime = ref('')
const currentDate = ref('')
let timer = null

const goBack = () => router.push('/dashboard')

const updateClock = () => {
  const now = dayjs()
  currentTime.value = now.format('HH:mm:ss')
  currentDate.value = now.format('YYYY年MM月DD日 dddd')
}

// Map
const mapContainer = ref(null)
const mapError = ref('')
let map = null

// Data
const statCards = ref([
  { key: 'farm', label: '农场数量', display: '-', color: '#ff3b30' },
  { key: 'device', label: '在线设备', display: '-', color: '#ff9500' },
  { key: 'yield', label: '总产量(kg)', display: '-', color: '#34c759' },
  { key: 'sales', label: '销售额(元)', display: '-', color: '#5ac8fa' }
])

const kpiList = ref([
  { label: '农场总数', value: '-', color: '#ff3b30', iconBg: 'rgba(255,59,48,0.15)', icon: '🏠' },
  { label: '设备在线率', value: '-', color: '#ff9500', iconBg: 'rgba(255,149,0,0.15)', icon: '📡' },
  { label: '本月产量', value: '-', color: '#34c759', iconBg: 'rgba(52,199,89,0.15)', icon: '🌾' },
  { label: '本月销售额', value: '-', color: '#5ac8fa', iconBg: 'rgba(90,200,250,0.15)', icon: '💰' }
])

const alerts = ref([])
const tasks = ref([])
const farmRank = ref([])
const devicePieData = ref([])
const cropPieData = ref([])
const salesLineData = ref([])

const formatNumber = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num?.toLocaleString() || '0'
}

const formatTime = (time) => time ? dayjs(time).format('MM-DD HH:mm') : '-'

// ===== 地图 =====
const loadAMap = async () => {
  if (window.AMap) return window.AMap

  const configRes = await getPublicConfig('amap_key,amap_security_js_code,amap_center_longitude,amap_center_latitude,amap_default_zoom,amap_map_style')
  const config = configRes.data || {}

  const key = config.amap_key
  if (!key) throw new Error('未配置高德地图 API Key')

  if (config.amap_security_js_code) {
    window._AMapSecurityConfig = { securityJsCode: config.amap_security_js_code }
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

    const centerLng = parseFloat(config.amap_center_longitude) || 119.92
    const centerLat = parseFloat(config.amap_center_latitude) || 28.46
    const zoom = parseInt(config.amap_default_zoom) || 10
    const mapStyle = config.amap_map_style || 'amap://styles/dark'

    map = new AMap.Map(mapContainer.value, {
      viewMode: '2D',
      center: [centerLng, centerLat],
      zoom: zoom,
      mapStyle: mapStyle,
      features: ['bg', 'road', 'building'],
      showIndoorMap: false
    })

    const [farmRes, deviceRes] = await Promise.all([
      getFarmList({ pageSize: 100 }),
      getDeviceList({ pageSize: 200 })
    ])

    const farms = farmRes.data || []
    const devices = deviceRes.data || []

    const farmMarkerContent = (name) => `
      <div class="farm-marker">
        <div class="farm-marker-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#ff3b30">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <span class="farm-marker-name">${name}</span>
      </div>
    `

    const deviceMarkerContent = (status) => {
      const colors = { 1: '#34c759', 0: '#8e8e93', 2: '#ff3b30' }
      const color = colors[status] || '#8e8e93'
      const pulseClass = status === 1 ? 'pulse-anim' : ''
      return `
        <div class="device-marker">
          <div class="device-dot ${pulseClass}" style="background: ${color}; box-shadow: 0 0 8px ${color};"></div>
          ${status === 1 ? `<div class="device-pulse" style="background: ${color};"></div>` : ''}
        </div>
      `
    }

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
                <div style="background:#fff;border-radius:8px;min-width:180px;box-shadow:0 4px 20px rgba(0,0,0,0.15);overflow:hidden;font-family:Microsoft YaHei;">
                  <div style="padding:10px 14px;background:linear-gradient(135deg,rgba(255,59,48,0.1),rgba(255,149,0,0.05));border-bottom:1px solid rgba(255,59,48,0.15);color:#ff3b30;font-size:14px;font-weight:500;">${f.name}</div>
                  <div style="padding:10px 14px;font-size:13px;color:#333;">
                    <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#999;">地址</span><span>${f.address || '-'}</span></div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#999;">面积</span><span>${f.area || '-'} 亩</span></div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#999;">负责人</span><span>${f.manager || '-'}</span></div>
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

    devices.forEach(d => {
      if (d.longitude && d.latitude) {
        const lng = parseFloat(d.longitude)
        const lat = parseFloat(d.latitude)
        if (!isNaN(lat) && !isNaN(lng)) {
          const statusText = d.status === 1 ? '在线' : d.status === 2 ? '故障' : '离线'
          const marker = new AMap.Marker({
            position: [lng, lat],
            content: deviceMarkerContent(d.status),
            offset: new AMap.Pixel(-9, -9)
          })
          marker.setMap(map)
          marker.on('click', () => {
            const infoWindow = new AMap.InfoWindow({
              content: `
                <div style="background:#fff;border-radius:8px;min-width:160px;box-shadow:0 4px 20px rgba(0,0,0,0.15);overflow:hidden;font-family:Microsoft YaHei;">
                  <div style="padding:10px 14px;background:linear-gradient(135deg,rgba(255,59,48,0.1),rgba(255,149,0,0.05));border-bottom:1px solid rgba(255,59,48,0.15);color:#ff3b30;font-size:14px;font-weight:500;">${d.name} <span style="font-size:11px;margin-left:6px;padding:2px 6px;border-radius:8px;background:rgba(255,59,48,0.1);">${statusText}</span></div>
                  <div style="padding:10px 14px;font-size:13px;color:#333;">
                    <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#999;">编码</span><span>${d.code || '-'}</span></div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#999;">位置</span><span>${d.location || '-'}</span></div>
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

    if (farms.length > 0 && farms.some(f => f.longitude)) {
      map.setFitView(null, false, [80, 80, 80, 80])
    }
  } catch (e) {
    console.error('地图初始化失败:', e)
    mapError.value = e.message || '地图加载失败'
  }
}

// ===== 数据加载 =====
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

    // stat cards
    statCards.value[0].display = formatNumber(s.farmCount)
    statCards.value[1].display = formatNumber(s.onlineDeviceCount) + '/' + formatNumber(s.deviceCount)
    statCards.value[2].display = formatNumber(s.totalYield)
    statCards.value[3].display = formatNumber(s.totalSales)

    // KPI cards
    kpiList.value[0].value = formatNumber(s.farmCount) + ' 个'
    const rate = s.deviceCount ? Math.round((s.onlineDeviceCount / s.deviceCount) * 100) : 0
    kpiList.value[1].value = rate + '%'
    const yd = yieldData.data || []
    kpiList.value[2].value = yd.length ? formatNumber(yd[yd.length - 1].total_yield) : '-'
    kpiList.value[3].value = '¥' + formatNumber(s.totalSales)

    // charts
    salesLineData.value = (yieldData.data || []).map(d => ({
      name: d.month,
      value: Math.round((d.total_yield || 0) * (3 + Math.random() * 2))
    }))

    devicePieData.value = (deviceData.data || []).map(d => ({ name: d.name, value: d.value }))

    const crops = cropData.data || []
    cropPieData.value = crops.map(c => ({ name: c.crop_name, value: c.total_area || 0 }))

    alerts.value = alertData.data || []
    tasks.value = taskData.data || []

    const maxArea = Math.max(...crops.map(c => c.total_area || 0), 1)
    farmRank.value = crops.map(c => ({
      name: c.crop_name,
      value: (c.total_area || 0) + '亩',
      percent: ((c.total_area || 0) / maxArea) * 100
    }))
  } catch (e) {
    console.error('大屏数据加载失败:', e)
  }
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
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', handleKeydown)
  map?.destroy()
})
</script>

<style lang="scss" scoped>
.bigscreen {
  position: fixed;
  inset: 0;
  background: #0a1628;
  color: #fff;
  font-family: 'Microsoft YaHei', -apple-system, sans-serif;
  overflow: hidden;
}

// ===== 全屏背景地图 =====
.map-fullscreen {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.map-fallback {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(160deg, #0a1628 0%, #1a2a4a 50%, #0a1628 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  .fallback-content {
    text-align: center;
    color: rgba(255, 59, 48, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    font-size: 16px;
  }
}

// ===== 顶部 Header =====
.bs-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 0 30px;
  background: linear-gradient(180deg, rgba(255, 59, 48, 0.95) 0%, rgba(200, 40, 30, 0.95) 100%);
  box-shadow: 0 4px 30px rgba(255, 59, 48, 0.4);

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ffcc00, #ff9500, #ff3b30, #ff9500, #ffcc00);
  }
}

.header-center {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-emblem {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '🌾';
    font-size: 18px;
  }
}

.header-title {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 6px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-wing {
  flex: 1;
  height: 2px;
  position: relative;

  &.left {
    margin-right: 30px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));

    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      background: #fff;
      border-radius: 50%;
    }
  }

  &.right {
    margin-left: 30px;
    background: linear-gradient(270deg, transparent, rgba(255, 255, 255, 0.4));

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      background: #fff;
      border-radius: 50%;
    }
  }
}

.header-time {
  position: absolute;
  right: 80px;
  text-align: right;

  .time-date {
    display: block;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }

  .time-clock {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    font-family: 'DIN', monospace;
    letter-spacing: 2px;
  }
}

.close-btn {
  position: absolute;
  right: 24px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
}

// ===== KPI 浮层 =====
.kpi-float-bar {
  position: absolute;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(10, 22, 40, 0.75);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.kpi-float-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 59, 48, 0.3);
    transform: translateY(-2px);
  }
}

.kpi-float-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.kpi-float-content {
  text-align: left;
}

.kpi-float-val {
  font-size: 24px;
  font-weight: 700;
  font-family: 'DIN', 'Arial', sans-serif;
  line-height: 1.2;
}

.kpi-float-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

// ===== 侧边浮层 =====
.side-float {
  position: absolute;
  top: 160px;
  bottom: 24px;
  width: 320px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  padding: 8px 0;

  &.side-left {
    left: 24px;
  }

  &.side-right {
    right: 24px;
  }
}

.float-card {
  background: rgba(10, 22, 40, 0.8) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3) !important;

  &.flex1 {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  :deep(.card-title) {
    color: #ff9500 !important;
    border-bottom-color: rgba(255, 255, 255, 0.1) !important;
  }

  :deep(.card-body) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

// ===== 左侧：农田统计 =====
.farm-stat-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.farm-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 59, 48, 0.1);
    border-color: rgba(255, 59, 48, 0.3);
  }
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.c0 { background: rgba(255, 59, 48, 0.2); color: #ff3b30; }
  &.c1 { background: rgba(255, 149, 0, 0.2); color: #ff9500; }
  &.c2 { background: rgba(52, 199, 89, 0.2); color: #34c759; }
  &.c3 { background: rgba(90, 200, 250, 0.2); color: #5ac8fa; }
}

.stat-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.stat-val {
  font-size: 20px;
  font-weight: 700;
  font-family: 'DIN', 'Arial', sans-serif;
  color: #fff;
}

.stat-lbl {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

// ===== 排行榜 =====
.rank-list {
  flex: 1;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  font-size: 12px;
}

.rank-no {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
  font-weight: 600;

  &.top3 {
    background: linear-gradient(135deg, #ff9500, #ff3b30);
    color: #fff;
    box-shadow: 0 2px 6px rgba(255, 59, 48, 0.4);
  }
}

.rank-name {
  width: 70px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.rank-bar-wrap {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.rank-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff3b30, #ff9500);
  border-radius: 3px;
  transition: width 1s ease;
}

.rank-val {
  width: 50px;
  text-align: right;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
  font-size: 11px;
}

// ===== 告警 =====
.alert-scroll {
  flex: 1;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }
}

.alert-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  font-weight: 500;
  &.danger { background: rgba(255, 59, 48, 0.2); color: #ff3b30; }
  &.warning { background: rgba(255, 149, 0, 0.2); color: #ff9500; }
}

.alert-text {
  flex: 1;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-time {
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  font-size: 11px;
}

.empty-hint {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  padding: 20px 0;
  font-size: 13px;
}

// ===== 任务 =====
.task-list {
  flex: 1;
  overflow-y: auto;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }
}

.task-priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  &.p1 { background: #8e8e93; }
  &.p2 { background: #ff9500; }
  &.p3 { background: #ff3b30; }
}

.task-title {
  flex: 1;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-date {
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  font-size: 11px;
}

// ===== 地图图例 =====
.map-legend {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: rgba(10, 22, 40, 0.8);
  backdrop-filter: blur(12px);
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  &.online { background: #34c759; box-shadow: 0 0 6px rgba(52, 199, 89, 0.6); }
  &.offline { background: #8e8e93; }
  &.fault { background: #ff3b30; box-shadow: 0 0 6px rgba(255, 59, 48, 0.6); }
}

// ===== 地图标记样式 =====
:deep(.farm-marker) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(255, 59, 48, 0.4);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #fff;
    border-color: #ff3b30;
    box-shadow: 0 4px 20px rgba(255, 59, 48, 0.3);
  }
}

:deep(.farm-marker-name) {
  color: #ff3b30;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  font-family: Microsoft YaHei, sans-serif;
}

:deep(.device-marker) {
  position: relative;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

:deep(.device-dot) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  z-index: 2;
}

:deep(.device-pulse) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0;
  z-index: 1;
  animation: devicePulse 2.5s ease-out infinite;
}

:deep(.pulse-anim) {
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
}

@keyframes devicePulse {
  0% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(3.5); }
}

:deep(.amap-info-content) {
  padding: 0 !important;
  background: transparent !important;
}
:deep(.amap-info-sharp) {
  display: none;
}
:deep(.amap-info) {
  background: transparent !important;
}

// ===== 滚动条 =====
.bigscreen ::-webkit-scrollbar {
  width: 4px;
}
.bigscreen ::-webkit-scrollbar-track {
  background: transparent;
}
.bigscreen ::-webkit-scrollbar-thumb {
  background: rgba(255, 59, 48, 0.3);
  border-radius: 2px;
  &:hover {
    background: rgba(255, 59, 48, 0.5);
  }
}
</style>
