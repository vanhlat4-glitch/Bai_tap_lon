import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPlatformStats, fetchMatchHistory, setActiveGame } from '../features/games/gamesSlice';
import { useThemeLang } from '../context/ThemeLanguageContext';
import { sound } from '../utils/sound';

export default function HomePage({ setView, openAuth }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { stats, history } = useSelector(state => state.games);
  const { lang, t } = useThemeLang();

  useEffect(() => {
    dispatch(fetchPlatformStats());
    dispatch(fetchMatchHistory());
  }, [dispatch]);

  const selectAndPlay = (gameKey) => {
    sound.click();
    dispatch(setActiveGame(gameKey));
    setView('games');
  };

  const numberLocale = lang === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <div>
      {/* Teacher / Demo Reviewer Quick Access Banner */}
      {!user && (
        <div className="demo-notice-banner">
          <div className="demo-notice-left">
            <span className="demo-badge-pill">{t('banner.tag')}</span>
            <span
              className="demo-notice-text"
              dangerouslySetInnerHTML={{ __html: t('banner.text') }}
            />
          </div>
          <button className="btn btn-primary btn-sm demo-login-btn" onClick={() => { sound.click(); openAuth && openAuth('login'); }}>
            {t('banner.btn')}
          </button>
        </div>
      )}

      {/* Hero Card */}
      <div className="hero-card">
        <div className="hero-content">
          <div className="hero-badge">{t('hero.badge')}</div>
          <h1 className="hero-title">{t('hero.title1')} <br /><span className="gradient-text">{t('hero.title2')}</span></h1>
          <p className="hero-desc">
            {t('hero.desc')}
          </p>
          <div className="hero-cta-group">
            <button className="btn btn-primary btn-lg" onClick={() => selectAndPlay('caro')}>{t('hero.playNow')}</button>
            <button className="btn btn-secondary btn-lg" onClick={() => { sound.click(); setView('wheel'); }}>{t('hero.wheelBtn')}</button>
            <button className="btn btn-outline btn-lg" onClick={() => { sound.click(); setView('leaderboard'); }}>{t('hero.leaderboardBtn')}</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-game-badge badge-caro" onClick={() => selectAndPlay('caro')}>{t('hero.badgeCaro')}</div>
          <div className="hero-game-badge badge-snake" onClick={() => selectAndPlay('snake')}>{t('hero.badgeSnake')}</div>
          <div className="hero-game-badge badge-2048" onClick={() => selectAndPlay('2048')}>{t('hero.badge2048')}</div>
          <div className="hero-game-badge badge-wheel" onClick={() => { sound.click(); setView('wheel'); }}>{t('hero.badgeWheel')}</div>
          <div className="hero-orb"></div>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="stats-ribbon">
        <div className="stat-box">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{Number(stats?.totalUsers || 5).toLocaleString(numberLocale)}</div>
            <div className="stat-label">{t('stats.users')}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">🎮</div>
          <div className="stat-info">
            <div className="stat-value">{Number(stats?.totalMatches || 12).toLocaleString(numberLocale)}</div>
            <div className="stat-label">{t('stats.matches')}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">🐍</div>
          <div className="stat-info">
            <div className="stat-value">{Number(stats?.records?.snake || 510).toLocaleString(numberLocale)}</div>
            <div className="stat-label">{t('stats.snakeRecord')}</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">💎</div>
          <div className="stat-info">
            <div className="stat-value">{Number(stats?.records?.game2048 || 35200).toLocaleString(numberLocale)}</div>
            <div className="stat-label">{t('stats.game2048Record')}</div>
          </div>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="section-header">
        <div>
          <h2 className="section-title">{t('home.featuredTitle')}</h2>
          <p className="section-subtitle">{t('home.featuredSubtitle')}</p>
        </div>
      </div>

      <div className="game-cards-grid">
        <div className="game-showcase-card" onClick={() => selectAndPlay('caro')}>
          <div className="game-card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>⭕❌</div>
          <div className="game-card-content">
            <div className="game-card-tag">{lang === 'vi' ? 'Chiến Thuật Trí Tuệ' : 'Mind Strategy'}</div>
            <h3 className="game-card-title">{t('games.caroTitle')}</h3>
            <p className="game-card-desc">{t('games.caroDesc')}</p>
            <div className="game-card-footer">
              <span className="game-reward-pill">{lang === 'vi' ? 'Thưởng tới +35 Xu/trận' : 'Up to +35 Coins/game'}</span>
              <span className="play-link">{t('games.btnPlay')} →</span>
            </div>
          </div>
        </div>

        <div className="game-showcase-card" onClick={() => selectAndPlay('snake')}>
          <div className="game-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>🐍</div>
          <div className="game-card-content">
            <div className="game-card-tag">{lang === 'vi' ? 'Phản Xạ Cực Nhanh' : 'Fast Reflexes'}</div>
            <h3 className="game-card-title">{t('games.snakeTitle')}</h3>
            <p className="game-card-desc">{t('games.snakeDesc')}</p>
            <div className="game-card-footer">
              <span className="game-reward-pill">{lang === 'vi' ? '1 Xu mỗi 10 điểm' : '1 Coin per 10 pts'}</span>
              <span className="play-link">{t('games.btnPlay')} →</span>
            </div>
          </div>
        </div>

        <div className="game-showcase-card" onClick={() => selectAndPlay('2048')}>
          <div className="game-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>🔢</div>
          <div className="game-card-content">
            <div className="game-card-tag">{lang === 'vi' ? 'Giải Đố Tư Duy' : 'Brain Puzzle'}</div>
            <h3 className="game-card-title">{t('games.game2048Title')}</h3>
            <p className="game-card-desc">{t('games.game2048Desc')}</p>
            <div className="game-card-footer">
              <span className="game-reward-pill">{lang === 'vi' ? 'Mở khóa 2048: +30 Xu' : 'Unlock 2048: +30 Coins'}</span>
              <span className="play-link">{t('games.btnPlay')} →</span>
            </div>
          </div>
        </div>

        <div className="game-showcase-card" onClick={() => { sound.click(); setView('wheel'); }}>
          <div className="game-card-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>🎡</div>
          <div className="game-card-content">
            <div className="game-card-tag">{lang === 'vi' ? 'Vận May & Quà Khủng' : 'Fortune & Jackpots'}</div>
            <h3 className="game-card-title">{t('games.wheelTitle')}</h3>
            <p className="game-card-desc">{t('games.wheelDesc')}</p>
            <div className="game-card-footer">
              <span className="game-reward-pill">{lang === 'vi' ? 'Jackpot +300 Xu' : 'Jackpot +300 Coins'}</span>
              <span className="play-link">{lang === 'vi' ? 'Quay ngay →' : 'Spin now →'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Match Feed */}
      <div className="feed-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">{t('home.historyTitle')}</h3>
            <p className="section-subtitle">{t('home.historySubtitle')}</p>
          </div>
        </div>
        <div className="live-feed-grid">
          {history.length === 0 ? (
            <p className="feed-empty-text">{t('home.noHistory')}</p>
          ) : (
            history.map(item => {
              const timeStr = new Date(item.played_at).toLocaleTimeString(numberLocale, { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={item.id} className="feed-item">
                  <span className="feed-avatar">{item.avatar || '🎮'}</span>
                  <div className="feed-content">
                    <strong>{item.username}</strong>{' '}
                    {lang === 'vi' ? 'vừa chơi' : 'just played'}{' '}
                    <em>{item.game}</em>{' '}
                    {lang === 'vi' ? 'đạt' : 'scored'}{' '}
                    <strong>{Number(item.score).toLocaleString(numberLocale)}</strong> {lang === 'vi' ? 'điểm!' : 'pts!'}
                  </div>
                  <span className="feed-time">{timeStr}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
