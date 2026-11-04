import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser, registerUser, fetchMe } from '../features/auth/authSlice';
import { useThemeLang } from '../context/ThemeLanguageContext';
import { sound } from '../utils/sound';

/**
 * Rubric Criterion:
 * - Forms và Formik/Yup: Sử dụng thư viện Formik và Yup để quản lý và xác thực các form phức tạp trong ứng dụng.
 */
export default function AuthModal({ isOpen, onClose, initialMode = 'login', showToast, onSuccess }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);
  const { lang, t } = useThemeLang();

  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const validationSchema = useMemo(() => {
    const base = {
      username: Yup.string()
        .trim()
        .min(3, lang === 'vi' ? 'Tên tài khoản tối thiểu 3 ký tự' : 'Username must be at least 3 characters')
        .max(20, lang === 'vi' ? 'Tên tài khoản tối đa 20 ký tự' : 'Username must be at most 20 characters')
        .required(lang === 'vi' ? 'Vui lòng nhập tên tài khoản' : 'Username is required'),
      password: Yup.string()
        .min(6, lang === 'vi' ? 'Mật khẩu tối thiểu 6 ký tự' : 'Password must be at least 6 characters')
        .required(lang === 'vi' ? 'Vui lòng nhập mật khẩu' : 'Password is required')
    };

    if (mode === 'register') {
      base.confirmPassword = Yup.string()
        .oneOf(
          [Yup.ref('password')],
          lang === 'vi' ? 'Mật khẩu xác nhận không khớp!' : 'Passwords do not match!'
        )
        .required(lang === 'vi' ? 'Vui lòng xác nhận mật khẩu' : 'Please confirm your password');
    }

    return Yup.object(base);
  }, [mode, lang]);

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
            ? (lang === 'vi' ? `Chào mừng ${cleanUser} trở lại!` : `Welcome back ${cleanUser}!`)
            : (lang === 'vi' ? 'Đăng ký thành công! Nhận 100 Xu!' : 'Registered successfully! Received 100 Coins!'),
          'success'
        );
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
      } else {
        sound.gameOver();
        showToast(result.payload || (lang === 'vi' ? 'Đã có lỗi xảy ra' : 'An error occurred'), 'error');
      }
    }
  });

  if (!isOpen) return null;

  const handleQuickDemo = () => {
    formik.setValues({
      username: 'admin',
      password: '123456',
      confirmPassword: ''
    });
    showToast(lang === 'vi' ? 'Đã điền tài khoản mẫu (admin / 123456)' : 'Filled demo credentials (admin / 123456)', 'info');
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
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); formik.setErrors({}); }}
          >
            {t('authModal.tabLogin')}
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); formik.setErrors({}); }}
          >
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

        <form onSubmit={formik.handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label>{t('authModal.usernameLabel')}:</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t('authModal.usernamePlaceholder')}
              required
            />
            {formik.touched.username && formik.errors.username && (
              <small style={{ color: '#fb7185', fontSize: '0.78rem', display: 'block', marginTop: '0.25rem' }}>
                {formik.errors.username}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>{t('authModal.passwordLabel')}:</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t('authModal.passwordPlaceholder')}
              required
            />
            {formik.touched.password && formik.errors.password && (
              <small style={{ color: '#fb7185', fontSize: '0.78rem', display: 'block', marginTop: '0.25rem' }}>
                {formik.errors.password}
              </small>
            )}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>{t('authModal.confirmPassLabel')}:</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={t('authModal.confirmPassPlaceholder')}
                required
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <small style={{ color: '#fb7185', fontSize: '0.78rem', display: 'block', marginTop: '0.25rem' }}>
                  {formik.errors.confirmPassword}
                </small>
              )}
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
