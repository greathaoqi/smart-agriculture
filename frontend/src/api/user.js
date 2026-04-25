import request from '@/utils/request'

// 获取用户列表
export function getUserList(params) {
  return request.get('/users', { params })
}

// 获取用户详情
export function getUserById(id) {
  return request.get(`/users/${id}`)
}

// 获取当前用户信息
export function getCurrentUser() {
  return request.get('/users/me')
}

// 创建用户
export function createUser(data) {
  return request.post('/users', data)
}

// 更新用户
export function updateUser(id, data) {
  return request.put(`/users/${id}`, data)
}

// 更新当前用户信息
export function updateCurrentUser(data) {
  return request.put('/users/me', data)
}

// 删除用户
export function deleteUser(id) {
  return request.delete(`/users/${id}`)
}

// 重置密码
export function resetPassword(id, password) {
  return request.put(`/users/${id}/password`, { password })
}

// 修改当前用户密码
export function changePassword(data) {
  return request.put('/users/me/password', data)
}
