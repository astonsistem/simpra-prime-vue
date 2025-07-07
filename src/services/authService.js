import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/api'

export const authService = {
  async login({ username, password }) {
    const data = new URLSearchParams()
    data.append('username', username)
    data.append('password', password)
    data.append('grant_type', '')
    data.append('scope', '')
    data.append('client_id', '')
    data.append('client_secret', '')

    const response = await axios.post(`${BASE_URL}/auth/logintoken`, data)
    return response.data
  },

  async getCurrentUser(token) {
    const response = await axios.get(`${BASE_URL}/auth/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  decodeJWT(token) {
    try {
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      return decoded?.data || null
    } catch (e) {
      console.error('Failed to decode token:', e)
      return null
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken')
  },

  getUser() {
    const token = localStorage.getItem('accessToken')
    return token ? this.decodeJWT(token) : null
  },

  getUserRole() {
    const user = this.getUser()
    return user?.role || null
  },
}
