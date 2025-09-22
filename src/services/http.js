import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  },
})

// Request interceptor
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}` // Set Authorization header
  }
  return config
})

import router from '../router'
// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status

    if (error.response?.status === 401 && !error.config._retry) {
      console.log('API Error 401: Unauthorized. Logging out.')
      authService.logout()

      // rediirect to login beserta info halaman terakhir diakses
      router.push('/login', {
        query: {
          redirect: router.currentRoute.value.fullPath,
        },
      })

      return Promise.reject({
        type: 'auth',
        status: status,
        message: 'Unauthorized. Please log in again.',
      })
    }

    if (status === 422) {
      // Handle 422 Unprocessable Entity - validation errors
      return Promise.reject({
        type: 'validation',
        status: status,
        message: error.response?.data?.message || 'Validation Error',
        errors: error.response?.data?.errors || null, // Include validation errors if available
      })
    }

    return Promise.reject({
      type: 'general',
      status: status,
      message: error.response?.data?.message || error.response?.data || error.message,
    }) // Reject with error data or message
  }
)

export default api
