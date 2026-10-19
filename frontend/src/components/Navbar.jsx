import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { sound } from '../utils/sound';

export default function Navbar({ currentView, setView, openAuth, openUpload, showToast }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [soundActive, setSoundActive] = useState(sound.enabled);

  const toggleSound = () => {
    const nextState = sound.toggle();
    setSoundActive(nextState);
    showToast(nextState ? 'Đã bật âm thanh' : 'Đã tắt âm thanh', 'info');
  };

  const handleLogout = () => {
    dispatch(logout());
    sound.click();
    showToast('Đã đăng xuất tài khoản!', 'info');
    if (currentView === 'admin') setView('home');
  };

  const isAdmin = user && (user.role === 'admin' || user.username.toLowerCase() === 'admin');

  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="logo-area" onClick={() => { sound.click(); setView('home'); }}>
          <div className="logo-icon">🎮</div>
          <div className="logo-text">
            <span className="logo-title">CYBER<span className="highlight">GAMES</span></span>
            <span className="logo-subtitle">REACT + REDUX HUB</span>
          </div>
        </div>

        <nav className="main-nav">
          <button className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={() => { sound.click(); setView('home'); }}>
            🏠 <span className="nav-text">Trang chủ</span>
          </button>
          <button className={`nav-link ${currentView === 'games' ? 'active' : ''}`} onClick={() => { sound.click(); setView('games'); }}>
            🎯 <span className="nav-text">Trò chơi</span>
          </button>
          <button className={`nav-link ${currentView === 'wheel' ? 'active' : ''}`} onClick={() => { sound.click(); setView('wheel'); }}>
            🎡 <span className="nav-text">Vòng quay</span>
          </button>
          <button className={`nav-link ${currentView === 'leaderboard' ? 'active' : ''}`} onClick={() => { sound.click(); setView('leaderboard'); }}>
            🏆 <span className="nav-text">Xếp hạng</span>
          </button>
          <button className={`nav-link ${currentView === 'shop' ? 'active' : ''}`} onClick={() => { sound.click(); setView('shop'); }}>
            🛒 <span className="nav-text">Cửa hàng</span>
          </button>
          {isAdmin && (
            <button className={`nav-link ${currentView === 'admin' ? 'active' : ''}`} onClick={() => { sound.click(); setView('admin'); }}>
              ⚙️ <span className="nav-text">Quản trị</span>
            </button>
          )}
        </nav>

        <div className="header-actions">
          <button className="btn btn-icon" onClick={toggleSound} title="Bật/Tắt âm thanh">
            {soundActive ? '🔊' : '🔇'} <span className="nav-text">{soundActive ? 'Âm thanh' : 'Tắt tiếng'}</span>
          </button>

          {!user ? (
            <div className="auth-buttons">
              <button className="btn btn-outline btn-sm" onClick={() => openAuth('login')}>Đăng nhập</button>
              <button className="btn btn-primary btn-sm" onClick={() => openAuth('register')}>Đăng ký</button>
            </div>
          ) : (
            <div className="user-pill">
              <div className="user-coin-badge">
                <span className="coin-icon">💰</span>
                <span className="coin-val">{Number(user.coins || 0).toLocaleString('vi-VN')}</span>
              </div>
              <div className="user-info-badge">
                <span className="user-avatar-icon">
                  {user.avatar?.startsWith('/uploads/') || user.avatar?.startsWith('http') ? (
                    <img src={user.avatar} alt="Avatar" className="avatar-img" />
                  ) : (
                    user.avatar || '🎮'
                  )}
                </span>
                <div className="user-text-info">
                  <span className="user-name">{user.username}</span>
                  <span className="user-badge">{user.badge || 'Tân thủ'}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={openUpload} title="Tải ảnh đại diện (Lesson 10)">📷</button>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Đăng xuất">🚪</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
