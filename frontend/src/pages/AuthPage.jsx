import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../features/auth/authSlice';
import { sound } from '../utils/sound';

export default function AuthPage({ showToast }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleQuickDemo = () => {
    setUsername('admin');
    setPassword('123456');
    sound.click();
    showToast('Đã điền tài khoản mẫu (admin / 123456)', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      showToast('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!', 'warning');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        showToast('Mật khẩu xác nhận không khớp!', 'warning');
        return;
      }
      if (password.length < 6) {
        showToast('Mật khẩu cần tối thiểu 6 ký tự!', 'warning');
        return;
      }
    }

    const action = mode === 'login' ? loginUser : registerUser;
    const result = await dispatch(action({ username: username.trim(), password }));

    if (!result.error) {
      sound.win();
      showToast(
        mode === 'login'
          ? `Xin chào ${username}! Đăng nhập thành công.`
          : 'Tạo tài khoản thành công! Bạn nhận được 100 Xu tân thủ.',
        'success'
      );
    } else {
      sound.gameOver();
      showToast(result.payload || 'Đăng nhập không thành công', 'error');
    }
  };

  return (
    <div className="auth-page-container">
      {/* Brand Hero Showcase */}
      <div className="auth-page-hero">
        <div className="auth-brand-logo">
          <span className="logo-pulse-icon">🎮</span>
        </div>
        <h1 className="auth-brand-title">
          CYBER <span className="highlight-text">MINIGAME</span> HUB
        </h1>
        <p className="auth-brand-subtitle">
          Cổng giải trí minigame trực tuyến đa nền tảng. Vui lòng đăng nhập hoặc đăng ký tài khoản để bắt đầu trải nghiệm!
        </p>

        {/* Feature Badges Grid */}
        <div className="auth-features-grid">
          <div className="auth-feature-card">
            <span className="feature-icon">♟️</span>
            <div className="feature-info">
              <h4>Cờ Caro & Snake & 2048</h4>
              <p>Minigame đối kháng và thử thách trí tuệ đồ họa Neon</p>
            </div>
          </div>

          <div className="auth-feature-card">
            <span className="feature-icon">🎡</span>
            <div className="feature-info">
              <h4>Vòng Quay May Mắn</h4>
              <p>Quay thưởng mỗi ngày nhận hàng trăm Xu miễn phí</p>
            </div>
          </div>

          <div className="auth-feature-card">
            <span className="feature-icon">🛒</span>
            <div className="feature-info">
              <h4>Shop & Đổi Avatar VIP</h4>
              <p>Tùy biến huy hiệu, danh hiệu và giao diện độc quyền</p>
            </div>
          </div>

          <div className="auth-feature-card">
            <span className="feature-icon">🏆</span>
            <div className="feature-info">
              <h4>Bảng Xếp Hạng</h4>
              <p>Lưu điểm kỷ lục và tranh tài bảng vàng vinh danh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Card Box */}
      <div className="auth-page-card">
        <div className="auth-card-header">
          <div className="auth-mode-tabs">
            <button
              type="button"
              className={`auth-mode-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { sound.click(); setMode('login'); }}
            >
              🔑 Đăng Nhập
            </button>
            <button
              type="button"
              className={`auth-mode-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { sound.click(); setMode('register'); }}
            >
              📝 Đăng Ký Mới
            </button>
          </div>
        </div>

        {mode === 'login' ? (
          <div className="auth-quick-hint">
            <button
              type="button"
              className="btn btn-outline btn-sm btn-block"
              onClick={handleQuickDemo}
            >
              ✨ Điền nhanh tài khoản mẫu (admin / 123456)
            </button>
          </div>
        ) : (
          <div className="auth-bonus-badge">
            🎁 <strong>Quà tân thủ:</strong> Nhận ngay <strong>100 Xu</strong> và danh hiệu Tân Thủ khi đăng ký!
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="auth-field-group">
            <label className="auth-field-label">Tên tài khoản</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">👤</span>
              <input
                type="text"
                className="auth-text-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: player1, dragon..."
                required
                autoFocus
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-field-label">Mật khẩu</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                type="password"
                className="auth-text-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="auth-field-group">
              <label className="auth-field-label">Xác nhận mật khẩu</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🛡️</span>
                <input
                  type="password"
                  className="auth-text-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu vừa nhập"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="auth-error-banner">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span>⏳ Đang xử lý...</span>
            ) : mode === 'login' ? (
              <span>Đăng Nhập & Vào Chơi 🚀</span>
            ) : (
              <span>Tạo Tài Khoản & Nhận Quà 🎁</span>
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          {mode === 'login' ? (
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                className="link-switch-btn"
                onClick={() => { sound.click(); setMode('register'); }}
              >
                Đăng ký ngay (Miễn phí)
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                className="link-switch-btn"
                onClick={() => { sound.click(); setMode('login'); }}
              >
                Quay lại Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
