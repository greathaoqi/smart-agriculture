import request from '@/utils/request'

// 获取公开配置
export const getPublicConfig = (keys) => {
  return request.get('/system-config/public', { params: { keys } })
}

// 获取所有配置（管理员）
export const getAllConfig = () => {
  return request.get('/system-config')
}

// 更新配置（管理员）
export const updateConfig = (key, value) => {
  return request.put(`/system-config/${key}`, { value })
}

// 创建配置（管理员）
export const createConfig = (data) => {
  return request.post('/system-config', data)
}

// 删除配置（管理员）
export const deleteConfig = (key) => {
  return request.delete(`/system-config/${key}`)
}