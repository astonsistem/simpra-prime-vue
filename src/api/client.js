// src/api/client.js
import axios from 'axios'
import { authService } from '../services/authService' // Import authService

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Use environment variable for base URL
  timeout: 10000, // Keep your timeout
  headers: {
    'Content-Type': 'application/json', // Keep content type
    Accept: 'application/json', // Add Accept header for JSON (good practice)
    Authorization: `Bearer ${authService.getAccessToken()}`,
  },
})

// Request interceptor
api.interceptors.request.use((config) => {
  const accessToken = authService.getAccessToken() // Get token from authService
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
      error.config._retry = true
      try {
        const { data } = await api.post('/auth/refresh', null, {
          headers: {
            Authorization: `Bearer ${authService.getAccessToken()}`,
          },
        })
        console.log('refresh', data)
        authService.setAccessToken(data.access_token)
        error.config.headers.Authorization = `Bearer ${data.access_token}`
        return api(error.config)
      } catch (e) {
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
