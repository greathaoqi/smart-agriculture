import request from '@/utils/request'

// 获取农场列表
export function getFarmList(params) {
  return request.get('/farms', { params })
}

// 获取农场详情
export function getFarmById(id) {
  return request.get(`/farms/${id}`)
}

// 创建农场
export function createFarm(data) {
  return request.post('/farms', data)
}

// 更新农场
export function updateFarm(id, data) {
  return request.put(`/farms/${id}`, data)
}

// 删除农场
export function deleteFarm(id) {
  return request.delete(`/farms/${id}`)
}

// 获取农场统计
export function getFarmStats(id) {
  return request.get(`/farms/${id}/stats`)
}
