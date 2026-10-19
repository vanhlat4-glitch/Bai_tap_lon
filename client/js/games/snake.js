// Cyber Snake 2.0 Engine
class SnakeGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gridSize = 20; // 20px per cell
    this.tileCount = 20; // 20x20 grid = 400x400 canvas
    
    this.snake = [];
    this.velocity = { x: 0, y: 0 };
    this.nextVelocity = { x: 0, y: 0 };
    
    this.food = { x: 5, y: 5, type: 'normal' };
    this.goldenFood = null; // { x, y, expireAt }
    
    this.score = 0;
    this.highScore = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.gameLoopInterval = null;
    this.speed = 110; // ms per tick

    this.particles = [];
  }

  init() {
    this.canvas = document.getElementById('snakeCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.highScore = parseInt(localStorage.getItem('snake_highscore') || '0', 10);
    this.updateHighScoreDisplay();

    this.setupControls();
    this.reset();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      // Prevent default scrolling for game keys if active tab is snake
      const activeTab = document.querySelector('.game-tab-btn.active');
      if (activeTab && activeTab.dataset.game === 'snake') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault();
        }
      }

      this.handleInput(e.key);
    });

    // Touch D-Pad buttons
    const btnUp = document.getElementById('snakeUp');
    const btnDown = document.getElementById('snakeDown');
    const btnLeft = document.getElementById('snakeLeft');
    const btnRight = document.getElementById('snakeRight');

    if (btnUp) btnUp.onclick = () => this.handleDirection(0, -1);
    if (btnDown) btnDown.onclick = () => this.handleDirection(0, 1);
    if (btnLeft) btnLeft.onclick = () => this.handleDirection(-1, 0);
    if (btnRight) btnRight.onclick = () => this.handleDirection(1, 0);

    const startBtn = document.getElementById('snakeStartBtn');
    if (startBtn) startBtn.onclick = () => this.toggleStart();

    const restartBtn = document.getElementById('snakeRestartBtn');
    if (restartBtn) restartBtn.onclick = () => {
      this.reset();
      this.start();
    };
  }

  handleInput(key) {
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.handleDirection(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.handleDirection(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.handleDirection(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.handleDirection(1, 0);
        break;
      case ' ':
        this.togglePause();
        break;
    }
  }

  handleDirection(dx, dy) {
    if (!this.isRunning) {
      this.start();
    }
    // Prevent 180-degree immediate reverse
    if (this.velocity.x !== 0 && dx === -this.velocity.x) return;
    if (this.velocity.y !== 0 && dy === -this.velocity.y) return;

    this.nextVelocity = { x: dx, y: dy };
  }

  reset() {
    clearInterval(this.gameLoopInterval);
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.speed = 110;
    this.particles = [];
    this.goldenFood = null;

    this.updateScoreDisplay();

    // Start in middle
    const startX = Math.floor(this.tileCount / 2);
    const startY = Math.floor(this.tileCount / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];

    this.velocity = { x: 1, y: 0 };
    this.nextVelocity = { x: 1, y: 0 };

    this.spawnFood();
    this.draw();

    const overlay = document.getElementById('snakeOverlay');
    if (overlay) overlay.classList.remove('hidden');

    const startBtn = document.getElementById('snakeStartBtn');
    if (startBtn) startBtn.textContent = 'Bắt đầu chơi (Phím cách)';
  }

  toggleStart() {
    if (this.isRunning) {
      this.togglePause();
    } else {
      this.start();
    }
  }

  togglePause() {
    if (!this.isRunning) return;
    this.isPaused = !this.isPaused;
    const startBtn = document.getElementById('snakeStartBtn');
    if (startBtn) startBtn.textContent = this.isPaused ? 'Tiếp tục' : 'Tạm dừng';
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;

    const overlay = document.getElementById('snakeOverlay');
    if (overlay) overlay.classList.add('hidden');

    const startBtn = document.getElementById('snakeStartBtn');
    if (startBtn) startBtn.textContent = 'Tạm dừng';

    this.gameLoopInterval = setInterval(() => this.tick(), this.speed);
  }

  tick() {
    if (!this.isRunning || this.isPaused) return;

    this.velocity = { ...this.nextVelocity };
    const head = {
      x: this.snake[0].x + this.velocity.x,
      y: this.snake[0].y + this.velocity.y
    };

    // Wall collision
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.gameOver('Đâm vào tường!');
      return;
    }

    // Self collision
    for (let i = 0; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.gameOver('Tự cắn vào đuôi!');
        return;
      }
    }

    this.snake.unshift(head);

    // Check normal food
    let ateFood = false;
    if (head.x === this.food.x && head.y === this.food.y) {
      ateFood = true;
      this.score += 10;
      this.createParticles(this.food.x, this.food.y, '#10b981');
      if (window.sound) window.sound.eatFood();
      this.spawnFood();

      // Chance to spawn Golden Apple (15%)
      if (!this.goldenFood && Math.random() < 0.25) {
        this.spawnGoldenFood();
      }

      // Slightly increase speed
      if (this.speed > 60 && this.score % 40 === 0) {
        this.speed -= 5;
        clearInterval(this.gameLoopInterval);
        this.gameLoopInterval = setInterval(() => this.tick(), this.speed);
      }
    }

    // Check Golden Food
    if (this.goldenFood && head.x === this.goldenFood.x && head.y === this.goldenFood.y) {
      ateFood = true;
      this.score += 35;
      this.createParticles(this.goldenFood.x, this.goldenFood.y, '#fbbf24', 20);
      if (window.sound) window.sound.bonus();
      this.goldenFood = null;
    }

    // Expire golden food
    if (this.goldenFood && Date.now() > this.goldenFood.expireAt) {
      this.goldenFood = null;
    }

    if (!ateFood) {
      this.snake.pop(); // Remove tail
    }

    this.updateScoreDisplay();
    this.updateParticles();
    this.draw();
  }

  spawnFood() {
    let newX, newY;
    let collision = true;
    while (collision) {
      newX = Math.floor(Math.random() * this.tileCount);
      newY = Math.floor(Math.random() * this.tileCount);
      collision = this.snake.some(segment => segment.x === newX && segment.y === newY);
    }
    this.food = { x: newX, y: newY };
  }

  spawnGoldenFood() {
    let newX, newY;
    let collision = true;
    while (collision) {
      newX = Math.floor(Math.random() * this.tileCount);
      newY = Math.floor(Math.random() * this.tileCount);
      collision = this.snake.some(segment => segment.x === newX && segment.y === newY) ||
                  (this.food.x === newX && this.food.y === newY);
    }
    this.goldenFood = {
      x: newX,
      y: newY,
      expireAt: Date.now() + 8000 // 8 seconds
    };
  }

  createParticles(tileX, tileY, color, count = 10) {
    const px = tileX * this.gridSize + this.gridSize / 2;
    const py = tileY * this.gridSize + this.gridSize / 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Normal Food (Glowing Emerald)
    const fx = this.food.x * this.gridSize + this.gridSize / 2;
    const fy = this.food.y * this.gridSize + this.gridSize / 2;
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#10b981';
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(fx, fy, this.gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Golden Food (Pulsing Amber)
    if (this.goldenFood) {
      const gx = this.goldenFood.x * this.gridSize + this.gridSize / 2;
      const gy = this.goldenFood.y * this.gridSize + this.gridSize / 2;
      const timeLeftRatio = (this.goldenFood.expireAt - Date.now()) / 8000;
      const pulse = 1 + Math.sin(Date.now() / 150) * 0.15;

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#f59e0b';
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(gx, gy, (this.gridSize / 2) * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Mini countdown ring
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx, gy, (this.gridSize / 2) + 3, 0, Math.PI * 2 * Math.max(0, timeLeftRatio));
      ctx.stroke();
      ctx.restore();
    }

    // Snake Body
    for (let i = this.snake.length - 1; i >= 0; i--) {
      const segment = this.snake[i];
      const sx = segment.x * this.gridSize;
      const sy = segment.y * this.gridSize;

      ctx.save();
      if (i === 0) {
        // Head: Neon Cyan with glow
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#38bdf8';
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(sx + 1, sy + 1, this.gridSize - 2, this.gridSize - 2, 6);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#0f172a';
        const eyeOffset = 5;
        ctx.beginPath();
        ctx.arc(sx + eyeOffset, sy + eyeOffset, 2, 0, Math.PI * 2);
        ctx.arc(sx + this.gridSize - eyeOffset, sy + eyeOffset, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body: Gradient Cyan to Indigo
        const ratio = i / this.snake.length;
        ctx.fillStyle = `rgb(${56 - ratio * 30}, ${189 - ratio * 80}, ${248 - ratio * 30})`;
        ctx.beginPath();
        ctx.roundRect(sx + 2, sy + 2, this.gridSize - 4, this.gridSize - 4, 4);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  async gameOver(reason) {
    clearInterval(this.gameLoopInterval);
    this.isRunning = false;
    if (window.sound) window.sound.gameOver();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snake_highscore', this.highScore.toString());
      this.updateHighScoreDisplay();
    }

    const overlay = document.getElementById('snakeOverlay');
    const overlayTitle = document.getElementById('snakeOverlayTitle');
    const overlayMsg = document.getElementById('snakeOverlayMsg');
    if (overlayTitle) overlayTitle.textContent = 'Trò Chơi Kết Thúc!';
    if (overlayMsg) overlayMsg.textContent = `${reason} Điểm số đạt được: ${this.score}`;
    if (overlay) overlay.classList.remove('hidden');

    const startBtn = document.getElementById('snakeStartBtn');
    if (startBtn) startBtn.textContent = 'Chơi lại';

    // Submit score
    if (this.score > 0) {
      try {
        const res = await api.submitScore('snake', this.score, `Độ dài rắn: ${this.snake.length}`);
        if (res.coinsEarned > 0) {
          auth.updateCoins(res.totalCoins);
          showToast(`🐍 Rắn săn mồi: +${res.coinsEarned} Xu thưởng!`, 'success');
        }
      } catch (e) {
        console.error('Submit snake score error:', e);
      }
    }
  }

  updateScoreDisplay() {
    const curEl = document.getElementById('snakeScore');
    if (curEl) curEl.textContent = this.score;
  }

  updateHighScoreDisplay() {
    const highEl = document.getElementById('snakeHighScore');
    if (highEl) highEl.textContent = this.highScore;
  }
}

window.snakeGame = new SnakeGame();
