import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = '/api';
const getStoredToken = () => localStorage.getItem('minigame_token');

export const fetchLeaderboard = createAsyncThunk('games/fetchLeaderboard', async (game = 'snake') => {
  const res = await fetch(`${API_BASE}/games/leaderboard?game=${game}`);
  const data = await res.json();
  return { game, leaderboard: data.leaderboard || [] };
});

export const fetchMatchHistory = createAsyncThunk('games/fetchMatchHistory', async () => {
  const res = await fetch(`${API_BASE}/games/history`);
  const data = await res.json();
  return data.history || [];
});

export const fetchPlatformStats = createAsyncThunk('games/fetchPlatformStats', async () => {
  const res = await fetch(`${API_BASE}/games/stats`);
  const data = await res.json();
  return data;
});

export const submitGameScore = createAsyncThunk('games/submitGameScore', async ({ game, score, details }) => {
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/games/score`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ game, score, details })
  });
  return await res.json();
});

const gamesSlice = createSlice({
  name: 'games',
  initialState: {
    activeGame: 'caro',
    leaderboardGame: 'snake',
    leaderboard: [],
    history: [],
    stats: null,
    loading: false
  },
  reducers: {
    setActiveGame(state, action) {
      state.activeGame = action.payload;
    },
    setLeaderboardGame(state, action) {
      state.leaderboardGame = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload.leaderboard;
        state.leaderboardGame = action.payload.game;
      })
      .addCase(fetchMatchHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { setActiveGame, setLeaderboardGame } = gamesSlice.actions;
export default gamesSlice.reducer;
