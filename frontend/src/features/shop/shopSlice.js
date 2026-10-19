import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = '/api';
const getStoredToken = () => localStorage.getItem('minigame_token');

export const fetchShopItems = createAsyncThunk('shop/fetchShopItems', async () => {
  const res = await fetch(`${API_BASE}/shop/items`);
  const data = await res.json();
  return data.items || [];
});

export const buyItem = createAsyncThunk('shop/buyItem', async ({ itemId, equipNow = true }, { rejectWithValue }) => {
  const token = getStoredToken();
  try {
    const res = await fetch(`${API_BASE}/shop/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ itemId, equipNow })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const shopSlice = createSlice({
  name: 'shop',
  initialState: {
    items: [],
    filter: 'all',
    loading: false
  },
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopItems.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  }
});

export const { setFilter } = shopSlice.actions;
export default shopSlice.reducer;
