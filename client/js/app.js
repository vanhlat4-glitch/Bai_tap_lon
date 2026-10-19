// Main App Initializer & UI Routing
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Sound button
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    const updateSoundIcon = () => {
      soundToggleBtn.innerHTML = window.sound.enabled ? '🔊 <span class="nav-text">Âm thanh</span>' : '🔇 <span class="nav-text">Tắt tiếng</span>';
    };
    updateSoundIcon();
    soundToggleBtn.onclick = () => {
      window.sound.toggle();
      updateSoundIcon();
      showToast(window.sound.enabled ? 'Đã bật âm thanh' : 'Đã tắt âm thanh', 'info');
    };
  }

  // Setup Navigation & Modals
  setupNavigation();
  setupAuthModals();
  setupUploadModal();

  // Admin Toolbar listeners (Lesson 11)
  const adminSearch = document.getElementById('adminUserSearch');
  if (adminSearch) {
    adminSearch.addEventListener('input', () => {
      clearTimeout(adminSearchTimer);
      adminSearchTimer = setTimeout(() => loadAdminUsers(1), 350);
    });
  }
  const adminRefreshBtn = document.getElementById('adminRefreshBtn');
  if (adminRefreshBtn) adminRefreshBtn.onclick = () => loadAdminUsers(currentAdminPage);
  const adminPrev = document.getElementById('adminPrevPageBtn');
  if (adminPrev) adminPrev.onclick = () => loadAdminUsers(currentAdminPage - 1);
  const adminNext = document.getElementById('adminNextPageBtn');
  if (adminNext) adminNext.onclick = () => loadAdminUsers(currentAdminPage + 1);

  // Check login state
  await auth.checkAuth();
  if (!auth.isLoggedIn()) {
    openAuthModal('login');
  }

  // Initialize Submodules
  if (window.caroGame) window.caroGame.init();
  if (window.snakeGame) window.snakeGame.init();
  if (window.game2048) window.game2048.init();
  if (window.luckyWheel) window.luckyWheel.init();
  if (window.shopManager) window.shopManager.init();
  if (window.leaderboardManager) window.leaderboardManager.init();

  // Load Hero Stats
  loadPlatformStats();
});

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '✨'}</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// Navigation between main views
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link[data-target]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.target;
      switchView(targetId);
    });
  });

  // Inner game tab switcher (Caro, Snake, 2048, Wheel)
  const gameTabs = document.querySelectorAll('.game-tab-btn');
  gameTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      gameTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const game = tab.dataset.game;
      document.querySelectorAll('.game-arena').forEach(arena => arena.classList.add('hidden'));

      const targetArena = document.getElementById(`arena-${game}`);
      if (targetArena) targetArena.classList.remove('hidden');

      if (window.sound) window.sound.click();

      // Trigger specific game canvas refresh if needed
      if (game === 'snake' && window.snakeGame) window.snakeGame.draw();
      if (game === 'wheel' && window.luckyWheel) window.luckyWheel.drawWheel();
    });
  });
}

function switchView(viewId) {
  if (!auth.isLoggedIn()) {
    showToast('Vui lòng đăng nhập trước khi chơi!', 'warning');
    openAuthModal('login');
    return;
  }

  document.querySelectorAll('.app-view').forEach(view => view.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) targetView.classList.remove('hidden');

  const activeNav = document.querySelector(`.nav-link[data-target="${viewId}"]`);
  if (activeNav) activeNav.classList.add('active');

  if (window.sound) window.sound.click();

  // View specific refresh
  if (viewId === 'leaderboard' && window.leaderboardManager) {
    window.leaderboardManager.loadLeaderboard(window.leaderboardManager.currentGame);
  } else if (viewId === 'shop' && window.shopManager) {
    window.shopManager.render();
  } else if (viewId === 'wheel' && window.luckyWheel) {
    window.luckyWheel.updateStatus();
    window.luckyWheel.drawWheel();
  } else if (viewId === 'admin') {
    loadAdminUsers();
  }
}

