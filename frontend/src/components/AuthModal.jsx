import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../features/auth/authSlice';
import { useThemeLang } from '../context/ThemeLanguageContext';
import { sound } from '../utils/sound';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', showToast }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const { lang, t } = useThemeLang();

  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleQuickDemo = () => {
    setUsername('admin');
    setPassword('123456');
    showToast(lang === 'vi' ? 'Đã điền tài khoản mẫu (admin / 123456)' : 'Filled demo credentials (admin / 123456)', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      showToast(lang === 'vi' ? 'Mật khẩu xác nhận không khớp!' : 'Passwords do not match!', 'warning');
      return;
    }

    const action = mode === 'login' ? loginUser : registerUser;
    const result = await dispatch(action({ username, password }));

    if (!result.error) {
      sound.win();
      showToast(
        mode === 'login'
          ? (lang === 'vi' ? `Chào mừng ${username} trở lại!` : `Welcome back ${username}!`)
          : (lang === 'vi' ? 'Đăng ký thành công! Nhận 100 Xu!' : 'Registered successfully! Received 100 Coins!'),
        'success'
      );
      onClose();
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } else {
      sound.gameOver();
      showToast(result.payload || (lang === 'vi' ? 'Đã có lỗi xảy ra' : 'An error occurred'), 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <div className="modal-logo">🎮</div>
          <h3 className="modal-title">{lang === 'vi' ? 'Tài Khoản Minigame Hub' : 'Cyber Minigame Hub Account'}</h3>
          <p className="modal-desc">
            {lang === 'vi'
              ? 'Đăng nhập để lưu điểm kỷ lục, nhận Xu thưởng và leo Bảng xếp hạng'
              : 'Sign in to record high scores, earn Coins and climb the Leaderboard'}
          </p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            {t('authModal.tabLogin')}
          </button>
          <button className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
            {t('authModal.tabRegister')}
          </button>
        </div>

        {mode === 'login' && (
          <div className="quick-demo-box">
            <button type="button" className="btn btn-outline btn-sm btn-block" onClick={handleQuickDemo}>
              {t('authModal.quickFillAdmin')}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('authModal.usernameLabel')}:</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('authModal.usernamePlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('authModal.passwordLabel')}:</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('authModal.passwordPlaceholder')}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>{t('authModal.confirmPassLabel')}:</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('authModal.confirmPassPlaceholder')}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading
              ? (lang === 'vi' ? 'Đang xử lý...' : 'Processing...')
              : (mode === 'login' ? t('authModal.submitLogin') : t('authModal.submitRegister'))}
          </button>
        </form>
      </div>
    </div>
  );
}
