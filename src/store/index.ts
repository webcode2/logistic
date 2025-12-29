import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import trackingReducer from './trackingSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tracking: trackingReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
