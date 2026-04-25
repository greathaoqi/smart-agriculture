import request from '@/utils/request'

// 登录
export function login(data) {
  return request.post('/auth/login', data)
}

// 退出登录
export function logout() {
  return request.post('/auth/logout')
}

// 获取当前用户信息
export function getCurrentUser() {
  return request.get('/auth/me')
}

// 修改密码
export function changePassword(data) {
  return request.put('/auth/password', data)
}
