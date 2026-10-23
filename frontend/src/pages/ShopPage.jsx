import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchShopItems, buyItem, setFilter } from '../features/shop/shopSlice';
import { updateProfile } from '../features/auth/authSlice';
import { useThemeLang } from '../context/ThemeLanguageContext';
import { sound } from '../utils/sound';

export default function ShopPage({ showToast, openAuth }) {
  const dispatch = useDispatch();
  const { items, filter } = useSelector(state => state.shop);
  const { user, inventory } = useSelector(state => state.auth);
  const { lang, t } = useThemeLang();

  useEffect(() => {
    dispatch(fetchShopItems());
  }, [dispatch]);

  const ownedItemIds = new Set(inventory.map(i => i.item_id));

  const handleBuy = async (item) => {
    if (!user) {
      showToast(lang === 'vi' ? 'Vui lòng đăng nhập để mua vật phẩm!' : 'Please sign in to buy items!', 'warning');
      openAuth('login');
      return;
    }
    if (user.coins < item.price) {
      showToast(
        lang === 'vi'
          ? `Không đủ Xu! Bạn còn thiếu ${item.price - user.coins} Xu.`
          : `Not enough Coins! You need ${item.price - user.coins} more Coins.`,
        'error'
      );
      return;
    }

    const result = await dispatch(buyItem({ itemId: item.id, equipNow: true }));
    if (!result.error) {
      sound.coin();
      showToast(
        lang === 'vi' ? `🎉 Mua thành công "${item.name}"!` : `🎉 Successfully purchased "${item.name}"!`,
        'success'
      );
    } else {
      showToast(result.payload || (lang === 'vi' ? 'Giao dịch thất bại' : 'Transaction failed'), 'error');
    }
  };

  const handleEquip = async (item) => {
    const payload = item.type === 'avatar' ? { avatar: item.icon } : { badge: item.name };
    const result = await dispatch(updateProfile(payload));
    if (!result.error) {
      sound.click();
      showToast(
        lang === 'vi'
          ? `Đã trang bị ${item.type === 'avatar' ? 'Avatar' : 'Danh hiệu'} mới!`
          : `Equipped new ${item.type === 'avatar' ? 'Avatar' : 'Badge'}!`,
        'success'
      );
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
          <h2 className="section-title">🛒 {t('shop.title')}</h2>
          <p className="section-subtitle">{t('shop.subtitle')}</p>
        </div>

        <div className="shop-filter-bar">
          <button className={`shop-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => dispatch(setFilter('all'))}>
            {t('shop.tabAll')}
          </button>
          <button className={`shop-filter-btn ${filter === 'avatar' ? 'active' : ''}`} onClick={() => dispatch(setFilter('avatar'))}>
            🎭 {t('shop.tabAvatars')}
          </button>
          <button className={`shop-filter-btn ${filter === 'badge' ? 'active' : ''}`} onClick={() => dispatch(setFilter('badge'))}>
            🎖️ {t('shop.tabBadges')}
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
              <div className="shop-card-badge">{item.type === 'avatar' ? (lang === 'vi' ? 'Avatar' : 'Avatar') : (lang === 'vi' ? 'Danh hiệu' : 'Badge')}</div>
              <div className="shop-card-icon">{item.icon}</div>
              <div className="shop-card-name">{item.name}</div>
              <div className="shop-card-desc">{item.description}</div>
              <div className="shop-card-footer">
                <div className="shop-card-price">
                  {isOwned ? (
                    <span>{t('shop.btnOwned')}</span>
                  ) : (
                    <>💰 <strong>{item.price}</strong> {lang === 'vi' ? 'Xu' : 'Coins'}</>
                  )}
                </div>
                <div className="shop-card-action">
                  {isEquipped ? (
                    <button className="btn btn-secondary btn-sm" disabled>{t('shop.btnEquipped')}</button>
                  ) : isOwned ? (
                    <button className="btn btn-outline btn-sm" onClick={() => handleEquip(item)}>{t('shop.btnEquip')}</button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleBuy(item)}>{t('shop.btnBuy')}</button>
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
