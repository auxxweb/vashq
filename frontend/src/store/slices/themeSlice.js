import { createSlice } from '@reduxjs/toolkit'

const getInitialTheme = () => 'light'

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: getInitialTheme(),
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = 'light'
      document.documentElement.classList.remove('dark')
    },
    setTheme: (state, action) => {
      state.theme = action.payload || 'light'
      document.documentElement.classList.remove('dark')
    },
  },
})

if (typeof window !== 'undefined') {
  document.documentElement.classList.remove('dark')
}

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
