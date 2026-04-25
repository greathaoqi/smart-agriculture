import request from '@/utils/request'

export function getCurrent() {
  return request.get('/weather/current')
}

export function getHistory(params) {
  return request.get('/weather/history', { params })
}

export function getForecast() {
  return request.get('/weather/forecast')
}
