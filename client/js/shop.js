// Shop & Inventory UI Controller
class ShopManager {
  constructor() {
    this.items = [];
    this.currentFilter = 'all';
  }

  async init() {
    await this.loadItems();
    this.setupListeners();
  }

  setupListeners() {
    const filterBtns = document.querySelectorAll('.shop-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.render();
      });
    });
  }

  async loadItems() {
    try {
      const data = await api.getShopItems();
      this.items = data.items || [];
      this.render();
    } catch (err) {
      console.error('Failed to load shop items:', err);
    }
  }

  render() {
    const container = document.getElementById('shopGrid');
    if (!container) return;

    container.innerHTML = '';

    const user = auth.currentUser;
    const ownedItemIds = new Set(auth.inventory.map(i => i.item_id));

    const filtered = this.items.filter(item => {
      if (this.currentFilter === 'all') return true;
      return item.type === this.currentFilter;
    });

    filtered.forEach(item => {
      const isOwned = ownedItemIds.has(item.id);
      const isEquipped = user && (
        (item.type === 'avatar' && user.avatar === item.icon) ||
        (item.type === 'badge' && user.badge === item.name)
      );

      const card = document.createElement('div');
      card.className = `shop-card ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`;

      card.innerHTML = `
        <div class="shop-card-badge">${item.type === 'avatar' ? 'Avatar' : 'Danh hiệu'}</div>
        <div class="shop-card-icon">${item.icon}</div>
        <div class="shop-card-name">${item.name}</div>
        <div class="shop-card-desc">${item.description}</div>
        <div class="shop-card-footer">
          <div class="shop-card-price">
            ${isOwned ? '<span>Đã sở hữu</span>' : `<span class="coin-icon">💰</span> <strong>${item.price}</strong> Xu`}
          </div>
          <div class="shop-card-action">
            ${
              isEquipped 
                ? '<button class="btn btn-secondary btn-sm" disabled>Đang dùng</button>'
                : isOwned 
                  ? `<button class="btn btn-outline btn-sm" onclick="shopManager.equipItem('${item.id}', '${item.type}', '${item.icon}', '${item.name}')">Trang bị</button>`
                  : `<button class="btn btn-primary btn-sm" onclick="shopManager.buyItem('${item.id}')">Mua ngay</button>`
            }
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  async buyItem(itemId) {
    if (!auth.isLoggedIn()) {
      showToast('Vui lòng đăng nhập để mua sắm vật phẩm!', 'warning');
      openAuthModal('login');
      return;
    }

    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    if (auth.currentUser.coins < item.price) {
      showToast(`Bạn không đủ xu để mua "${item.name}"!`, 'error');
      return;
    }

    try {
      const res = await api.buyItem(itemId, true);
      auth.currentUser = res.user;
      auth.inventory = res.inventory;
      auth.updateUI();

      if (window.sound) window.sound.coin();
      showToast(res.message, 'success');
      this.render();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async equipItem(itemId, type, icon, name) {
    try {
      const payload = type === 'avatar' ? { avatar: icon } : { badge: name };
      const res = await api.updateProfile(payload);
      auth.currentUser = res.user;
      auth.updateUI();

      if (window.sound) window.sound.click();
      showToast(`Đã trang bị ${type === 'avatar' ? 'Avatar' : 'Danh hiệu'} mới!`, 'success');
      this.render();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

window.shopManager = new ShopManager();
