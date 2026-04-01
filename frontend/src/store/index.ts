import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import puzzleReducer from './slices/puzzleSlice';
import streakReducer from './slices/streakSlice';
import leaderboardReducer from './slices/leaderboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    puzzle: puzzleReducer,
    streak: streakReducer,
    leaderboard: leaderboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
