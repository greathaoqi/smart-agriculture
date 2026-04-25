import request from '@/utils/request'

export function getPlanList(params) {
  return request.get('/planting/plan', { params })
}

export function getPlanById(id) {
  return request.get(`/planting/plan/${id}`)
}

export function createPlan(data) {
  return request.post('/planting/plan', data)
}

export function updatePlan(id, data) {
  return request.put(`/planting/plan/${id}`, data)
}

export function deletePlan(id) {
  return request.delete(`/planting/plan/${id}`)
}

export function getRecordList(params) {
  return request.get('/planting/record', { params })
}

export function createRecord(data) {
  return request.post('/planting/record', data)
}

export function updateRecord(id, data) {
  return request.put(`/planting/record/${id}`, data)
}

export function deleteRecord(id) {
  return request.delete(`/planting/record/${id}`)
}
