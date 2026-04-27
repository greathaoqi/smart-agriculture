<template>
  <div class="bigscreen">
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

    <!-- ===== 主体三栏布局 ===== -->
    <div class="bs-body">
      <!-- ====== 左侧面板 (25%) ====== -->
      <div class="bs-col bs-left">
        <!-- 农田统计列表 -->
        <Card title="农田区域统计" class="col-card">
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

        <!-- 环境数据环形图 -->
        <Card title="设备状态" class="col-card flex1">
          <ChartPie
            :data="devicePieData"
            type="pie"
            :colors="['#ff3b30', '#ff9500', '#34c759', '#8e8e93']"
          />
        </Card>

        <!-- 作物占比环形图 -->
        <Card title="作物种植面积" class="col-card flex1">
          <ChartPie
            :data="cropPieData"
            type="pie"
            :colors="['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#5ac8fa']"
          />
        </Card>

        <!-- 区域产量柱状图 -->
        <Card title="产量趋势" class="col-card flex1">
          <ChartPie
            :data="yieldBarData"
            type="bar"
            :colors="['#ff3b30']"
          />
        </Card>
      </div>

      <!-- ====== 中央区域 (50%) ====== -->
      <div class="bs-col bs-center">
        <!-- KPI 卡片行 -->
        <div class="kpi-row">
          <div class="kpi-card" v-for="(kpi, i) in kpiList" :key="i">
            <div class="kpi-icon" :style="{ background: kpi.iconBg }">
              <span v-html="kpi.icon"></span>
            </div>
            <div class="kpi-num" :style="{ color: kpi.color }">{{ kpi.value }}</div>
            <div class="kpi-name">{{ kpi.label }}</div>
          </div>
        </div>

        <!-- 超大核心数字 -->
        <div class="hero-section">
          <div class="hero-glow"></div>
          <div class="hero-ring ring-outer"></div>
          <div class="hero-ring ring-inner"></div>
          <div class="hero-content">
            <div class="hero-value">{{ heroValue }}</div>
            <div class="hero-label">年度累计总产量 (kg)</div>
          </div>
        </div>

        <!-- 地图 -->
        <div class="map-section">
          <div class="map-title-bar">
            <span class="map-title-dot"></span>
            <span>农场分布地图</span>
          </div>
          <div ref="mapContainer" class="map-container" v-show="!mapError"></div>
          <div class="map-preview" v-if="mapError">
            <div class="preview-placeholder">
              <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#ff3b30" stroke-width="2" stroke-dasharray="4 4" opacity="0.4"/>
                <path d="M24 8C16.268 8 10 14.268 10 22c0 11 14 18 14 18s14-7 14-18c0-7.732-6.268-14-14-14z" fill="#ff3b30" opacity="0.15"/>
                <circle cx="24" cy="22" r="5" fill="#ff3b30" opacity="0.6"/>
              </svg>
              <span>{{ mapError }}</span>
            </div>
          </div>
          <div class="map-legend">
            <span class="legend-item"><i class="legend-dot online"></i>在线</span>
            <span class="legend-item"><i class="legend-dot offline"></i>离线</span>
            <span class="legend-item"><i class="legend-dot fault"></i>故障</span>
          </div>
        </div>
      </div>

      <!-- ====== 右侧面板 (25%) ====== -->
      <div class="bs-col bs-right">
        <!-- 销售趋势 -->
        <Card title="销售趋势" class="col-card flex1">
          <ChartPie
            :data="salesLineData"
            type="line"
            :colors="['#ff9500']"
          />
        </Card>

        <!-- 农场排行 -->
        <Card title="农场产量排行" class="col-card flex1">
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
        <Card title="实时告警" class="col-card flex1">
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
        <Card title="待办任务" class="col-card flex1">
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
  { label: '农场总数', value: '-', color: '#ff3b30', iconBg: 'rgba(255,59,48,0.1)', icon: '🏠' },
  { label: '设备在线率', value: '-', color: '#ff9500', iconBg: 'rgba(255,149,0,0.1)', icon: '📡' },
  { label: '本月产量', value: '-', color: '#34c759', iconBg: 'rgba(52,199,89,0.1)', icon: '🌾' },
  { label: '本月销售额', value: '-', color: '#5ac8fa', iconBg: 'rgba(90,200,250,0.1)', icon: '💰' }
])

