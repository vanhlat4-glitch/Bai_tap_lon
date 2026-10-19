import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import gamesReducer from '../features/games/gamesSlice';
import shopReducer from '../features/shop/shopSlice';

// Lesson 13 - Redux-toolkit: Centralized Store Configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,
    games: gamesReducer,
    shop: shopReducer
  }
});
