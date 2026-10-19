// Caro / Gomoku Game Engine
class CaroGame {
  constructor() {
    this.size = 15;
    this.board = [];
    this.currentPlayer = 'X'; // 'X' is Player 1 (Blue), 'O' is Player 2 or AI (Red)
    this.mode = 'ai'; // 'ai' or 'pvp'
    this.aiDifficulty = 'normal'; // 'easy', 'normal', 'hard'
    this.isGameOver = false;
    this.moveHistory = [];
    this.winningCells = [];
    this.stats = {
      wins: 0,
      losses: 0,
      draws: 0
    };
  }

  init() {
    this.reset();
    this.setupEventListeners();
  }

  reset() {
    this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(''));
    this.currentPlayer = 'X';
    this.isGameOver = false;
    this.moveHistory = [];
    this.winningCells = [];
    this.renderBoard();
    this.updateStatus('Lượt của bạn (Quân X)');
  }

  setupEventListeners() {
    const boardEl = document.getElementById('caroBoard');
    if (!boardEl) return;

    boardEl.addEventListener('click', (e) => {
      const cell = e.target.closest('.caro-cell');
      if (!cell || this.isGameOver) return;

      const r = parseInt(cell.dataset.row, 10);
      const c = parseInt(cell.dataset.col, 10);

      this.makeMove(r, c);
    });

    const resetBtn = document.getElementById('caroResetBtn');
    if (resetBtn) resetBtn.onclick = () => {
      if (window.sound) window.sound.click();
      this.reset();
    };

    const undoBtn = document.getElementById('caroUndoBtn');
    if (undoBtn) undoBtn.onclick = () => this.undo();

    const modeSelect = document.getElementById('caroModeSelect');
    if (modeSelect) modeSelect.onchange = (e) => {
      this.mode = e.target.value;
      const diffContainer = document.getElementById('caroAiDiffContainer');
      if (diffContainer) {
        diffContainer.style.display = this.mode === 'ai' ? 'inline-block' : 'none';
      }
      this.reset();
    };

    const diffSelect = document.getElementById('caroAiDiff');
    if (diffSelect) diffSelect.onchange = (e) => {
      this.aiDifficulty = e.target.value;
      this.reset();
    };

    const sizeSelect = document.getElementById('caroSizeSelect');
    if (sizeSelect) sizeSelect.onchange = (e) => {
      this.size = parseInt(e.target.value, 10);
      this.reset();
    };
  }

  renderBoard() {
    const boardEl = document.getElementById('caroBoard');
    if (!boardEl) return;

    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = document.createElement('div');
        cell.className = 'caro-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        const val = this.board[r][c];
        if (val) {
          cell.classList.add(`val-${val.toLowerCase()}`);
          cell.textContent = val;
        }

        // Highlight last move
        if (this.moveHistory.length > 0) {
          const lastMove = this.moveHistory[this.moveHistory.length - 1];
          if (lastMove.r === r && lastMove.c === c) {
            cell.classList.add('last-move');
          }
        }

        // Highlight winning cells
        if (this.winningCells.some(([wr, wc]) => wr === r && wc === c)) {
          cell.classList.add('win-cell');
        }

        boardEl.appendChild(cell);
      }
    }
  }

  makeMove(r, c) {
    if (this.board[r][c] !== '' || this.isGameOver) return;

    // Apply move
    this.board[r][c] = this.currentPlayer;
    this.moveHistory.push({ r, c, player: this.currentPlayer });
    if (window.sound) window.sound.placePiece();

    const winData = this.checkWin(r, c, this.currentPlayer);
    if (winData) {
      this.isGameOver = true;
      this.winningCells = winData;
      this.renderBoard();
      this.handleGameOver(this.currentPlayer);
      return;
    }

    if (this.moveHistory.length === this.size * this.size) {
      this.isGameOver = true;
      this.renderBoard();
      this.updateStatus('Trận đấu hòa!');
      if (window.sound) window.sound.gameOver();
      return;
    }

    // Switch turn
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    this.renderBoard();

    if (this.mode === 'ai' && this.currentPlayer === 'O' && !this.isGameOver) {
      this.updateStatus('🤖 AI đang suy nghĩ nước đi...');
      setTimeout(() => this.makeAiMove(), 250);
    } else {
      this.updateStatus(`Lượt của ${this.currentPlayer === 'X' ? 'Quân X (Bạn)' : 'Quân O'}`);
    }
  }

  makeAiMove() {
    if (this.isGameOver) return;

    let move;
    if (this.aiDifficulty === 'easy') {
      move = this.getEasyAiMove();
    } else if (this.aiDifficulty === 'hard') {
      move = this.getHeuristicMove('O', 'X', 1.3);
    } else {
      // Normal
      move = this.getHeuristicMove('O', 'X', 1.0);
    }

    if (move) {
      this.makeMove(move.r, move.c);
    }
  }

  getEasyAiMove() {
    // 50% random neighbor, 50% basic block
    if (Math.random() < 0.5) {
      const candidates = [];
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.board[r][c] === '' && this.hasNeighbor(r, c)) {
            candidates.push({ r, c });
          }
        }
      }
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    return this.getHeuristicMove('O', 'X', 0.8);
  }

  // Heuristic Gomoku evaluation
  getHeuristicMove(aiPlayer, humanPlayer, defenseWeight = 1.0) {
    let bestScore = -Infinity;
    let bestMoves = [];

    // Prioritize center if first move
    const center = Math.floor(this.size / 2);
    if (this.board[center][center] === '') {
      if (this.moveHistory.length <= 1) {
        return { r: center, c: center };
      }
    }

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] !== '') continue;
        if (!this.hasNeighbor(r, c)) continue;

        const attackScore = this.evaluatePoint(r, c, aiPlayer);
        const defenseScore = this.evaluatePoint(r, c, humanPlayer);

        // Instant win or critical block
        if (attackScore >= 100000) return { r, c };
        if (defenseScore >= 100000) return { r, c };

        const totalScore = attackScore + (defenseScore * defenseWeight);

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestMoves = [{ r, c }];
        } else if (totalScore === bestScore) {
          bestMoves.push({ r, c });
        }
      }
    }

    if (bestMoves.length === 0) {
      // Fallback
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.board[r][c] === '') return { r, c };
        }
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  hasNeighbor(r, c) {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
          if (this.board[nr][nc] !== '') return true;
        }
      }
    }
    return false;
  }

  evaluatePoint(r, c, player) {
    let totalScore = 0;
    const directions = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal \
      [1, -1]  // Anti-diagonal /
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      let openEnds = 0;

      // Forward direction
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size) break;
        if (this.board[nr][nc] === player) {
          count++;
          step++;
        } else if (this.board[nr][nc] === '') {
          openEnds++;
          break;
        } else {
          break; // Blocked by opponent
        }
      }

      // Backward direction
      step = 1;
      while (true) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size) break;
        if (this.board[nr][nc] === player) {
          count++;
          step++;
        } else if (this.board[nr][nc] === '') {
          openEnds++;
          break;
        } else {
          break; // Blocked by opponent
        }
      }

      totalScore += this.getPatternScore(count, openEnds);
    }

    return totalScore;
  }

  getPatternScore(count, openEnds) {
    if (count >= 5) return 100000;
    if (count === 4) {
      if (openEnds === 2) return 10000; // Open 4: Guaranteed win
      if (openEnds === 1) return 1000;  // Blocked 4
    }
    if (count === 3) {
      if (openEnds === 2) return 1500;  // Open 3
      if (openEnds === 1) return 100;
    }
    if (count === 2) {
      if (openEnds === 2) return 100;
      if (openEnds === 1) return 10;
    }
    return 1;
  }

  checkWin(r, c, player) {
    const directions = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal \
      [1, -1]  // Anti-diagonal /
    ];

    for (const [dr, dc] of directions) {
      const cells = [[r, c]];

      // Check positive
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.board[nr][nc] === player) {
          cells.push([nr, nc]);
          step++;
        } else break;
      }

      // Check negative
      step = 1;
      while (true) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.board[nr][nc] === player) {
          cells.push([nr, nc]);
          step++;
        } else break;
      }

      if (cells.length >= 5) {
        return cells;
      }
    }
    return null;
  }

  undo() {
    if (this.moveHistory.length === 0 || this.isGameOver) return;

    if (this.mode === 'ai') {
      // Undo both AI and player moves
      const movesToUndo = this.currentPlayer === 'O' ? 1 : 2;
      for (let i = 0; i < movesToUndo && this.moveHistory.length > 0; i++) {
        const last = this.moveHistory.pop();
        this.board[last.r][last.c] = '';
      }
      this.currentPlayer = 'X';
    } else {
      // PvP: Undo last single move
      const last = this.moveHistory.pop();
      this.board[last.r][last.c] = '';
      this.currentPlayer = last.player;
    }

    if (window.sound) window.sound.click();
    this.renderBoard();
    this.updateStatus(`Lượt của ${this.currentPlayer === 'X' ? 'Quân X' : 'Quân O'}`);
  }

  async handleGameOver(winner) {
    const isPlayerWin = (this.mode === 'ai' && winner === 'X') || this.mode === 'pvp';

    if (isPlayerWin) {
      if (window.sound) window.sound.win();
      this.stats.wins++;
      this.updateStatus(`🏆 ${winner === 'X' ? 'Quân X (Bạn)' : 'Quân O'} CHIẾN THẮNG!`);

      // Submit score if against AI
      if (this.mode === 'ai' && winner === 'X') {
        const diffMultiplier = this.aiDifficulty === 'hard' ? 2 : 1;
        try {
          const res = await api.submitScore('caro', diffMultiplier, `Thắng AI (${this.aiDifficulty})`);
          if (res.coinsEarned > 0) {
            auth.updateCoins(res.totalCoins);
            showToast(`🎉 Thắng AI! Bạn nhận được +${res.coinsEarned} Xu!`, 'success');
          }
        } catch (e) {
          console.error('Submit caro score error:', e);
        }
      } else {
        showToast(`🎉 ${winner} đã chiến thắng trận đấu!`, 'success');
      }
    } else {
      if (window.sound) window.sound.gameOver();
      this.stats.losses++;
      this.updateStatus('🤖 AI đã chiến thắng! Hãy thử lại nhé!');
      showToast('AI đã giành chiến thắng!', 'info');
    }

    this.updateScoreBoard();
  }

  updateStatus(msg) {
    const statusEl = document.getElementById('caroStatus');
    if (statusEl) statusEl.textContent = msg;
  }

  updateScoreBoard() {
    const winsEl = document.getElementById('caroScoreWins');
    const lossesEl = document.getElementById('caroScoreLosses');
    if (winsEl) winsEl.textContent = this.stats.wins;
    if (lossesEl) lossesEl.textContent = this.stats.losses;
  }
}

window.caroGame = new CaroGame();
