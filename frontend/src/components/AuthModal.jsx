import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../features/auth/authSlice';
import { sound } from '../utils/sound';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', showToast }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleQuickDemo = () => {
    setUsername('admin');
    setPassword('123456');
    showToast('Đã điền tài khoản mẫu (admin / 123456)', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'warning');
      return;
    }

    const action = mode === 'login' ? loginUser : registerUser;
    const result = await dispatch(action({ username, password }));

    if (!result.error) {
      sound.win();
      showToast(mode === 'login' ? `Chào mừng ${username}!` : 'Đăng ký thành công! Nhận 100 Xu!', 'success');
      onClose();
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } else {
      sound.gameOver();
      showToast(result.payload || 'Đã có lỗi xảy ra', 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <div className="modal-logo">🎮</div>
          <h3 className="modal-title">Tài Khoản Minigame Hub</h3>
          <p className="modal-desc">Đăng nhập để lưu điểm kỷ lục, nhận Xu thưởng và leo Bảng xếp hạng</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            Đăng Nhập
          </button>
          <button className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
            Đăng Ký
          </button>
        </div>

        {mode === 'login' && (
          <div className="quick-demo-box">
            <button type="button" className="btn btn-outline btn-sm btn-block" onClick={handleQuickDemo}>
              ✨ Điền nhanh tài khoản mẫu (admin / 123456)
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Tên tài khoản:</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên tài khoản"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu:</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Xác nhận mật khẩu:</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản & Nhận 100 Xu')}
          </button>
        </form>
      </div>
    </div>
  );
}
