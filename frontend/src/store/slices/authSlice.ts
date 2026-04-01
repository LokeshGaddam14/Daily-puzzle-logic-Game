import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';
import { authAPI } from '../../lib/api';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('ll_token'),
  isGuest: !localStorage.getItem('ll_token'),
  isLoading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.me();
      return res.data.data as User;
    } catch {
      return rejectWithValue('Not authenticated');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await authAPI.logout().catch(() => {});
    localStorage.removeItem('ll_token');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isGuest = false;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem('ll_token', action.payload);
      state.isGuest = false;
    },
    setGuest(state) {
      state.user = null;
      state.token = null;
      state.isGuest = true;
      localStorage.removeItem('ll_token');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isGuest = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isGuest = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isGuest = true;
      });
  },
});

export const { setUser, setToken, setGuest, clearError } = authSlice.actions;
export default authSlice.reducer;
