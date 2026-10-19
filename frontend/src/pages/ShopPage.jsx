import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchShopItems, buyItem, setFilter } from '../features/shop/shopSlice';
import { updateProfile } from '../features/auth/authSlice';
import { sound } from '../utils/sound';

export default function ShopPage({ showToast, openAuth }) {
  const dispatch = useDispatch();
  const { items, filter } = useSelector(state => state.shop);
  const { user, inventory } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchShopItems());
  }, [dispatch]);

  const ownedItemIds = new Set(inventory.map(i => i.item_id));

  const handleBuy = async (item) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để mua vật phẩm!', 'warning');
      openAuth('login');
      return;
    }
    if (user.coins < item.price) {
      showToast(`Không đủ Xu! Bạn còn thiếu ${item.price - user.coins} Xu.`, 'error');
      return;
    }

    const result = await dispatch(buyItem({ itemId: item.id, equipNow: true }));
    if (!result.error) {
      sound.coin();
      showToast(`🎉 Mua thành công "${item.name}"!`, 'success');
    } else {
      showToast(result.payload || 'Giao dịch thất bại', 'error');
    }
  };

  const handleEquip = async (item) => {
    const payload = item.type === 'avatar' ? { avatar: item.icon } : { badge: item.name };
    const result = await dispatch(updateProfile(payload));
    if (!result.error) {
      sound.click();
      showToast(`Đã trang bị ${item.type === 'avatar' ? 'Avatar' : 'Danh hiệu'} mới!`, 'success');
    }
  };

  const filteredItems = items.filter(i => {
    if (filter === 'all') return true;
    return i.type === filter;
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">🛒 Cửa Hàng Vật Phẩm & Danh Hiệu</h2>
          <p className="section-subtitle">Dùng số Xu bạn tích lũy được từ minigame để sở hữu avatar hiếm và danh hiệu danh giá</p>
        </div>

        <div className="shop-filter-bar">
          <button className={`shop-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => dispatch(setFilter('all'))}>
            Tất cả
          </button>
          <button className={`shop-filter-btn ${filter === 'avatar' ? 'active' : ''}`} onClick={() => dispatch(setFilter('avatar'))}>
            🎭 Avatar Độc Quyền
          </button>
          <button className={`shop-filter-btn ${filter === 'badge' ? 'active' : ''}`} onClick={() => dispatch(setFilter('badge'))}>
            🎖️ Danh Hiệu Quý Hiếm
          </button>
        </div>
      </div>

      <div className="shop-cards-grid">
        {filteredItems.map(item => {
          const isOwned = ownedItemIds.has(item.id);
          const isEquipped = user && (
            (item.type === 'avatar' && user.avatar === item.icon) ||
            (item.type === 'badge' && user.badge === item.name)
          );

          return (
            <div key={item.id} className={`shop-card ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`}>
              <div className="shop-card-badge">{item.type === 'avatar' ? 'Avatar' : 'Danh hiệu'}</div>
              <div className="shop-card-icon">{item.icon}</div>
              <div className="shop-card-name">{item.name}</div>
              <div className="shop-card-desc">{item.description}</div>
              <div className="shop-card-footer">
                <div className="shop-card-price">
                  {isOwned ? <span>Đã sở hữu</span> : <>💰 <strong>{item.price}</strong> Xu</>}
                </div>
                <div className="shop-card-action">
                  {isEquipped ? (
                    <button className="btn btn-secondary btn-sm" disabled>Đang dùng</button>
                  ) : isOwned ? (
                    <button className="btn btn-outline btn-sm" onClick={() => handleEquip(item)}>Trang bị</button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleBuy(item)}>Mua ngay</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