// Authentication Modal Setup
function setupAuthModals() {
  const modal = document.getElementById('authModal');
  const openLoginBtn = document.getElementById('openLoginBtn');
  const openRegisterBtn = document.getElementById('openRegisterBtn');
  const closeBtn = document.getElementById('closeAuthModal');
  const switchTabs = document.querySelectorAll('.auth-tab-btn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const logoutBtn = document.getElementById('logoutBtn');

  if (openLoginBtn) openLoginBtn.onclick = () => openAuthModal('login');
  if (openRegisterBtn) openRegisterBtn.onclick = () => openAuthModal('register');
  if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');

  // Quick fill sample account button
  const quickDemoBtn = document.getElementById('quickDemoLoginBtn');
  if (quickDemoBtn) {
    quickDemoBtn.onclick = async () => {
      document.getElementById('loginUsername').value = 'admin';
      document.getElementById('loginPassword').value = '123456';
      showToast('Đã điền tài khoản mẫu (admin / 123456)', 'info');
    };
  }

  // Switch tabs in modal
  switchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.mode;
      if (mode === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
      }
    });
  });

  // Login Submit
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const u = document.getElementById('loginUsername').value;
      const p = document.getElementById('loginPassword').value;
      try {
        await auth.login(u, p);
        modal.classList.add('hidden');
        loginForm.reset();
        showToast(`Chào mừng trở lại, ${u}!`, 'success');
        if (window.shopManager) window.shopManager.render();
        if (window.leaderboardManager) window.leaderboardManager.loadLeaderboard(window.leaderboardManager.currentGame);
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }

  // Register Submit
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      const u = document.getElementById('regUsername').value;
      const p = document.getElementById('regPassword').value;
      const cp = document.getElementById('regConfirmPassword').value;

      if (p !== cp) {
        showToast('Mật khẩu nhập lại không khớp!', 'warning');
        return;
      }

      try {
        await auth.register(u, p);
        modal.classList.add('hidden');
        registerForm.reset();
        showToast(`Đăng ký thành công! Nhận ngay 100 Xu!`, 'success');
        if (window.shopManager) window.shopManager.render();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      auth.logout();
      if (window.shopManager) window.shopManager.render();
      if (window.leaderboardManager) window.leaderboardManager.loadLeaderboard(window.leaderboardManager.currentGame);
    };
  }

  // Close reward modal
  const closeRewardBtn = document.getElementById('closeRewardModalBtn');
  if (closeRewardBtn) {
    closeRewardBtn.onclick = () => {
      document.getElementById('rewardModal').classList.add('hidden');
    };
  }
}

function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabs = document.querySelectorAll('.auth-tab-btn');

  tabs.forEach(t => {
    if (t.dataset.mode === mode) t.classList.add('active');
    else t.classList.remove('active');
  });

  if (mode === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  }

  modal.classList.remove('hidden');
}

// Confetti burst on victories and rewards
function createConfetti() {
  const count = 60;
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-particle';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    confetti.style.animationDelay = (Math.random() * 0.5) + 's';
    confetti.style.opacity = Math.random() + 0.5;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 4000);
  }
}

// Stats counter for the home screen
async function loadPlatformStats() {
  try {
    const stats = await api.getStats();
    const statUsers = document.getElementById('statTotalUsers');
    const statMatches = document.getElementById('statTotalMatches');
    const statSnake = document.getElementById('statBestSnake');
    const stat2048 = document.getElementById('statBest2048');

    if (statUsers) statUsers.textContent = (stats.totalUsers || 0).toLocaleString('vi-VN');
    if (statMatches) statMatches.textContent = (stats.totalMatches || 0).toLocaleString('vi-VN');
    if (statSnake) statSnake.textContent = (stats.records?.snake || 0).toLocaleString('vi-VN');
    if (stat2048) stat2048.textContent = (stats.records?.game2048 || 0).toLocaleString('vi-VN');
  } catch (e) {
    console.warn('Could not load stats:', e);
  }
}

// ==========================================================================
// Lesson 10 - File Upload Setup (Multer)
// ==========================================================================
function setupUploadModal() {
  const modal = document.getElementById('uploadModal');
  const openBtn = document.getElementById('openUploadBtn');
  const closeBtn = document.getElementById('closeUploadModal');
  const form = document.getElementById('avatarUploadForm');
  const fileInput = document.getElementById('avatarFileInput');
  const previewContainer = document.getElementById('avatarPreviewContainer');
  const previewImg = document.getElementById('avatarPreviewImg');

  if (openBtn) {
    openBtn.onclick = () => {
      if (!auth.isLoggedIn()) {
        showToast('Vui lòng đăng nhập trước khi tải ảnh!', 'warning');
        openAuthModal('login');
        return;
      }
      modal.classList.remove('hidden');
    };
  }

  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.add('hidden');
  }

  // File preview
  if (fileInput) {
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          previewImg.src = event.target.result;
          previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      } else {
        previewContainer.classList.add('hidden');
      }
    };
  }

  // Upload Submit (Lesson 10)
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const file = fileInput.files[0];
      if (!file) {
        showToast('Vui lòng chọn file ảnh!', 'warning');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const res = await api.uploadAvatar(formData);
        showToast(res.message, 'success');
        auth.currentUser = res.user;
        auth.updateUI();
        modal.classList.add('hidden');
        form.reset();
        previewContainer.classList.add('hidden');
        if (window.sound) window.sound.win();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }
}