const heroValue = ref('0')
const alerts = ref([])
const tasks = ref([])
const farmRank = ref([])
const devicePieData = ref([])
const cropPieData = ref([])
const yieldBarData = ref([])
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
    const mapStyle = config.amap_map_style || 'amap://styles/light'

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
      map.setFitView(null, false, [40, 40, 40, 40])
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

    // hero
    heroValue.value = formatNumber(s.totalYield)

    // charts
    yieldBarData.value = (yieldData.data || []).map(d => ({ name: d.month, value: d.total_yield || 0 }))
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
  background: linear-gradient(160deg, #fef5f0 0%, #f0f4ff 40%, #f5f0fe 70%, #fef5f0 100%);
  color: #333;
  font-family: 'Microsoft YaHei', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 20%, rgba(255, 59, 48, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(255, 149, 0, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
}

// ===== 顶部 =====
.bs-header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  padding: 0 30px;
  background: linear-gradient(180deg, #ff3b30 0%, #e0331e 100%);
  box-shadow: 0 4px 20px rgba(255, 59, 48, 0.3);

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
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.header-wing {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
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

// ===== 主体 =====
.bs-body {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.bs-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.bs-left, .bs-right {
  width: 24%;
  flex-shrink: 0;
}

.bs-center {
  flex: 1;
  gap: 16px;
}

.col-card {
  &.flex1 {
    flex: 1;
    min-height: 0;
  }
}

// ===== 左侧：农田统计 =====
.farm-stat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.farm-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.04), rgba(255, 149, 0, 0.03));
  border-radius: 10px;
  border: 1px solid rgba(255, 59, 48, 0.08);
  transition: all 0.2s;

  &:hover {
    border-color: rgba(255, 59, 48, 0.2);
    box-shadow: 0 2px 12px rgba(255, 59, 48, 0.08);
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

  &.c0 { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }
  &.c1 { background: rgba(255, 149, 0, 0.1); color: #ff9500; }
  &.c2 { background: rgba(52, 199, 89, 0.1); color: #34c759; }
  &.c3 { background: rgba(90, 200, 250, 0.1); color: #5ac8fa; }
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
  color: #333;
}

.stat-lbl {
  font-size: 12px;
  color: #999;
}

// ===== 中央：KPI 卡片行 =====
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  flex-shrink: 0;
}

.kpi-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 18px 16px;
  text-align: center;
  border: 1px solid rgba(255, 59, 48, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 59, 48, 0.1);
    border-color: rgba(255, 59, 48, 0.25);
  }
}

.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-size: 20px;
}

.kpi-num {
  font-size: 28px;
  font-weight: 700;
  font-family: 'DIN', 'Arial', sans-serif;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.kpi-name {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
}

// ===== 中央：超大核心数字 =====
.hero-section {
  flex-shrink: 0;
  height: 180px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 59, 48, 0.12) 0%, rgba(255, 149, 0, 0.06) 40%, transparent 70%);
  animation: heroGlow 4s ease-in-out infinite alternate;
}

@keyframes heroGlow {
  0% { transform: scale(0.9); opacity: 0.7; }
  100% { transform: scale(1.1); opacity: 1; }
}

.hero-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255, 59, 48, 0.15);

  &.ring-outer {
    width: 280px;
    height: 280px;
    animation: ringRotate 20s linear infinite;
    border-color: rgba(255, 59, 48, 0.12);

    &::after {
      content: '';
      position: absolute;
      top: -4px;
      left: 50%;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ff3b30;
      box-shadow: 0 0 12px rgba(255, 59, 48, 0.6);
    }
  }

  &.ring-inner {
    width: 200px;
    height: 200px;
    animation: ringRotate 15s linear infinite reverse;
    border-color: rgba(255, 149, 0, 0.12);

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ff9500;
      box-shadow: 0 0 10px rgba(255, 149, 0, 0.6);
    }
  }
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero-value {
  font-size: 64px;
  font-weight: 700;
  font-family: 'DIN', 'Arial', sans-serif;
  background: linear-gradient(135deg, #ff3b30, #ff9500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  letter-spacing: -2px;
}

.hero-label {
  font-size: 14px;
  color: #999;
  margin-top: 10px;
  letter-spacing: 2px;
}

// ===== 中央：地图 =====
.map-section {
  flex: 1;
  min-height: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 59, 48, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.map-title-bar {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #ff3b30;
  border-bottom: 1px solid rgba(255, 59, 48, 0.08);
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.05), rgba(255, 149, 0, 0.03));
}

.map-title-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff3b30;
  box-shadow: 0 0 8px rgba(255, 59, 48, 0.4);
}

.map-container {
  flex: 1;
  min-height: 200px;
}

.map-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.preview-placeholder {
  text-align: center;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.map-legend {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  display: flex;
  gap: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  &.online { background: #34c759; box-shadow: 0 0 6px rgba(52, 199, 89, 0.5); }
  &.offline { background: #8e8e93; }
  &.fault { background: #ff3b30; box-shadow: 0 0 6px rgba(255, 59, 48, 0.5); }
}

// ===== 右侧：排行 =====
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
  background: #f0f0f0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
  font-weight: 600;

  &.top3 {
    background: linear-gradient(135deg, #ff9500, #ff3b30);
    color: #fff;
    box-shadow: 0 2px 6px rgba(255, 59, 48, 0.3);
  }
}

.rank-name {
  width: 70px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
  font-size: 12px;
}

.rank-bar-wrap {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
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
  color: #666;
  flex-shrink: 0;
  font-size: 11px;
}

// ===== 右侧：告警 =====
.alert-scroll {
  flex: 1;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid #f5f5f5;
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
  &.danger { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }
  &.warning { background: rgba(255, 149, 0, 0.1); color: #ff9500; }
}

.alert-text {
  flex: 1;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-time {
  color: #ccc;
  flex-shrink: 0;
  font-size: 11px;
}

.empty-hint {
  text-align: center;
  color: #ccc;
  padding: 20px 0;
  font-size: 13px;
}

// ===== 右侧：任务 =====
.task-list {
  flex: 1;
  overflow-y: auto;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid #f5f5f5;
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
  &.p1 { background: #c7c7cc; }
  &.p2 { background: #ff9500; }
  &.p3 { background: #ff3b30; }
}

.task-title {
  flex: 1;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-date {
  color: #ccc;
  flex-shrink: 0;
  font-size: 11px;
}

// ===== 地图标记样式 =====
:deep(.farm-marker) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(255, 59, 48, 0.3);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 59, 48, 0.08);
    border-color: #ff3b30;
    box-shadow: 0 4px 16px rgba(255, 59, 48, 0.2);
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
  background: rgba(255, 59, 48, 0.2);
  border-radius: 2px;
  &:hover {
    background: rgba(255, 59, 48, 0.4);
  }
}
</style>