import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPlatformStats, fetchMatchHistory, setActiveGame } from '../features/games/gamesSlice';
import { sound } from '../utils/sound';

export default function HomePage({ setView }) {
  const dispatch = useDispatch();
  const { stats, history } = useSelector(state => state.games);

  useEffect(() => {
    dispatch(fetchPlatformStats());
    dispatch(fetchMatchHistory());
  }, [dispatch]);

  const selectAndPlay = (gameKey) => {
    sound.click();
    dispatch(setActiveGame(gameKey));
    setView('games');
  };

  return (
    <div>
      {/* Hero Card */}
      <div className="hero-card">
        <div className="hero-content">
          <div className="hero-badge">⚡ REACT + REDUX TOOLKIT MINIGAME HUB</div>
          <h1 className="hero-title">Đấu Trí, Săn Điểm & <br /><span className="gradient-text">Leo Bảng Xếp Hạng</span></h1>
          <p className="hero-desc">
            Trải nghiệm 4 trò chơi kinh điển xây dựng hoàn toàn bằng React và Redux Toolkit,
            tích hợp đầy đủ Back-End Node.js & MongoDB theo chuẩn 14 bài học.
          </p>
          <div className="hero-cta-group">
            <button className="btn btn-primary btn-lg" onClick={() => selectAndPlay('caro')}>🎮 Chơi Ngay Bây Giờ</button>
            <button className="btn btn-secondary btn-lg" onClick={() => { sound.click(); setView('wheel'); }}>🎡 Vòng Quay May Mắn</button>
            <button className="btn btn-outline btn-lg" onClick={() => { sound.click(); setView('leaderboard'); }}>🏆 Bảng Xếp Hạng</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-game-badge badge-caro">⭕❌ Gomoku Caro</div>
          <div className="hero-game-badge badge-snake">🐍 Cyber Snake</div>
          <div className="hero-game-badge badge-2048">🔢 Neon 2048</div>
          <div className="hero-game-badge badge-wheel">🎡 Lucky Wheel</div>
          <div className="hero-orb"></div>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="stats-ribbon">
        <div className="stat-box">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalUsers || '5'}</div>
            <div className="stat-label">Người Chơi Đã Tham Gia</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">🎮</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalMatches || '12'}</div>
            <div className="stat-label">Số Trận Đã Đấu</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">🐍</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.records?.snake || '510'}</div>
            <div className="stat-label">Kỷ Lục Rắn Săn Mồi</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">💎</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.records?.game2048?.toLocaleString('vi-VN') || '35,200'}</div>
            <div className="stat-label">Kỷ Lục Điểm 2048</div>
          </div>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Danh Sách Trò Chơi Nổi Bật</h2>
          <p className="section-subtitle">Chọn minigame yêu thích để bắt đầu hành trình tích lũy Xu</p>
        </div>
      </div>

      <div className="game-cards-grid">
        <div className="game-showcase-card" onClick={() => selectAndPlay('caro')}>
          <div className="game-card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>⭕❌</div>
          <div className="game-card-content">
            <div className="game-card-tag">Chiến Thuật Trí Tuệ</div>
            <h3 className="game-card-title">Cờ Caro Tinh Anh (Gomoku)</h3>
            <p className="game-card-desc">Thách thức AI thông minh với 3 cấp độ hoặc so tài 2 người trên cùng máy.</p>
            <div className="game-card-footer">
              <span className="game-reward-pill">Thưởng tới +35 Xu/trận</span>
              <span className="play-link">Chơi ngay →</span>
            </div>
          </div>
        </div>

        <div className="game-showcase-card" onClick={() => selectAndPlay('snake')}>
          <div className="game-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>🐍</div>
          <div className="game-card-content">
            <div className="game-card-tag">Phản Xạ Cực Nhanh</div>
            <h3 className="game-card-title">Cyber Snake 2.0</h3>
            <p className="game-card-desc">Điều khiển rắn neon săn táo thường & táo vàng thần kỳ, hiệu ứng hạt nổ sống động.</p>
            <div className="game-card-footer">
              <span className="game-reward-pill">1 Xu mỗi 10 điểm</span>
              <span className="play-link">Chơi ngay →</span>
            </div>
          </div>
        </div>

        <div className="game-showcase-card" onClick={() => selectAndPlay('2048')}>
          <div className="game-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>🔢</div>
          <div className="game-card-content">
            <div className="game-card-tag">Giải Đố Tư Duy</div>
            <h3 className="game-card-title">Neon 2048</h3>
            <p className="game-card-desc">Trượt và ghép các ô số tương đồng để tạo nên con số 2048 huyền thoại.</p>
            <div className="game-card-footer">
              <span className="game-reward-pill">Mở khóa 2048: +30 Xu</span>
              <span className="play-link">Chơi ngay →</span>
            </div>
          </div>
        </div>

        <div className="game-showcase-card" onClick={() => { sound.click(); setView('wheel'); }}>
          <div className="game-card-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>🎡</div>
          <div className="game-card-content">
            <div className="game-card-tag">Vận May & Quà Khủng</div>
            <h3 className="game-card-title">Vòng Quay May Mắn</h3>
            <p className="game-card-desc">Quay miễn phí mỗi 6 tiếng! Trúng hàng trăm Xu thưởng và danh hiệu quý hiếm.</p>
            <div className="game-card-footer">
              <span className="game-reward-pill">Jackpot +300 Xu</span>
              <span className="play-link">Quay ngay →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Match Feed */}
      <div className="feed-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">⚡ Hoạt Động Thi Đấu Thời Gian Thực</h3>
            <p className="section-subtitle">Các trận đấu vừa diễn ra trên hệ thống</p>
          </div>
        </div>
        <div className="live-feed-grid">
          {history.map(item => {
            const timeStr = new Date(item.played_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={item.id} className="feed-item">
                <span className="feed-avatar">{item.avatar || '🎮'}</span>
                <div className="feed-content">
                  <strong>{item.username}</strong> vừa chơi <em>{item.game}</em> đạt <strong>{item.score}</strong> điểm!
                </div>
                <span className="feed-time">{timeStr}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
