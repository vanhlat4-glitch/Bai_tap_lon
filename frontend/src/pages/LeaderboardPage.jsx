import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLeaderboard, setLeaderboardGame } from '../features/games/gamesSlice';
import { useThemeLang } from '../context/ThemeLanguageContext';
import { sound } from '../utils/sound';

export default function LeaderboardPage() {
  const dispatch = useDispatch();
  const { leaderboard, leaderboardGame } = useSelector(state => state.games);
  const { user } = useSelector(state => state.auth);
  const { lang, t } = useThemeLang();

  useEffect(() => {
    dispatch(fetchLeaderboard(leaderboardGame));
  }, [dispatch, leaderboardGame]);

  const handleFilter = (gameKey) => {
    sound.click();
    dispatch(setLeaderboardGame(gameKey));
  };

  const top3 = leaderboard.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const numberLocale = lang === 'vi' ? 'vi-VN' : 'en-US';

  const formatScore = (val) => {
    if (leaderboardGame === 'coins') return `${Number(val).toLocaleString(numberLocale)} ${lang === 'vi' ? 'Xu 💰' : 'Coins 💰'}`;
    if (leaderboardGame === 'caro') return `${val} ${lang === 'vi' ? 'Trận thắng' : 'Wins'}`;
    return `${Number(val).toLocaleString(numberLocale)} pts`;
  };

  const renderAvatar = (av) => {
    if (av?.startsWith('/uploads/') || av?.startsWith('http')) {
      return <img src={av} alt="Avatar" className="avatar-img" />;
    }
    return av || '🎮';
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">🏆 {t('leaderboard.title')}</h2>
          <p className="section-subtitle">{t('leaderboard.subtitle')}</p>
        </div>

        <div className="leaderboard-tabs-bar">
          <button className={`leaderboard-tab ${leaderboardGame === 'snake' ? 'active' : ''}`} onClick={() => handleFilter('snake')}>
            🐍 {lang === 'vi' ? 'Rắn Săn Mồi' : 'Cyber Snake'}
          </button>
          <button className={`leaderboard-tab ${leaderboardGame === '2048' ? 'active' : ''}`} onClick={() => handleFilter('2048')}>
            🔢 Neon 2048
          </button>
          <button className={`leaderboard-tab ${leaderboardGame === 'caro' ? 'active' : ''}`} onClick={() => handleFilter('caro')}>
            ⭕ {lang === 'vi' ? 'Cờ Caro' : 'Gomoku Caro'}
          </button>
          <button className={`leaderboard-tab ${leaderboardGame === 'coins' ? 'active' : ''}`} onClick={() => handleFilter('coins')}>
            💰 {lang === 'vi' ? 'Đại Gia Xu' : 'Coin Tycoons'}
          </button>
        </div>
      </div>

      {/* Olympic Podium */}
      {top3.length > 0 && (
        <div className="podium-container">
          {/* 2nd Place */}
          <div className="podium-step step-2">
            <div className="podium-crown">🥈</div>
            <div className="podium-avatar">{renderAvatar(second?.avatar)}</div>
            <div className="podium-name">{second?.username || '---'}</div>
            <div className="podium-badge">{second?.badge || ''}</div>
            <div className="podium-score">{second ? formatScore(second.score) : ''}</div>
            <div className="podium-pedestal">2</div>
          </div>

          {/* 1st Place (Center) */}
          <div className="podium-step step-1">
            <div className="podium-crown">👑</div>
            <div className="podium-avatar">{renderAvatar(first?.avatar)}</div>
            <div className="podium-name">{first?.username || '---'}</div>
            <div className="podium-badge">{first?.badge || ''}</div>
            <div className="podium-score">{first ? formatScore(first.score) : ''}</div>
            <div className="podium-pedestal">1</div>
          </div>

          {/* 3rd Place */}
          <div className="podium-step step-3">
            <div className="podium-crown">🥉</div>
            <div className="podium-avatar">{renderAvatar(third?.avatar)}</div>
            <div className="podium-name">{third?.username || '---'}</div>
            <div className="podium-badge">{third?.badge || ''}</div>
            <div className="podium-score">{third ? formatScore(third.score) : ''}</div>
            <div className="podium-pedestal">3</div>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="leaderboard-table-card">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>{t('leaderboard.rank')}</th>
              <th>{t('leaderboard.player')}</th>
              <th>{lang === 'vi' ? 'Danh hiệu' : 'Badge'}</th>
              <th style={{ textAlign: 'right' }}>{leaderboardGame === 'coins' ? (lang === 'vi' ? 'Số Xu' : 'Coins') : t('leaderboard.score')}</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  {t('leaderboard.empty')}
                </td>
              </tr>
            ) : (
              leaderboard.map(p => {
                const isMe = user && (user.id === p.user_id || user.username === p.username);
                const rankBadge = p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`;

                return (
                  <tr key={p.user_id || p.rank} className={isMe ? 'highlight-me' : ''}>
                    <td className="rank-cell"><span className={`rank-badge rank-${p.rank}`}>{rankBadge}</span></td>
                    <td>
                      <div className="player-cell">
                        <span className="player-avatar">{renderAvatar(p.avatar)}</span>
                        <span className="player-name">
                          {p.username} {isMe && <small className="tag-you">({lang === 'vi' ? 'Bạn' : 'You'})</small>}
                        </span>
                      </div>
                    </td>
                    <td><span className="badge-pill">{p.badge || (lang === 'vi' ? 'Tân thủ' : 'Novice')}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {formatScore(p.score)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
