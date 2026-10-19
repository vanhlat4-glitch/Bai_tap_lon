// Auth & User State Manager
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.userStats = null;
    this.inventory = [];
    this.wheelStatus = null;
    this.listeners = [];
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
    this.updateUI();
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  async checkAuth() {
    const token = api.getToken();
    if (!token) {
      this.currentUser = null;
      this.notify();
      return null;
    }

    try {
      const data = await api.getMe();
      this.currentUser = data.user;
      this.userStats = data.stats;
      this.inventory = data.inventory || [];
      this.wheelStatus = data.wheel || null;
      this.notify();
      return this.currentUser;
    } catch (err) {
      console.warn('Token expired or invalid, logging out:', err.message);
      this.logout();
      return null;
    }
  }

  async login(username, password) {
    const data = await api.login(username, password);
    api.setToken(data.token);
    this.currentUser = data.user;
    await this.checkAuth();
    if (window.sound) window.sound.coin();
    return data;
  }

  async register(username, password) {
    const data = await api.register(username, password);
    api.setToken(data.token);
    this.currentUser = data.user;
    await this.checkAuth();
    if (window.sound) window.sound.win();
    return data;
  }

  logout() {
    api.setToken(null);
    this.currentUser = null;
    this.userStats = null;
    this.inventory = [];
    this.wheelStatus = null;
    this.notify();
    if (window.sound) window.sound.click();
    showToast('Đã đăng xuất tài khoản!', 'info');
  }

  updateCoins(newAmount) {
    if (this.currentUser) {
      const oldAmount = this.currentUser.coins;
      this.currentUser.coins = newAmount;
      this.updateCoinsDisplay(oldAmount, newAmount);
    }
  }

  updateCoinsDisplay(oldVal, newVal) {
    const coinEl = document.getElementById('userCoinsVal');
    if (!coinEl) return;

    if (oldVal !== undefined && newVal > oldVal) {
      coinEl.classList.add('coin-pulse');
      setTimeout(() => coinEl.classList.remove('coin-pulse'), 800);
    }
    coinEl.textContent = Number(newVal).toLocaleString('vi-VN');
  }

  updateUI() {
    const guestNav = document.getElementById('guestNav');
    const userNav = document.getElementById('userNav');
    const userAvatarEl = document.getElementById('userAvatarDisplay');
    const userNameEl = document.getElementById('userNameDisplay');
    const userBadgeEl = document.getElementById('userBadgeDisplay');
    const userCoinsEl = document.getElementById('userCoinsVal');

    const adminNavLink = document.getElementById('adminNavLink');

    if (this.currentUser) {
      if (guestNav) guestNav.classList.add('hidden');
      if (userNav) userNav.classList.remove('hidden');

      if (userAvatarEl) {
        const av = this.currentUser.avatar || '🎮';
        if (av.startsWith('/uploads/') || av.startsWith('http')) {
          userAvatarEl.innerHTML = `<img src="${av}" alt="Avatar" class="avatar-img">`;
        } else {
          userAvatarEl.textContent = av;
        }
      }
      if (userNameEl) userNameEl.textContent = this.currentUser.username;
      if (userBadgeEl) userBadgeEl.textContent = this.currentUser.badge || 'Tân thủ';
      if (userCoinsEl) userCoinsEl.textContent = Number(this.currentUser.coins || 0).toLocaleString('vi-VN');

      // Lesson 6 - Authorization UI: Show admin nav if user is admin
      if (adminNavLink) {
        if (this.currentUser.role === 'admin' || this.currentUser.username.toLowerCase() === 'admin') {
          adminNavLink.classList.remove('hidden');
        } else {
          adminNavLink.classList.add('hidden');
        }
      }
    } else {
      if (guestNav) guestNav.classList.remove('hidden');
      if (userNav) userNav.classList.add('hidden');
      if (adminNavLink) adminNavLink.classList.add('hidden');
    }
  }
}

window.auth = new AuthManager();
