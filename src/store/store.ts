import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import jobsReducer from './slices/jobsSlice'
import customCvReducer from './slices/customCvSlice'
import dashboardReducer from './slices/dashboardSlice'
import freelanceReducer from './slices/freelanceSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    customCv: customCvReducer,
    dashboard: dashboardReducer,
    freelance: freelanceReducer,
  },
})
export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
