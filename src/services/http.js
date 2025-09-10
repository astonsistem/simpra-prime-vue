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

import router from '../router';
// Response interceptor
api.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status;
        if (status === 401) {
            // Handle 401 Unauthorized - token expired or invalid
            console.log('API Error 401: Unauthorized. Logging out.');
            authService.logout(); // Clear token and role from localStorage
            // Optionally redirect to login page here if you have access to router
            // (You might need to import router or use window.location.href for redirect)
            // Example redirect (if you can access router here -  be careful of circular dependencies):
            router.push('/login');
            // For a simpler approach without router in interceptor, you can just reload the page:
            // window.location.reload(); // Reload to effectively redirect to login page due to route guard
            return Promise.reject({ type: 'auth', status: status, message: 'Unauthorized. Please log in again.' });
        }

        if (status === 422) {
            // Handle 422 Unprocessable Entity - validation errors
            return Promise.reject({
                type: 'validation',
                status: status,
                message: error.response?.data?.message || 'Validation Error',
                errors: error.response?.data?.errors || null // Include validation errors if available
            });
        }
        
        return Promise.reject({
            type: 'general',
            status: status,
            message: error.response?.data?.message || error.response?.data || error.message 
        }); // Reject with error data or message
    }
);

export default api
