import request from '@/utils/request'

export function getMessages(params) {
  return request.get('/alerts/messages', { params })
}

export function getUnreadCount() {
  return request.get('/alerts/messages/unread-count')
}

export function markRead(id) {
  return request.put(`/alerts/messages/${id}/read`)
}

export function handle(id, note) {
  return request.put(`/alerts/messages/${id}/handle`, { note })
}

export function getMessageStats() {
  return request.get('/alerts/messages/stats')
}

export function getRules(params) {
  return request.get('/alerts/rules', { params })
}

export function createRule(data) {
  return request.post('/alerts/rules', data)
}

export function updateRule(id, data) {
  return request.put(`/alerts/rules/${id}`, data)
}

export function deleteRule(id) {
  return request.delete(`/alerts/rules/${id}`)
}