// ==========================================================================
// Lesson 6 & 11 - Admin User Management (Pagination, Search, CRUD)
// ==========================================================================
let currentAdminPage = 1;
let adminSearchTimer = null;

async function loadAdminUsers(page = 1) {
  const tbody = document.getElementById('adminUserTableBody');
  const infoEl = document.getElementById('adminPaginationInfo');
  const prevBtn = document.getElementById('adminPrevPageBtn');
  const nextBtn = document.getElementById('adminNextPageBtn');
  const searchInput = document.getElementById('adminUserSearch');

  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Đang tải danh sách người chơi...</td></tr>';

  try {
    const search = searchInput ? searchInput.value.trim() : '';
    const res = await api.getUsers({ page, limit: 8, search });
    const { users, pagination } = res;

    currentAdminPage = pagination.page;

    if (infoEl) {
      infoEl.textContent = `Trang ${pagination.page} / ${pagination.totalPages || 1} (Tổng: ${pagination.total} người chơi)`;
    }
    if (prevBtn) prevBtn.disabled = pagination.page <= 1;
    if (nextBtn) nextBtn.disabled = pagination.page >= pagination.totalPages;

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Không tìm thấy người dùng nào!</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => {
      const isImg = u.avatar && (u.avatar.startsWith('/uploads/') || u.avatar.startsWith('http'));
      const avatarHtml = isImg ? `<img src="${u.avatar}" class="avatar-img" />` : u.avatar;
      const role = u.username.toLowerCase() === 'admin' ? 'admin' : (u.role || 'user');
      const timeStr = new Date(u.created_at).toLocaleDateString('vi-VN');

      return `
        <tr>
          <td>#${u.id}</td>
          <td>
            <div class="player-cell">
              <span class="player-avatar">${avatarHtml}</span>
              <span class="player-name">${u.username}</span>
            </div>
          </td>
          <td><span class="badge-pill" style="${role === 'admin' ? 'background: #dc2626; color: #fff;' : ''}">${role.toUpperCase()}</span></td>
          <td style="font-weight: 700; color: #fbbf24;">${Number(u.coins).toLocaleString('vi-VN')} 💰</td>
          <td><span class="badge-pill">${u.badge || 'Tân thủ'}</span></td>
          <td>${timeStr}</td>
          <td style="text-align: right;">
            <button class="btn btn-outline btn-sm" onclick="editUserCoins(${u.id}, ${u.coins})" title="Cộng/Trừ Xu">💰</button>
            <button class="btn btn-secondary btn-sm" onclick="deleteUser(${u.id}, '${u.username}')" title="Xóa tài khoản">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: #ef4444; text-align: center; padding: 2rem;">Lỗi tải dữ liệu: ${err.message}</td></tr>`;
  }
}

async function editUserCoins(id, currentCoins) {
  const input = prompt(`Nhập số Xu mới cho người chơi #${id}:`, currentCoins);
  if (input === null) return;
  const newCoins = parseInt(input, 10);
  if (isNaN(newCoins) || newCoins < 0) {
    showToast('Số xu không hợp lệ!', 'error');
    return;
  }
  try {
    await api.updateUser(id, { coins: newCoins });
    showToast(`Đã cập nhật số Xu thành công cho #${id}!`, 'success');
    loadAdminUsers(currentAdminPage);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteUser(id, username) {
  if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}" (#${id}) không?`)) return;
  try {
    const res = await api.deleteUser(id);
    showToast(res.message, 'success');
    loadAdminUsers(currentAdminPage);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Expose globals for inline events
window.editUserCoins = editUserCoins;
window.deleteUser = deleteUser;

// Expose globals
window.showToast = showToast;
window.openAuthModal = openAuthModal;
window.switchView = switchView;
window.createConfetti = createConfetti;
