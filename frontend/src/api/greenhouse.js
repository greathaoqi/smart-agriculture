import request from '@/utils/request'

export function getList(params) {
  return request.get('/greenhouses', { params })
}

export function getById(id) {
  return request.get(`/greenhouses/${id}`)
}

export function create(data) {
  return request.post('/greenhouses', data)
}

export function update(id, data) {
  return request.put(`/greenhouses/${id}`, data)
}

export function remove(id) {
  return request.delete(`/greenhouses/${id}`)
}

export function getEnvironment(id) {
  return request.get(`/greenhouses/${id}/environment`)
}

export function control(id, data) {
  return request.post(`/greenhouses/${id}/control`, data)
}

export function getStats() {
  return request.get('/greenhouses/stats')
}
