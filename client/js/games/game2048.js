// 2048 Cyber Neon Engine
class Game2048 {
  constructor() {
    this.size = 4;
    this.grid = [];
    this.score = 0;
    this.bestScore = 0;
    this.isWon = false;
    this.isOver = false;
    this.keepPlaying = false;
    this.previousState = null;
  }

  init() {
    this.bestScore = parseInt(localStorage.getItem('2048_bestscore') || '0', 10);
    this.updateBestScoreDisplay();
    this.setupControls();
    this.reset();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      const activeTab = document.querySelector('.game-tab-btn.active');
      if (activeTab && activeTab.dataset.game === '2048') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
        }
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.move('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.move('right');
          break;
      }
    });

    // Touch controls / On-screen buttons
    const btnUp = document.getElementById('g2048Up');
    const btnDown = document.getElementById('g2048Down');
    const btnLeft = document.getElementById('g2048Left');
    const btnRight = document.getElementById('g2048Right');

    if (btnUp) btnUp.onclick = () => this.move('up');
    if (btnDown) btnDown.onclick = () => this.move('down');
    if (btnLeft) btnLeft.onclick = () => this.move('left');
    if (btnRight) btnRight.onclick = () => this.move('right');

    const newGameBtn = document.getElementById('g2048NewGameBtn');
    if (newGameBtn) newGameBtn.onclick = () => {
      if (window.sound) window.sound.click();
      this.reset();
    };

    const undoBtn = document.getElementById('g2048UndoBtn');
    if (undoBtn) undoBtn.onclick = () => this.undo();

    // Swipe support on board
    this.setupTouchSwipe();
  }

  setupTouchSwipe() {
    const board = document.getElementById('g2048Board');
    if (!board) return;

    let touchStartX = 0;
    let touchStartY = 0;

    board.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    board.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) > 30) {
          if (absX > absY) {
            this.move(dx > 0 ? 'right' : 'left');
          } else {
            this.move(dy > 0 ? 'down' : 'up');
          }
        }
      }
    }, { passive: true });
  }

  reset() {
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    this.score = 0;
    this.isWon = false;
    this.isOver = false;
    this.keepPlaying = false;
    this.previousState = null;

    this.addRandomTile();
    this.addRandomTile();
    this.updateScoreDisplay();
    this.render();

    const overlay = document.getElementById('g2048Overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  saveState() {
    this.previousState = {
      grid: this.grid.map(row => [...row]),
      score: this.score
    };
  }

  undo() {
    if (!this.previousState || this.isOver) {
      showToast('Không có nước đi nào để hoàn tác!', 'info');
      return;
    }
    this.grid = this.previousState.grid.map(row => [...row]);
    this.score = this.previousState.score;
    this.previousState = null;
    this.updateScoreDisplay();
    this.render();
    if (window.sound) window.sound.click();
    showToast('Đã hoàn tác 1 nước đi!', 'info');
  }

  addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length > 0) {
      const spot = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
      return spot;
    }
    return null;
  }

  move(direction) {
    if (this.isOver) return;

    this.saveState();

    let moved = false;
    let scoreAdded = 0;
    let maxMergedVal = 0;

    // Transpose or reverse helpers
    const rotate = (matrix) => matrix[0].map((_, c) => matrix.map(r => r[c]).reverse());

    let workingGrid = this.grid.map(row => [...row]);

    // Normalize so direction always acts like 'left'
    let rotations = 0;
    if (direction === 'up') rotations = 3;
    if (direction === 'right') rotations = 2;
    if (direction === 'down') rotations = 1;

    for (let i = 0; i < rotations; i++) {
      workingGrid = rotate(workingGrid);
    }

    // Process Left slide & merge
    for (let r = 0; r < this.size; r++) {
      const row = workingGrid[r].filter(val => val !== 0);
      const newRow = [];

      for (let c = 0; c < row.length; c++) {
        if (c < row.length - 1 && row[c] === row[c + 1]) {
          const merged = row[c] * 2;
          newRow.push(merged);
          scoreAdded += merged;
          if (merged > maxMergedVal) maxMergedVal = merged;
          c++; // skip next since merged
        } else {
          newRow.push(row[c]);
        }
      }

      while (newRow.length < this.size) {
        newRow.push(0);
      }

      for (let c = 0; c < this.size; c++) {
        if (workingGrid[r][c] !== newRow[c]) {
          moved = true;
        }
        workingGrid[r][c] = newRow[c];
      }
    }

    // Rotate back
    const restoreRotations = (4 - rotations) % 4;
    for (let i = 0; i < restoreRotations; i++) {
      workingGrid = rotate(workingGrid);
    }

    if (moved) {
      this.grid = workingGrid;
      this.score += scoreAdded;

      if (maxMergedVal > 0) {
        if (window.sound) window.sound.merge2048(maxMergedVal);
      } else {
        if (window.sound) window.sound.click();
      }

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('2048_bestscore', this.bestScore.toString());
        this.updateBestScoreDisplay();
      }

      this.addRandomTile();
      this.updateScoreDisplay();
      this.render();

      // Check win condition (2048 tile reached)
      if (!this.isWon && !this.keepPlaying) {
        const has2048 = this.grid.some(row => row.some(val => val >= 2048));
        if (has2048) {
          this.isWon = true;
          this.handleWin();
        }
      }

      // Check game over
      if (this.checkGameOver()) {
        this.isOver = true;
        this.handleGameOver();
      }
    }
  }

  checkGameOver() {
    // Any empty cell?
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) return false;
      }
    }

    // Any adjacent matching cell?
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = this.grid[r][c];
        if (r < this.size - 1 && val === this.grid[r + 1][c]) return false;
        if (c < this.size - 1 && val === this.grid[r][c + 1]) return false;
      }
    }

    return true;
  }

  render() {
    const board = document.getElementById('g2048Board');
    if (!board) return;

    board.innerHTML = '';

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = this.grid[r][c];
        const tile = document.createElement('div');
        tile.className = 'tile-2048';

        if (val > 0) {
          tile.classList.add(`tile-${val}`);
          tile.textContent = val;
        } else {
          tile.classList.add('tile-empty');
        }

        board.appendChild(tile);
      }
    }
  }

  handleWin() {
    if (window.sound) window.sound.win();
    showToast('🏆 Tuyệt vời! Bạn đã mở khóa ô 2048!', 'success');

    const overlay = document.getElementById('g2048Overlay');
    const overlayTitle = document.getElementById('g2048OverlayTitle');
    const overlayMsg = document.getElementById('g2048OverlayMsg');
    if (overlayTitle) overlayTitle.textContent = '🎉 BẠN ĐÃ CHIẾN THẮNG!';
    if (overlayMsg) overlayMsg.textContent = 'Bạn đã đạt được ô 2048 huyền thoại!';
    if (overlay) overlay.classList.remove('hidden');

    this.submitScore();
  }

  async handleGameOver() {
    if (window.sound) window.sound.gameOver();
    const overlay = document.getElementById('g2048Overlay');
    const overlayTitle = document.getElementById('g2048OverlayTitle');
    const overlayMsg = document.getElementById('g2048OverlayMsg');
    if (overlayTitle) overlayTitle.textContent = 'Trò Chơi Kết Thúc!';
    if (overlayMsg) overlayMsg.textContent = `Không còn nước đi hợp lệ. Điểm số: ${this.score}`;
    if (overlay) overlay.classList.remove('hidden');

    await this.submitScore();
  }

  async submitScore() {
    if (this.score > 0) {
      try {
        const res = await api.submitScore('2048', this.score, `Điểm 2048`);
        if (res.coinsEarned > 0) {
          auth.updateCoins(res.totalCoins);
          showToast(`💎 2048: Nhận được +${res.coinsEarned} Xu thưởng!`, 'success');
        }
      } catch (e) {
        console.error('Submit 2048 score error:', e);
      }
    }
  }

  updateScoreDisplay() {
    const curEl = document.getElementById('g2048Score');
    if (curEl) curEl.textContent = this.score.toLocaleString('vi-VN');
  }

  updateBestScoreDisplay() {
    const bestEl = document.getElementById('g2048Best');
    if (bestEl) bestEl.textContent = this.bestScore.toLocaleString('vi-VN');
  }
}

window.game2048 = new Game2048();
