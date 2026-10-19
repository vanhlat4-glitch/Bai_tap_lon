// API Client Module
const API_BASE = '/api';

const api = {
  getToken() {
    return localStorage.getItem('minigame_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('minigame_token', token);
    } else {
      localStorage.removeItem('minigame_token');
    }
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Lỗi máy chủ (${response.status})`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // Auth Endpoints
  async register(username, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async getMe() {
    return this.request('/auth/me');
  },

  async updateProfile(updates) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Game Endpoints
  async submitScore(game, score, details) {
    return this.request('/games/score', {
      method: 'POST',
      body: JSON.stringify({ game, score, details })
    });
  },

  async getLeaderboard(game = 'all') {
    return this.request(`/games/leaderboard?game=${encodeURIComponent(game)}`);
  },

  async getMatchHistory() {
    return this.request('/games/history');
  },

  async getStats() {
    return this.request('/games/stats');
  },

  // Shop Endpoints
  async getShopItems() {
    return this.request('/shop/items');
  },

  async buyItem(itemId, equipNow = false) {
    return this.request('/shop/buy', {
      method: 'POST',
      body: JSON.stringify({ itemId, equipNow })
    });
  },

  // Wheel Endpoints
  async getWheelConfig() {
    return this.request('/wheel/config');
  },

  async spinWheel() {
    return this.request('/wheel/spin', {
      method: 'POST'
    });
  },

  // Upload File (Lesson 10 - Multer)
  async uploadAvatar(formData) {
    const url = `${API_BASE}/upload/avatar`;
    const headers = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData // Browser sets multipart/form-data boundary automatically
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Lỗi khi tải ảnh lên máy chủ!');
    }
    return data;
  },

  // Admin User Management (Lesson 6 & 11)
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users?${query}`);
  },

  async updateUser(id, updates) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};

window.api = api;
