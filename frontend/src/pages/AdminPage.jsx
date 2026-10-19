import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { sound } from '../utils/sound';

export default function AdminPage({ showToast }) {
  const { user } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'logins' | 'users' | 'scores' | 'purchases'

  // Admin Overview & Logs State
  const [adminStats, setAdminStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // User Management State
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  const token = localStorage.getItem('minigame_token');

  const loadAdminStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/users/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Lỗi tải thông tin quản trị');
      setAdminStats(json.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUsers = async (page = 1) => {
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/users?page=${page}&limit=8&search=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch (err) {
      showToast(err.message || 'Lỗi tải người dùng', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadAdminStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers(1);
    }
  }, [search, activeTab]);

  const handleEditCoins = async (targetUser) => {
    const input = prompt(`Nhập số Xu mới cho ${targetUser.username} (#${targetUser.id}):`, targetUser.coins);
    if (input === null) return;
    const coins = parseInt(input, 10);
    if (isNaN(coins) || coins < 0) {
      showToast('Số xu không hợp lệ!', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ coins })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sound.coin();
      showToast(`Đã cập nhật Xu cho #${targetUser.id} (${targetUser.username}) thành ${coins} Xu!`, 'success');
      loadUsers(pagination.page);
      loadAdminStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEditBadge = async (targetUser) => {
    const newBadge = prompt(`Nhập danh hiệu mới cho ${targetUser.username}:`, targetUser.badge || 'Tân thủ');
    if (!newBadge || !newBadge.trim()) return;

    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ badge: newBadge.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sound.win();
      showToast(`Đã đổi danh hiệu của ${targetUser.username} thành "${newBadge.trim()}"!`, 'success');
      loadUsers(pagination.page);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${targetUser.username}" (#${targetUser.id}) không?`)) return;

    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sound.click();
      showToast(data.message, 'success');
      loadUsers(pagination.page);
      loadAdminStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteScore = async (scoreId, playerName, game) => {
    if (!confirm(`Xóa điểm trận ${game} (#${scoreId}) của người chơi ${playerName}?`)) return;

    try {
      const res = await fetch(`/api/users/scores/${scoreId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sound.click();
      showToast(data.message, 'success');
      loadAdminStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0 giây';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h} giờ ${m} phút ${s} giây`;
  };

  const overview = adminStats?.overview || {};
  const system = overview?.system || {};
  const gameDist = adminStats?.gameDistribution || [];

  return (
    <div className="admin-page-container">
      {/* Header section */}
      <div className="section-header">
        <div>
          <div className="hero-badge">👑 SERVER MANAGEMENT & AUDIT CENTER</div>
          <h2 className="section-title">Trung Tâm Quản Lý Máy Chủ & Hoạt Động</h2>
          <p className="section-subtitle">
            Giám sát toàn bộ hoạt động đăng ký, đăng nhập, lịch sử chơi game, giao dịch và quản trị người chơi theo thời gian thực.
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { sound.click(); loadAdminStats(); if (activeTab === 'users') loadUsers(pagination.page); }}
            disabled={statsLoading}
          >
            🔄 {statsLoading ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>👥</div>
          <div className="kpi-info">
            <span className="kpi-label">Tổng Tài Khoản Đăng Ký</span>
            <h3 className="kpi-val">{overview.totalUsers || 0} <span className="kpi-unit">người</span></h3>
            <span className="kpi-sub">⚡ {overview.logins24h || 0} lượt truy cập trong 24h</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>💰</div>
          <div className="kpi-info">
            <span className="kpi-label">Tổng Lượng Xu Lưu Hành</span>
            <h3 className="kpi-val" style={{ color: '#fbbf24' }}>{Number(overview.totalCoins || 0).toLocaleString('vi-VN')}</h3>
            <span className="kpi-sub">🪙 Nền kinh tế người chơi nắm giữ</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>🎯</div>
          <div className="kpi-info">
            <span className="kpi-label">Tổng Lượt Chơi Game</span>
            <h3 className="kpi-val">{overview.totalScores || 0} <span className="kpi-unit">trận</span></h3>
            <span className="kpi-sub">🎮 Cờ Caro, Rắn Cyber, 2048</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>🎡</div>
          <div className="kpi-info">
            <span className="kpi-label">Lượt Quay May Mắn</span>
            <h3 className="kpi-val">{overview.totalSpins || 0} <span className="kpi-unit">lần</span></h3>
            <span className="kpi-sub">🎁 Điểm danh & quay thưởng</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>🛍️</div>
          <div className="kpi-info">
            <span className="kpi-label">Vật Phẩm Đã Bán</span>
            <h3 className="kpi-val">{overview.totalPurchases || 0} <span className="kpi-unit">món</span></h3>
            <span className="kpi-sub">💎 Avatar VIP & Danh hiệu</span>
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="admin-tabs-nav">
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => { sound.click(); setActiveTab('overview'); }}
        >
          📊 Tổng Quan & Máy Chủ
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'logins' ? 'active' : ''}`}
          onClick={() => { sound.click(); setActiveTab('logins'); }}
        >
          🔐 Nhật Ký Đăng Nhập & Đăng Ký
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { sound.click(); setActiveTab('users'); }}
        >
          👥 Quản Lý Người Dùng
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'scores' ? 'active' : ''}`}
          onClick={() => { sound.click(); setActiveTab('scores'); }}
        >
          🏆 Lịch Sử Điểm Số
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => { sound.click(); setActiveTab('purchases'); }}
        >
          🛒 Giao Dịch Shop
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
      {activeTab === 'overview' && (
        <div className="admin-tab-content">
          <div className="admin-two-col">
            {/* Server Specs Card */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>🖥️ Trạng Thái Máy Chủ (Server Status)</h3>
                <span className="status-live-pill">🟢 HOẠT ĐỘNG TỐT</span>
              </div>
              <div className="admin-specs-list">
                <div className="spec-item">
                  <span className="spec-label">Thời gian máy chủ hoạt động (Uptime):</span>
                  <span className="spec-val highlight-val">{formatUptime(system.uptimeSeconds)}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Bộ nhớ RAM tiêu thụ (Heap Used):</span>
                  <span className="spec-val">{system.memoryMB || 0} MB</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Môi trường Node.js:</span>
                  <span className="spec-val">{system.nodeVersion} ({system.platform} {system.arch})</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Động cơ Cơ sở dữ liệu:</span>
                  <span className="spec-val" style={{ color: '#34d399', fontWeight: 600 }}>
                    SQLite High-Speed Engine + Mongoose ODM (Dual Mode)
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Cổng kết nối Backend:</span>
                  <span className="spec-val">PORT 3000 (Proxy Vite 5173)</span>
                </div>
              </div>
            </div>

            {/* Game Activity Distribution */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>🎮 Tần Suất & Kỷ Lục Các Minigame</h3>
              </div>
              <div className="admin-game-bars">
                {gameDist.map(g => (
                  <div key={g.game} className="game-dist-item">
                    <div className="game-dist-header">
                      <span className="game-name">
                        {g.game === 'caro' ? '♟️ Cờ Caro Thông Minh' : g.game === 'snake' ? '🐍 Rắn Cyber Neon' : '🔢 2048 Phá Đảo'}
                      </span>
                      <span className="game-dist-metrics">
                        <strong>{g.plays}</strong> lượt | Điểm kỷ lục: <strong style={{ color: '#fbbf24' }}>{g.maxScore}</strong>
                      </span>
                    </div>
                    <div className="dist-progress-track">
                      <div
                        className="dist-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(12, ((g.plays || 0) / Math.max(1, overview.totalScores || 1)) * 100))}%`,
                          background: g.game === 'caro' ? 'linear-gradient(90deg, #38bdf8, #3b82f6)' : g.game === 'snake' ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f59e0b, #ec4899)'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="admin-card" style={{ marginTop: '1.5rem' }}>
            <div className="admin-card-header">
              <h3>🆕 Thành Viên Mới Đăng Ký Gần Đây (New Registrations)</h3>
              <span className="card-badge-info">10 tài khoản mới nhất</span>
            </div>
            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người chơi</th>
                    <th>Số Xu ban đầu</th>
                    <th>Danh hiệu</th>
                    <th>Thời gian đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {(adminStats?.recentRegistrations || []).map(r => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>
                        <div className="player-cell">
                          <span className="player-avatar">{r.avatar || '🎮'}</span>
                          <span className="player-name">{r.username}</span>
                        </div>
                      </td>
                      <td style={{ color: '#fbbf24', fontWeight: 600 }}>{Number(r.coins).toLocaleString('vi-VN')} 💰</td>
                      <td><span className="badge-pill">{r.badge || 'Tân thủ'}</span></td>
                      <td>{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOGINS & REGISTRATIONS AUDIT LOG */}
      {activeTab === 'logins' && (
        <div className="admin-tab-content">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>🔐 Nhật Ký Truy Cập, Đăng Nhập & Đăng Ký (Access Logs)</h3>
                <p className="admin-card-sub">Ghi lại toàn bộ lịch sử đăng nhập thành công, thất bại và tài khoản mới tạo</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={loadAdminStats}>🔄 Tải lại log</button>
            </div>

            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Tài khoản</th>
                    <th>Hành động / Trạng thái</th>
                    <th>Địa chỉ IP</th>
                    <th>Trình duyệt / Thiết bị</th>
                  </tr>
                </thead>
                <tbody>
                  {(!adminStats?.recentLogins || adminStats.recentLogins.length === 0) ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có bản ghi nhật ký nào.</td></tr>
                  ) : (
                    adminStats.recentLogins.map(log => {
                      const isSuccess = log.status === 'success';
                      const isRegister = log.status === 'registered';

                      return (
                        <tr key={log.id}>
                          <td>{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                          <td>
                            <strong>{log.username}</strong> {log.user_id ? `(#${log.user_id})` : ''}
                          </td>
                          <td>
                            {isRegister ? (
                              <span className="status-pill status-register">📝 Đăng ký mới</span>
                            ) : isSuccess ? (
                              <span className="status-pill status-success">✅ Đăng nhập thành công</span>
                            ) : (
                              <span className="status-pill status-failed">❌ Đăng nhập thất bại (Sai MK)</span>
                            )}
                          </td>
                          <td><code className="ip-badge">{log.ip || '127.0.0.1'}</code></td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.user_agent || 'Unknown'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="admin-tab-content">
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <input
                type="text"
                className="form-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Tìm kiếm người chơi theo tên tài khoản..."
              />
            </div>
            <div className="admin-toolbar-actions">
              <button className="btn btn-outline btn-sm" onClick={() => loadUsers(pagination.page)}>
                🔄 Làm mới
              </button>
            </div>
          </div>

          <div className="admin-card">
            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>ID</th>
                    <th>Người chơi</th>
                    <th>Vai trò</th>
                    <th>Số Xu</th>
                    <th>Danh hiệu</th>
                    <th>Ngày tạo</th>
                    <th style={{ textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải người dùng...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Không tìm thấy người dùng nào!</td></tr>
                  ) : (
                    users.map(u => {
                      const role = u.username.toLowerCase() === 'admin' ? 'admin' : (u.role || 'user');
                      const isImg = u.avatar && (u.avatar.startsWith('/uploads/') || u.avatar.startsWith('http'));

                      return (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td>
                            <div className="player-cell">
                              <span className="player-avatar">
                                {isImg ? <img src={u.avatar} alt="Avatar" className="avatar-img" /> : u.avatar || '🎮'}
                              </span>
                              <span className="player-name">{u.username}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge-pill" style={role === 'admin' ? { background: '#dc2626', color: '#fff' } : {}}>
                              {role.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: '#fbbf24' }}>
                            {Number(u.coins).toLocaleString('vi-VN')} 💰
                          </td>
                          <td><span className="badge-pill">{u.badge || 'Tân thủ'}</span></td>
                          <td>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleEditCoins(u)}
                              title="Thưởng / Phạt Xu"
                            >
                              💰 Sửa Xu
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleEditBadge(u)}
                              style={{ marginLeft: '0.4rem' }}
                              title="Đổi danh hiệu"
                            >
                              🎖️ Đổi Danh hiệu
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDeleteUser(u)}
                              style={{ marginLeft: '0.4rem' }}
                              title="Xóa tài khoản"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="pagination-bar" style={{ marginTop: '1rem', border: 'none', background: 'transparent' }}>
              <span className="pagination-info">
                Trang {pagination.page} / {pagination.totalPages || 1} (Tổng: {pagination.total} người chơi)
              </span>
              <div className="pagination-buttons">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadUsers(pagination.page - 1)}
                >
                  ◀ Trang trước
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadUsers(pagination.page + 1)}
                >
                  Trang sau ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GAME SCORES AUDIT */}
      {activeTab === 'scores' && (
        <div className="admin-tab-content">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>🏆 Kiểm Duyệt Lịch Sử Trận Đấu & Điểm Kỷ Lục</h3>
                <p className="admin-card-sub">Quản lý các lượt chơi game và quyền xóa điểm số gian lận trên bảng xếp hạng</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={loadAdminStats}>🔄 Tải lại</button>
            </div>

            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người chơi</th>
                    <th>Trò chơi</th>
                    <th>Điểm số</th>
                    <th>Chi tiết trận đấu</th>
                    <th>Thời gian chơi</th>
                    <th style={{ textAlign: 'right' }}>Kiểm duyệt</th>
                  </tr>
                </thead>
                <tbody>
                  {(!adminStats?.recentScores || adminStats.recentScores.length === 0) ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có lượt chơi nào.</td></tr>
                  ) : (
                    adminStats.recentScores.map(sc => (
                      <tr key={sc.id}>
                        <td>#{sc.id}</td>
                        <td><strong>{sc.username}</strong></td>
                        <td>
                          <span className="badge-pill" style={{ textTransform: 'uppercase' }}>
                            {sc.game === 'caro' ? '♟️ Cờ Caro' : sc.game === 'snake' ? '🐍 Rắn Cyber' : '🔢 2048'}
                          </span>
                        </td>
                        <td style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.05rem' }}>
                          {Number(sc.score).toLocaleString('vi-VN')}
                        </td>
                        <td>{sc.details || '-'}</td>
                        <td>{new Date(sc.played_at).toLocaleString('vi-VN')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDeleteScore(sc.id, sc.username, sc.game)}
                            title="Xóa điểm gian lận"
                          >
                            🗑️ Xóa điểm
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SHOP PURCHASES AUDIT */}
      {activeTab === 'purchases' && (
        <div className="admin-tab-content">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>🛒 Lịch Sử Mua Sắm Tại Cửa Hàng (Shop Economy Logs)</h3>
                <p className="admin-card-sub">Theo dõi các giao dịch mua vật phẩm Avatar, Danh hiệu bằng Xu</p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={loadAdminStats}>🔄 Tải lại</button>
            </div>

            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Mã GD</th>
                    <th>Người mua</th>
                    <th>Mã vật phẩm</th>
                    <th>Phân loại</th>
                    <th>Thời gian mua</th>
                  </tr>
                </thead>
                <tbody>
                  {(!adminStats?.recentPurchases || adminStats.recentPurchases.length === 0) ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có giao dịch mua sắm nào.</td></tr>
                  ) : (
                    adminStats.recentPurchases.map(p => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td><strong>{p.username}</strong></td>
                        <td><code>{p.item_id}</code></td>
                        <td>
                          <span className="badge-pill">
                            {p.item_type === 'avatar' ? '🎭 Avatar VIP' : p.item_type === 'badge' ? '🎖️ Danh hiệu' : p.item_type}
                          </span>
                        </td>
                        <td>{new Date(p.bought_at).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
