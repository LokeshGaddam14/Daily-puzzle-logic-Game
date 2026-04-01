import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { StreakData } from '../../types';

interface StreakState extends StreakData {
  isLoading: boolean;
}

const initialState: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastPlayed: null,
  history: {},
  isLoading: false,
};

const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    setStreakData(state, action: PayloadAction<StreakData>) {
      return { ...state, ...action.payload };
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setStreakData, setLoading } = streakSlice.actions;
export default streakSlice.reducer;
