import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser, registerUser, fetchMe } from '../features/auth/authSlice';
import { sound } from '../utils/sound';

export default function AuthPage({ showToast, setView }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const [mode, setMode] = useState('login'); // 'login' | 'register'

  const validationSchema = useMemo(() => {
    const schema = {
      username: Yup.string()
        .trim()
        .min(3, 'Tên tài khoản cần từ 3 đến 20 ký tự!')
        .max(20, 'Tên tài khoản cần từ 3 đến 20 ký tự!')
        .required('Vui lòng nhập tên tài khoản!'),
      password: Yup.string()
        .min(6, 'Mật khẩu cần tối thiểu 6 ký tự!')
        .required('Vui lòng nhập mật khẩu!')
    };
    if (mode === 'register') {
      schema.confirmPassword = Yup.string()
        .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp!')
        .required('Vui lòng nhập lại mật khẩu xác nhận!');
    }
    return Yup.object(schema);
  }, [mode]);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const cleanUser = values.username.trim();
      const action = mode === 'login' ? loginUser : registerUser;
      const result = await dispatch(action({ username: cleanUser, password: values.password }));

      if (!result.error) {
        dispatch(fetchMe());
        sound.win();
        showToast(
          mode === 'login'
            ? `Xin chào ${cleanUser}! Đăng nhập thành công.`
            : 'Tạo tài khoản thành công! Bạn nhận được 100 Xu tân thủ.',
          'success'
        );
        resetForm();
        if (setView) setView('games');
      } else {
        sound.gameOver();
        showToast(result.payload || 'Đăng nhập không thành công', 'error');
      }
    }
  });

  const handleQuickDemo = () => {
    formik.setValues({
      username: 'admin',
      password: '123456',
      confirmPassword: ''
    });
    sound.click();
    showToast('Đã điền tài khoản mẫu (admin / 123456)', 'info');
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
              onClick={() => { sound.click(); setMode('login'); formik.setErrors({}); }}
            >
              🔑 Đăng Nhập
            </button>
            <button
              type="button"
              className={`auth-mode-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { sound.click(); setMode('register'); formik.setErrors({}); }}
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

        <form onSubmit={formik.handleSubmit} className="auth-form-body" noValidate>
          <div className="auth-field-group">
            <label className="auth-field-label">Tên tài khoản</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">👤</span>
              <input
                type="text"
                name="username"
                className="auth-text-input"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Ví dụ: player1, dragon..."
                required
                autoFocus
              />
            </div>
            {formik.touched.username && formik.errors.username && (
              <small style={{ color: '#fb7185', fontSize: '0.8rem' }}>{formik.errors.username}</small>
            )}
          </div>

          <div className="auth-field-group">
            <label className="auth-field-label">Mật khẩu</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                type="password"
                name="password"
                className="auth-text-input"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Tối thiểu 6 ký tự"
                required
              />
            </div>
            {formik.touched.password && formik.errors.password && (
              <small style={{ color: '#fb7185', fontSize: '0.8rem' }}>{formik.errors.password}</small>
            )}
          </div>

          {mode === 'register' && (
            <div className="auth-field-group">
              <label className="auth-field-label">Xác nhận mật khẩu</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🛡️</span>
                <input
                  type="password"
                  name="confirmPassword"
                  className="auth-text-input"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Nhập lại mật khẩu vừa nhập"
                  required
                />
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <small style={{ color: '#fb7185', fontSize: '0.8rem' }}>{formik.errors.confirmPassword}</small>
              )}
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
                onClick={() => { sound.click(); setMode('register'); formik.setErrors({}); }}
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
                onClick={() => { sound.click(); setMode('login'); formik.setErrors({}); }}
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
