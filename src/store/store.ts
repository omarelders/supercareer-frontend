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

// Get the type of our store variable
export type AppStore = typeof store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
// Inferred type: {auth: AuthState}
export type AppDispatch = AppStore['dispatch']
