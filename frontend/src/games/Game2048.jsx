import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { submitGameScore } from '../features/games/gamesSlice';
import { updateCoins } from '../features/auth/authSlice';
import { sound } from '../utils/sound';

export default function Game2048({ showToast }) {
  const dispatch = useDispatch();
  const [grid, setGrid] = useState(() => Array(4).fill(null).map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('2048_bestscore') || '0', 10));
  const [isOver, setIsOver] = useState(false);
  const [prevState, setPrevState] = useState(null);

  const initGame = () => {
    let newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    newGrid = addRandom(addRandom(newGrid));
    setGrid(newGrid);
    setScore(0);
    setIsOver(false);
    setPrevState(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  const addRandom = (g) => {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length === 0) return g;
    const spot = empty[Math.floor(Math.random() * empty.length)];
    const clone = g.map(row => [...row]);
    clone[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
    return clone;
  };

  const move = (direction) => {
    if (isOver) return;

    setPrevState({ grid: grid.map(r => [...r]), score });

    let rotated = grid.map(r => [...r]);
    let rotations = 0;
    if (direction === 'up') rotations = 3;
    if (direction === 'right') rotations = 2;
    if (direction === 'down') rotations = 1;

    const rotate = (m) => m[0].map((_, c) => m.map(r => r[c]).reverse());
    for (let i = 0; i < rotations; i++) rotated = rotate(rotated);

    let moved = false;
    let added = 0;

    for (let r = 0; r < 4; r++) {
      const row = rotated[r].filter(v => v !== 0);
      const newRow = [];
      for (let c = 0; c < row.length; c++) {
        if (c < row.length - 1 && row[c] === row[c + 1]) {
          const merged = row[c] * 2;
          newRow.push(merged);
          added += merged;
          c++;
        } else {
          newRow.push(row[c]);
        }
      }
      while (newRow.length < 4) newRow.push(0);
      for (let c = 0; c < 4; c++) {
        if (rotated[r][c] !== newRow[c]) moved = true;
        rotated[r][c] = newRow[c];
      }
    }

    const restore = (4 - rotations) % 4;
    for (let i = 0; i < restore; i++) rotated = rotate(rotated);

    if (moved) {
      const nextGrid = addRandom(rotated);
      const nextScore = score + added;
      setGrid(nextGrid);
      setScore(nextScore);

      if (added > 0) sound.merge2048(added);
      else sound.click();

      if (nextScore > bestScore) {
        setBestScore(nextScore);
        localStorage.setItem('2048_bestscore', nextScore.toString());
      }

      if (checkGameOver(nextGrid)) {
        setIsOver(true);
        handleEnd(nextScore);
      }
    }
  };

  const checkGameOver = (g) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return false;
        if (r < 3 && g[r][c] === g[r + 1][c]) return false;
        if (c < 3 && g[r][c] === g[r][c + 1]) return false;
      }
    }
    return true;
  };

  const handleEnd = async (finalScore) => {
    sound.gameOver();
    if (finalScore > 0) {
      const res = await dispatch(submitGameScore({
        game: '2048',
        score: finalScore,
        details: 'Điểm 2048'
      })).unwrap();

      if (res.coinsEarned > 0) {
        dispatch(updateCoins(res.totalCoins));
        showToast(`💎 2048: +${res.coinsEarned} Xu thưởng!`, 'success');
      }
    }
  };

  const undo = () => {
    if (!prevState) {
      showToast('Không có nước đi nào để hoàn tác!', 'info');
      return;
    }
    setGrid(prevState.grid);
    setScore(prevState.score);
    setPrevState(null);
    sound.click();
    showToast('Đã hoàn tác 1 nước đi!', 'info');
  };

  return (
    <div className="game-arena-layout">
      <div className="game-main-panel">
        <div className="g2048-board-wrapper">
          <div className="g2048-board">
            {grid.map((row, r) =>
              row.map((val, c) => (
                <div key={`${r}-${c}`} className={`tile-2048 ${val > 0 ? `tile-${val}` : 'tile-empty'}`}>
                  {val > 0 ? val : ''}
                </div>
              ))
            )}
          </div>

          {isOver && (
            <div className="canvas-overlay">
              <div className="overlay-box">
                <h3 className="overlay-title">Trò Chơi Kết Thúc!</h3>
                <p className="overlay-desc">Điểm số đạt được: {score.toLocaleString('vi-VN')}</p>
                <button className="btn btn-primary btn-lg" onClick={initGame}>Chơi Ván Mới</button>
              </div>
            </div>
          )}
        </div>

        {/* Direction buttons */}
        <div className="mobile-dpad">
          <button className="dpad-btn dpad-up" onClick={() => move('up')}>▲</button>
          <div className="dpad-horizontal">
            <button className="dpad-btn dpad-left" onClick={() => move('left')}>◀</button>
            <button className="dpad-btn dpad-right" onClick={() => move('right')}>▶</button>
          </div>
          <button className="dpad-btn dpad-down" onClick={() => move('down')}>▼</button>
        </div>
      </div>

      <div className="game-side-panel">
        <div className="panel-card">
          <h3 className="panel-title">🔢 Điểm Số & Hoàn Tác</h3>

          <div className="scores-display-row">
            <div className="score-card">
              <div className="score-label">ĐIỂM SỐ</div>
              <div className="score-number highlight">{score.toLocaleString('vi-VN')}</div>
            </div>
            <div className="score-card">
              <div className="score-label">KỶ LỤC</div>
              <div className="score-number">{bestScore.toLocaleString('vi-VN')}</div>
            </div>
          </div>

          <div className="button-group" style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-outline btn-block" onClick={undo}>↩️ Hoàn Tác Nước Đi</button>
            <button className="btn btn-primary btn-block" onClick={initGame}>🔄 Ván Mới</button>
          </div>

          <div className="game-rule-note">
            💡 <strong>Mẹo:</strong> Gom các số lớn nhất về một góc để tạo dây chuyền kết hợp!
          </div>
        </div>
      </div>
    </div>
  );
}
