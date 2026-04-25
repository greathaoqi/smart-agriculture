import request from '@/utils/request'

// 获取统计数据
export function getStats() {
  return request.get('/dashboard/stats')
}

// 获取产量趋势
export function getYieldTrend(params) {
  return request.get('/dashboard/yield-trend', { params })
}

// 获取作物分布
export function getCropDistribution() {
  return request.get('/dashboard/crop-distribution')
}

// 获取设备状态
export function getDeviceStatus() {
  return request.get('/dashboard/device-status')
}

// 获取最近告警
export function getRecentAlerts(params) {
  return request.get('/dashboard/recent-alerts', { params })
}

// 获取待办任务
export function getPendingTasks(params) {
  return request.get('/dashboard/pending-tasks', { params })
}
