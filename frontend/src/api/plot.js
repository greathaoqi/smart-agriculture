import request from '@/utils/request'

export function getPlotList(params) {
  return request.get('/plots', { params })
}

export function getPlotById(id) {
  return request.get(`/plots/${id}`)
}

export function createPlot(data) {
  return request.post('/plots', data)
}

export function updatePlot(id, data) {
  return request.put(`/plots/${id}`, data)
}

export function deletePlot(id) {
  return request.delete(`/plots/${id}`)
}

export function getPlotsByFarm(farmId) {
  return request.get(`/plots/farm/${farmId}`)
}
