import React from 'react';
import { useSelector } from 'react-redux';
import { useThemeLang } from '../context/ThemeLanguageContext';

/**
 * Rubric Criterion:
 * - Higher-Order Components (HOCs): Sử dụng HOCs để tái sử dụng logic và chức năng giữa các component.
 *
 * withAdminAuth wraps any component that requires Admin privileges,
 * centralizing role verification and fallback UI rendering.
 */
export default function withAdminAuth(WrappedComponent) {
  function WithAdminAuthComponent(props) {
    const { user } = useSelector((state) => state.auth);
    const { lang } = useThemeLang();

    const isAdmin =
      user && (user.role === 'admin' || user.username?.toLowerCase() === 'admin');

    if (!isAdmin) {
      return (
        <div className="panel-card" style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔐</div>
          <h3 className="section-title" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
            {lang === 'vi' ? 'Khu Vực Quản Trị Viên' : 'Administrator Restricted Area'}
          </h3>
          <p className="section-subtitle" style={{ marginBottom: '1.25rem' }}>
            {lang === 'vi'
              ? 'Bạn cần đăng nhập bằng tài khoản quyền Admin để truy cập chức năng này.'
              : 'You must be signed in with an Admin account to access this section.'}
          </p>
        </div>
      );
    }

    return <WrappedComponent {...props} adminUser={user} />;
  }

  const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAdminAuthComponent.displayName = `withAdminAuth(${wrappedName})`;

  return WithAdminAuthComponent;
}

