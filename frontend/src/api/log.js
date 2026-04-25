import request from '@/utils/request'

export function getLogList(params) {
  return request.get('/logs', { params })
}

export function getLogById(id) {
  return request.get(`/logs/${id}`)
}

export function getLogModules() {
  return request.get('/logs/modules')
}

export function getLogActions() {
  return request.get('/logs/actions')
}

export function getLogStats(params) {
  return request.get('/logs/stats', { params })
}
