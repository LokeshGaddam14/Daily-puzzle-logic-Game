import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { LeaderboardEntry } from '../../types';
import { leaderboardAPI } from '../../lib/api';

interface LeaderboardState {
  daily: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: LeaderboardState = {
  daily: [],
  allTime: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

export const fetchDailyLeaderboard = createAsyncThunk(
  'leaderboard/fetchDaily',
  async (date?: string) => {
    const res = await leaderboardAPI.daily(date);
    return res.data.data as LeaderboardEntry[];
  }
);

export const fetchAllTimeLeaderboard = createAsyncThunk(
  'leaderboard/fetchAllTime',
  async () => {
    const res = await leaderboardAPI.allTime();
    return res.data.data as LeaderboardEntry[];
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyLeaderboard.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDailyLeaderboard.fulfilled, (state, action: PayloadAction<LeaderboardEntry[]>) => {
        state.isLoading = false;
        state.daily = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchDailyLeaderboard.rejected, (state) => {
        state.isLoading = false;
        state.error = 'Failed to load leaderboard';
      })
      .addCase(fetchAllTimeLeaderboard.fulfilled, (state, action: PayloadAction<LeaderboardEntry[]>) => {
        state.allTime = action.payload;
      });
  },
});

export const { clearError } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
