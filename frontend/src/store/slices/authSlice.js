import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/axios'

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Login attempt:', { email: credentials.email })
      const response = await api.post('/auth/login', credentials)
      console.log('Login response:', response.data)
      
      if (response.data.success) {
        const { token, user } = response.data
        
        // Store token
        localStorage.setItem('token', token)
        
        return { token, user }
      } else {
        console.error('Login failed - no success flag:', response.data)
        return rejectWithValue(response.data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed'
      )
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }
      
      const response = await api.get('/auth/me')
      if (response.data.success) {
        return response.data.user
      } else {
        throw new Error('Failed to get user')
      }
    } catch (error) {
      localStorage.removeItem('token')
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user'
      )
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    loading: !!localStorage.getItem('token'),
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
