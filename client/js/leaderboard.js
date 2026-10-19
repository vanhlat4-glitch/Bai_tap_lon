// Leaderboard & Live Match Feed Controller
class LeaderboardManager {
  constructor() {
    this.currentGame = 'snake';
  }

  async init() {
    this.setupListeners();
    await this.loadLeaderboard(this.currentGame);
    await this.loadLiveFeed();
  }

  setupListeners() {
    const tabs = document.querySelectorAll('.leaderboard-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentGame = tab.dataset.game;
        this.loadLeaderboard(this.currentGame);
      });
    });
  }

  async loadLeaderboard(game) {
    const listContainer = document.getElementById('leaderboardList');
    const podiumContainer = document.getElementById('leaderboardPodium');
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="loading-spinner">Đang tải bảng xếp hạng...</div>';

    try {
      const data = await api.getLeaderboard(game);
      const players = data.leaderboard || [];

      // Render Podium for Top 3
      if (podiumContainer) {
        this.renderPodium(podiumContainer, players.slice(0, 3), game);
      }

      // Render Table for all
      this.renderTable(listContainer, players, game);
    } catch (err) {
      listContainer.innerHTML = '<div class="error-msg">Không thể tải bảng xếp hạng!</div>';
      console.error(err);
    }
  }

  renderPodium(container, top3, game) {
    if (top3.length === 0) {
      container.innerHTML = '';
      return;
    }

    const first = top3[0];
    const second = top3[1];
    const third = top3[2];

    const getScoreLabel = (score) => {
      if (game === 'coins') return `${Number(score).toLocaleString('vi-VN')} Xu`;
      if (game === 'caro') return `${score} Trận thắng`;
      return `${Number(score).toLocaleString('vi-VN')} Điểm`;
    };

    container.innerHTML = `
      <!-- 2nd Place -->
      <div class="podium-step step-2 ${second ? '' : 'empty'}">
        <div class="podium-crown">🥈</div>
        <div class="podium-avatar">${second ? second.avatar : '👤'}</div>
        <div class="podium-name">${second ? second.username : '---'}</div>
        <div class="podium-badge">${second ? second.badge : ''}</div>
        <div class="podium-score">${second ? getScoreLabel(second.score) : ''}</div>
        <div class="podium-pedestal">2</div>
      </div>

      <!-- 1st Place (Center & Highest) -->
      <div class="podium-step step-1 ${first ? '' : 'empty'}">
        <div class="podium-crown">👑</div>
        <div class="podium-avatar">${first ? first.avatar : '👤'}</div>
        <div class="podium-name">${first ? first.username : '---'}</div>
        <div class="podium-badge">${first ? first.badge : ''}</div>
        <div class="podium-score">${first ? getScoreLabel(first.score) : ''}</div>
        <div class="podium-pedestal">1</div>
      </div>

      <!-- 3rd Place -->
      <div class="podium-step step-3 ${third ? '' : 'empty'}">
        <div class="podium-crown">🥉</div>
        <div class="podium-avatar">${third ? third.avatar : '👤'}</div>
        <div class="podium-name">${third ? third.username : '---'}</div>
        <div class="podium-badge">${third ? third.badge : ''}</div>
        <div class="podium-score">${third ? getScoreLabel(third.score) : ''}</div>
        <div class="podium-pedestal">3</div>
      </div>
    `;
  }

  renderTable(container, players, game) {
    if (players.length === 0) {
      container.innerHTML = '<div class="empty-state">Chưa có ai ghi danh vào bảng xếp hạng! Hãy là người đầu tiên!</div>';
      return;
    }

    const currentUserId = auth.currentUser?.id;

    let html = `
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th style="width: 70px;">Hạng</th>
            <th>Người chơi</th>
            <th>Danh hiệu</th>
            <th style="text-align: right;">${game === 'coins' ? 'Số Xu' : 'Kỷ lục'}</th>
          </tr>
        </thead>
        <tbody>
    `;

    players.forEach(p => {
      const isMe = currentUserId === p.user_id;
      const rankBadge = p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`;

      html += `
        <tr class="${isMe ? 'highlight-me' : ''}">
          <td class="rank-cell"><span class="rank-badge rank-${p.rank}">${rankBadge}</span></td>
          <td>
            <div class="player-cell">
              <span class="player-avatar">${p.avatar || '🎮'}</span>
              <span class="player-name">${p.username} ${isMe ? '<small class="tag-you">(Bạn)</small>' : ''}</span>
            </div>
          </td>
          <td><span class="badge-pill">${p.badge || 'Tân thủ'}</span></td>
          <td style="text-align: right; font-weight: 700; color: #38bdf8;">
            ${Number(p.score).toLocaleString('vi-VN')} ${game === 'coins' ? '💰' : 'pts'}
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  }

  async loadLiveFeed() {
    const feedContainer = document.getElementById('liveMatchFeed');
    if (!feedContainer) return;

    try {
      const data = await api.getMatchHistory();
      const history = data.history || [];

      if (history.length === 0) {
        feedContainer.innerHTML = '<div class="empty-feed">Chưa có trận đấu nào gần đây.</div>';
        return;
      }

      feedContainer.innerHTML = history.map(item => {
        const gameIcons = {
          snake: '🐍 Rắn săn mồi',
          '2048': '🔢 Game 2048',
          caro: '⭕ Cờ Caro',
          wheel: '🎡 Vòng quay'
        };

        const timeStr = new Date(item.played_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        return `
          <div class="feed-item">
            <span class="feed-avatar">${item.avatar || '🎮'}</span>
            <div class="feed-content">
              <strong>${item.username}</strong> vừa chơi <em>${gameIcons[item.game] || item.game}</em>
              đạt <strong>${item.score}</strong> điểm!
            </div>
            <span class="feed-time">${timeStr}</span>
          </div>
        `;
      }).join('');
    } catch (e) {
      console.warn('Failed to load feed:', e);
    }
  }
}

window.leaderboardManager = new LeaderboardManager();
