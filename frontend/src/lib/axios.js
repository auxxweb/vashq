import axios from 'axios'

// Use proxy in development, or full URL in production
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api')

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Don't redirect on login page 401 errors
    const isLoginPage = window.location.pathname === '/login'
    
    if (error.response) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
        isLoginPage
      })
      
      // Handle 401 Unauthorized - logout user (but not on login page)
      if (error.response.status === 401 && !isLoginPage) {
        localStorage.removeItem('token')
        // Clear auth state by redirecting - no need to dispatch logout
        window.location.href = '/login'
      }
      
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access forbidden:', error.response.data.message)
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', {
        url: error.config?.url,
        message: 'No response from server. Is the backend running?'
      })
    } else {
      // Something else happened
      console.error('Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api
