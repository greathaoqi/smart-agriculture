import request from '@/utils/request'

// 获取设备列表
export function getDeviceList(params) {
  return request.get('/devices', { params })
}

// 获取设备详情
export function getDeviceById(id) {
  return request.get(`/devices/${id}`)
}

// 创建设备
export function createDevice(data) {
  return request.post('/devices', data)
}

// 更新设备
export function updateDevice(id, data) {
  return request.put(`/devices/${id}`, data)
}

// 删除设备
export function deleteDevice(id) {
  return request.delete(`/devices/${id}`)
}

// 获取设备统计
export function getDeviceStats() {
  return request.get('/devices/stats')
}

// 获取设备数据历史
export function getDeviceHistory(id, params) {
  return request.get(`/devices/${id}/history`, { params })
}

// 获取设备实时数据
export function getDeviceLatestData(id) {
  return request.get(`/devices/${id}/latest`)
}
