import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useThemeLang } from '../context/ThemeLanguageContext';
import { sound } from '../utils/sound';

export default function Navbar({ currentView, setView, openAuth, openUpload, showToast }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { theme, toggleTheme, lang, toggleLang, t } = useThemeLang();
  const [soundActive, setSoundActive] = useState(sound.enabled);

  const toggleSound = () => {
    const nextState = sound.toggle();
    setSoundActive(nextState);
    showToast(nextState ? t('nav.soundTurnedOn') : t('nav.soundTurnedOff'), 'info');
  };

  const handleLogout = () => {
    dispatch(logout());
    sound.click();
    showToast(t('nav.loggedOut'), 'info');
    if (currentView === 'admin') setView('home');
  };

  const handleThemeSwitch = () => {
    sound.click();
    toggleTheme();
    showToast(
      theme === 'dark'
        ? (lang === 'vi' ? 'Đã chuyển sang Chế độ Sáng ☀️' : 'Switched to Light Mode ☀️')
        : (lang === 'vi' ? 'Đã chuyển sang Chế độ Tối 🌙' : 'Switched to Dark Mode 🌙'),
      'info'
    );
  };

  const handleLangSwitch = () => {
    sound.click();
    toggleLang();
    showToast(
      lang === 'vi'
        ? 'Switched language to English 🇬🇧'
        : 'Đã đổi ngôn ngữ sang Tiếng Việt 🇻🇳',
      'info'
    );
  };

  const isAdmin = user && (user.role === 'admin' || user.username.toLowerCase() === 'admin');

  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="logo-area" onClick={() => { sound.click(); setView('home'); }}>
          <div className="logo-icon">🎮</div>
          <div className="logo-text">
            <span className="logo-title">{t('nav.brand')}<span className="highlight">{t('nav.brandAccent')}</span></span>
            <span className="logo-subtitle">{t('nav.subtitle')}</span>
          </div>
        </div>

        <nav className="main-nav">
          <button className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={() => { sound.click(); setView('home'); }}>
            🏠 <span className="nav-text">{t('nav.home')}</span>
          </button>
          <button className={`nav-link ${currentView === 'games' ? 'active' : ''}`} onClick={() => { sound.click(); setView('games'); }}>
            🎯 <span className="nav-text">{t('nav.games')}</span>
          </button>
          <button className={`nav-link ${currentView === 'wheel' ? 'active' : ''}`} onClick={() => { sound.click(); setView('wheel'); }}>
            🎡 <span className="nav-text">{t('nav.wheel')}</span>
          </button>
          <button className={`nav-link ${currentView === 'leaderboard' ? 'active' : ''}`} onClick={() => { sound.click(); setView('leaderboard'); }}>
            🏆 <span className="nav-text">{t('nav.leaderboard')}</span>
          </button>
          <button className={`nav-link ${currentView === 'shop' ? 'active' : ''}`} onClick={() => { sound.click(); setView('shop'); }}>
            🛒 <span className="nav-text">{t('nav.shop')}</span>
          </button>
          <button
            className={`nav-link ${currentView === 'admin' ? 'active' : ''} ${!isAdmin ? 'nav-link-locked' : ''}`}
            onClick={() => {
              sound.click();
              if (!isAdmin) {
                showToast(t('nav.adminWarning'), 'warning');
                openAuth('login');
              } else {
                setView('admin');
              }
            }}
            title={isAdmin ? "Trang quản trị hệ thống" : "Đăng nhập admin để mở khóa"}
          >
            ⚙️ <span className="nav-text">{t('nav.admin')}</span>
            {!isAdmin && <span className="lock-pill">{t('nav.locked')}</span>}
          </button>
        </nav>

        <div className="header-actions">
          {/* Language Switcher */}
          <button
            className="btn btn-icon lang-toggle-btn"
            onClick={handleLangSwitch}
            title={t('nav.langSwitch')}
          >
            <span className="lang-flag">{lang === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
            <span className="lang-code">{lang.toUpperCase()}</span>
          </button>

          {/* Theme Switcher (Dark / Light) */}
          <button
            className="btn btn-icon theme-toggle-btn"
            onClick={handleThemeSwitch}
            title={theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Sound Toggle */}
          <button className="btn btn-icon sound-btn" onClick={toggleSound} title="Bật/Tắt âm thanh">
            {soundActive ? '🔊' : '🔇'} <span className="nav-text">{soundActive ? t('nav.soundOn') : t('nav.soundOff')}</span>
          </button>

          {!user ? (
            <div className="auth-buttons">
              <button
                className="btn btn-demo-quick btn-sm"
                onClick={() => {
                  sound.click();
                  openAuth('login');
                }}
                title="Đăng nhập nhanh tài khoản mẫu chấm điểm: admin / 123456"
              >
                {t('nav.demoAdmin')}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => openAuth('login')}>{t('nav.login')}</button>
              <button className="btn btn-primary btn-sm" onClick={() => openAuth('register')}>{t('nav.register')}</button>
            </div>
          ) : (
            <div className="user-pill">
              <div className="user-coin-badge">
                <span className="coin-icon">💰</span>
                <span className="coin-val">{Number(user.coins || 0).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
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
                  <span className="user-badge">{user.badge || (lang === 'vi' ? 'Tân thủ' : 'Novice')}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={openUpload} title={t('nav.uploadAvatar')}>📷</button>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title={t('nav.logout')}>🚪</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
