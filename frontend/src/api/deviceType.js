import request from '@/utils/request'

export function getList(params) {
  return request.get('/device-types', { params })
}

export function getById(id) {
  return request.get(`/device-types/${id}`)
}

export function create(data) {
  return request.post('/device-types', data)
}

export function update(id, data) {
  return request.put(`/device-types/${id}`, data)
}

export function remove(id) {
  return request.delete(`/device-types/${id}`)
}
