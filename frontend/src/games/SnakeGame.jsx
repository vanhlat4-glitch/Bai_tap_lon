import React, { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { submitGameScore } from '../features/games/gamesSlice';
import { updateCoins } from '../features/auth/authSlice';
import { sound } from '../utils/sound';

export default function SnakeGame({ showToast }) {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snake_highscore') || '0', 10));
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');

  const gameState = useRef({
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    vel: { x: 1, y: 0 },
    nextVel: { x: 1, y: 0 },
    food: { x: 5, y: 5 },
    goldenFood: null,
    particles: [],
    speed: 110,
    running: false
  });

  const gridSize = 20;
  const tileCount = 20;

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { vel, running } = gameState.current;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (vel.y === 0) gameState.current.nextVel = { x: 0, y: -1 };
        if (!running) startGame();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (vel.y === 0) gameState.current.nextVel = { x: 0, y: 1 };
        if (!running) startGame();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (vel.x === 0) gameState.current.nextVel = { x: -1, y: 0 };
        if (!running) startGame();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (vel.x === 0) gameState.current.nextVel = { x: 1, y: 0 };
        if (!running) startGame();
      } else if (e.key === ' ') {
        toggleStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    draw();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const spawnFood = () => {
    let x, y;
    while (true) {
      x = Math.floor(Math.random() * tileCount);
      y = Math.floor(Math.random() * tileCount);
      if (!gameState.current.snake.some(s => s.x === x && s.y === y)) break;
    }
    gameState.current.food = { x, y };
  };

  const spawnGoldenFood = () => {
    let x, y;
    while (true) {
      x = Math.floor(Math.random() * tileCount);
      y = Math.floor(Math.random() * tileCount);
      if (!gameState.current.snake.some(s => s.x === x && s.y === y) && (x !== gameState.current.food.x || y !== gameState.current.food.y)) break;
    }
    gameState.current.goldenFood = { x, y, expireAt: Date.now() + 8000 };
  };

  const startGame = () => {
    gameState.current = {
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      vel: { x: 1, y: 0 },
      nextVel: { x: 1, y: 0 },
      food: { x: 5, y: 5 },
      goldenFood: null,
      particles: [],
      speed: 110,
      running: true
    };
    setScore(0);
    setIsRunning(true);
    setIsGameOver(false);
  };

  const toggleStart = () => {
    if (gameState.current.running) {
      gameState.current.running = false;
      setIsRunning(false);
    } else {
      gameState.current.running = true;
      setIsRunning(true);
    }
  };

  // Game loop tick
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tick();
    }, gameState.current.speed);

    return () => clearInterval(interval);
  }, [isRunning]);

  const tick = () => {
    const s = gameState.current;
    if (!s.running) return;

    s.vel = { ...s.nextVel };
    const head = { x: s.snake[0].x + s.vel.x, y: s.snake[0].y + s.vel.y };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      handleGameOver('Đâm vào tường!');
      return;
    }

    // Self collision
    if (s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      handleGameOver('Tự cắn vào đuôi!');
      return;
    }

    s.snake.unshift(head);
    let ate = false;

    // Eat normal food
    if (head.x === s.food.x && head.y === s.food.y) {
      ate = true;
      sound.eatFood();
      setScore(prev => prev + 10);
      spawnFood();
      if (!s.goldenFood && Math.random() < 0.25) spawnGoldenFood();
    }

    // Eat golden food
    if (s.goldenFood && head.x === s.goldenFood.x && head.y === s.goldenFood.y) {
      ate = true;
      sound.bonus();
      setScore(prev => prev + 35);
      s.goldenFood = null;
    }

    if (s.goldenFood && Date.now() > s.goldenFood.expireAt) {
      s.goldenFood = null;
    }

    if (!ate) s.snake.pop();

    draw();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = gameState.current;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Food
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#10b981';
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(s.food.x * gridSize + 10, s.food.y * gridSize + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Golden Food
    if (s.goldenFood) {
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#f59e0b';
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(s.goldenFood.x * gridSize + 10, s.goldenFood.y * gridSize + 10, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Snake
    s.snake.forEach((seg, i) => {
      ctx.save();
      if (i === 0) {
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#38bdf8';
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2, 6);
        ctx.fill();
      } else {
        const ratio = i / s.snake.length;
        ctx.fillStyle = `rgb(${56 - ratio * 30}, ${189 - ratio * 80}, ${248 - ratio * 30})`;
        ctx.beginPath();
        ctx.roundRect(seg.x * gridSize + 2, seg.y * gridSize + 2, gridSize - 4, gridSize - 4, 4);
        ctx.fill();
      }
      ctx.restore();
    });
  };

  const handleGameOver = async (reason) => {
    gameState.current.running = false;
    setIsRunning(false);
    setIsGameOver(true);
    setGameOverReason(reason);
    sound.gameOver();

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_highscore', score.toString());
    }

    if (score > 0) {
      const res = await dispatch(submitGameScore({
        game: 'snake',
        score,
        details: `Độ dài rắn: ${gameState.current.snake.length}`
      })).unwrap();

      if (res.coinsEarned > 0) {
        dispatch(updateCoins(res.totalCoins));
        showToast(`🐍 Rắn săn mồi: +${res.coinsEarned} Xu thưởng!`, 'success');
      }
    }
  };

  const setDir = (dx, dy) => {
    const { vel } = gameState.current;
    if (vel.x !== 0 && dx === -vel.x) return;
    if (vel.y !== 0 && dy === -vel.y) return;
    gameState.current.nextVel = { x: dx, y: dy };
    if (!gameState.current.running) startGame();
  };

  return (
    <div className="game-arena-layout">
      <div className="game-main-panel">
        <div className="snake-canvas-wrapper">
          <canvas ref={canvasRef} width="400" height="400" />

          {(!isRunning || isGameOver) && (
            <div className="canvas-overlay">
              <div className="overlay-box">
                <h3 className="overlay-title">{isGameOver ? 'Trò Chơi Kết Thúc!' : 'Cyber Snake 2.0'}</h3>
                <p className="overlay-desc">
                  {isGameOver ? `${gameOverReason} Điểm: ${score}` : 'Dùng phím mũi tên hoặc WASD để di chuyển.'}
                </p>
                <button className="btn btn-primary btn-lg" onClick={startGame}>
                  {isGameOver ? 'Chơi Lại' : 'Bắt Đầu Chơi Ngay'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile D-Pad */}
        <div className="mobile-dpad">
          <button className="dpad-btn dpad-up" onClick={() => setDir(0, -1)}>▲</button>
          <div className="dpad-horizontal">
            <button className="dpad-btn dpad-left" onClick={() => setDir(-1, 0)}>◀</button>
            <button className="dpad-btn dpad-right" onClick={() => setDir(1, 0)}>▶</button>
          </div>
          <button className="dpad-btn dpad-down" onClick={() => setDir(0, 1)}>▼</button>
        </div>
      </div>

      <div className="game-side-panel">
        <div className="panel-card">
          <h3 className="panel-title">🐍 Điểm Số & Điều Khiển</h3>

          <div className="scores-display-row">
            <div className="score-card">
              <div className="score-label">ĐIỂM HIỆN TẠI</div>
              <div className="score-number highlight">{score}</div>
            </div>
            <div className="score-card">
              <div className="score-label">KỶ LỤC CỦA BẠN</div>
              <div className="score-number">{highScore}</div>
            </div>
          </div>

          <div className="button-group" style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-primary btn-block" onClick={toggleStart}>
              {isRunning ? 'Tạm Dừng' : 'Bắt Đầu Chơi'}
            </button>
          </div>

          <div className="food-legend">
            <h4>Vật phẩm:</h4>
            <div className="legend-item"><span className="legend-dot green"></span><span>Táo Xanh: +10đ</span></div>
            <div className="legend-item"><span className="legend-dot gold"></span><span>Táo Vàng (8s): +35đ & X2 Xu</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
