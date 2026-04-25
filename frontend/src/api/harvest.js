import request from '@/utils/request'

export function getHarvestList(params) {
  return request.get('/harvests', { params })
}

export function getHarvestById(id) {
  return request.get(`/harvests/${id}`)
}

export function createHarvest(data) {
  return request.post('/harvests', data)
}

export function updateHarvest(id, data) {
  return request.put(`/harvests/${id}`, data)
}

export function deleteHarvest(id) {
  return request.delete(`/harvests/${id}`)
}

export function getHarvestStats(params) {
  return request.get('/harvests/stats', { params })
}
