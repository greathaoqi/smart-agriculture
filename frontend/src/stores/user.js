import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getCurrentUser } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const permissions = ref([])

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const realName = computed(() => userInfo.value?.real_name || '')
  const avatar = computed(() => userInfo.value?.avatar || '')

  // 登录
  async function loginAction(loginForm) {
    const res = await login(loginForm)
    token.value = res.data.token
    userInfo.value = res.data.user
    permissions.value = res.data.user.role?.permissions || []
    localStorage.setItem('token', res.data.token)
    return res
  }

  // 获取用户信息
  async function getUserInfo() {
    if (!token.value) return null
    try {
      const res = await getCurrentUser()
      userInfo.value = res.data
      permissions.value = res.data.role?.permissions || []
      return res.data
    } catch (error) {
      logout()
      throw error
    }
  }

  // 退出登录
  function logout() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    localStorage.removeItem('token')
  }

  // 检查权限
  function hasPermission(permission) {
    if (userInfo.value?.role?.code === 'admin') return true
    return permissions.value.includes(permission)
  }

  return {
    token,
    userInfo,
    permissions,
    isLoggedIn,
    username,
    realName,
    avatar,
    loginAction,
    getUserInfo,
    logout,
    hasPermission
  }
})
