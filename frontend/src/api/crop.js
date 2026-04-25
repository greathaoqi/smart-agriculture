import request from '@/utils/request'

export function getCropList(params) {
  return request.get('/crops', { params })
}

export function getAllCrops() {
  return request.get('/crops/all')
}

export function getCropById(id) {
  return request.get(`/crops/${id}`)
}

export function createCrop(data) {
  return request.post('/crops', data)
}

export function updateCrop(id, data) {
  return request.put(`/crops/${id}`, data)
}

export function deleteCrop(id) {
  return request.delete(`/crops/${id}`)
}
