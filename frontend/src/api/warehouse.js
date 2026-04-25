import request from '@/utils/request'

export function getWarehouseList(params) {
  return request.get('/warehouses', { params })
}

export function getAllWarehouses() {
  return request.get('/warehouses/all')
}

export function getWarehouseById(id) {
  return request.get(`/warehouses/${id}`)
}

export function createWarehouse(data) {
  return request.post('/warehouses', data)
}

export function updateWarehouse(id, data) {
  return request.put(`/warehouses/${id}`, data)
}

export function deleteWarehouse(id) {
  return request.delete(`/warehouses/${id}`)
}

export function getWarehouseStats(id) {
  return request.get(`/warehouses/${id}/stats`)
}
