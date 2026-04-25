import request from '@/utils/request'

export function getInventoryList(params) {
  return request.get('/inventory', { params })
}

export function getInventoryById(id) {
  return request.get(`/inventory/${id}`)
}

export function createInventory(data) {
  return request.post('/inventory', data)
}

export function updateInventory(id, data) {
  return request.put(`/inventory/${id}`, data)
}

export function deleteInventory(id) {
  return request.delete(`/inventory/${id}`)
}

export function stockIn(data) {
  return request.post('/inventory/stock-in', data)
}

export function stockOut(data) {
  return request.post('/inventory/stock-out', data)
}

export function getWarningList() {
  return request.get('/inventory/warning')
}
