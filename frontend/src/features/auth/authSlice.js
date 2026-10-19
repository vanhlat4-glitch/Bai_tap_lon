import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = '/api';

// Helper to get token
const getStoredToken = () => localStorage.getItem('minigame_token');

export const loginUser = createAsyncThunk('auth/loginUser', async ({ username, password }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
    localStorage.setItem('minigame_token', data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async ({ username, password }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
    localStorage.setItem('minigame_token', data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  } catch (err) {
    localStorage.removeItem('minigame_token');
    return rejectWithValue(err.message);
  }
});

export const uploadAvatar = createAsyncThunk('auth/uploadAvatar', async (formData, { rejectWithValue }) => {
  const token = getStoredToken();
  try {
    const res = await fetch(`${API_BASE}/upload/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi tải ảnh');
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  const token = getStoredToken();
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// Lesson 13 - Redux Toolkit Slice for Authentication
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: getStoredToken(),
    inventory: [],
    stats: null,
    wheelStatus: null,
    loading: false,
    initializing: !!getStoredToken(),
    error: null
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.inventory = [];
      state.stats = null;
      state.wheelStatus = null;
      state.initializing = false;
      localStorage.removeItem('minigame_token');
    },
    updateCoins(state, action) {
      if (state.user) {
        state.user.coins = action.payload;
      }
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.initializing = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initializing = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.initializing = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initializing = false;
      })
      // FetchMe
      .addCase(fetchMe.pending, (state) => {
        if (!state.user && state.token) {
          state.initializing = true;
        }
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.initializing = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.inventory = action.payload.inventory || [];
          state.stats = action.payload.stats || null;
          state.wheelStatus = action.payload.wheel || null;
        } else {
          state.user = null;
        }
      })
      .addCase(fetchMe.rejected, (state) => {
        state.initializing = false;
        state.user = null;
        state.token = null;
      })
      // UploadAvatar
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.avatar = action.payload.user.avatar;
        }
      })
      // UpdateProfile
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.avatar = action.payload.user.avatar;
          state.user.badge = action.payload.user.badge;
        }
      });
  }
});

export const { logout, updateCoins, clearError } = authSlice.actions;
export default authSlice.reducer;
