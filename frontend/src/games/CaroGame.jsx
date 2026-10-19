import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitGameScore } from '../features/games/gamesSlice';
import { updateCoins } from '../features/auth/authSlice';
import { sound } from '../utils/sound';

export default function CaroGame({ showToast }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [size, setSize] = useState(15);
  const [board, setBoard] = useState(() => Array(15).fill(null).map(() => Array(15).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [mode, setMode] = useState('ai'); // 'ai' or 'pvp'
  const [aiDiff, setAiDiff] = useState('normal');
  const [isGameOver, setIsGameOver] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [winningCells, setWinningCells] = useState([]);
  const [status, setStatus] = useState('Lượt của bạn (Quân X)');
  const [stats, setStats] = useState({ wins: 0, losses: 0 });

  const resetGame = () => {
    setBoard(Array(size).fill(null).map(() => Array(size).fill('')));
    setCurrentPlayer('X');
    setIsGameOver(false);
    setMoveHistory([]);
    setWinningCells([]);
    setStatus('Lượt của bạn (Quân X)');
  };

  useEffect(() => {
    resetGame();
  }, [size, mode, aiDiff]);

  const handleCellClick = (r, c) => {
    if (board[r][c] !== '' || isGameOver) return;
    makeMove(r, c, currentPlayer);
  };

  const makeMove = (r, c, player) => {
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = player;
    setBoard(newBoard);

    const newHistory = [...moveHistory, { r, c, player }];
    setMoveHistory(newHistory);
    sound.placePiece();

    const winData = checkWin(newBoard, r, c, player);
    if (winData) {
      setIsGameOver(true);
      setWinningCells(winData);
      handleWin(player);
      return;
    }

    if (newHistory.length === size * size) {
      setIsGameOver(true);
      setStatus('Trận đấu hòa!');
      sound.gameOver();
      return;
    }

    const nextPlayer = player === 'X' ? 'O' : 'X';
    setCurrentPlayer(nextPlayer);

    if (mode === 'ai' && nextPlayer === 'O') {
      setStatus('🤖 AI đang suy nghĩ...');
      setTimeout(() => {
        makeAiMove(newBoard, newHistory);
      }, 250);
    } else {
      setStatus(`Lượt của ${nextPlayer === 'X' ? 'Quân X' : 'Quân O'}`);
    }
  };

  const makeAiMove = (currentBoard, currentHistory) => {
    let move = getHeuristicMove(currentBoard, currentHistory);
    if (move) {
      const newBoard = currentBoard.map(row => [...row]);
      newBoard[move.r][move.c] = 'O';
      setBoard(newBoard);

      const updatedHistory = [...currentHistory, { r: move.r, c: move.c, player: 'O' }];
      setMoveHistory(updatedHistory);
      sound.placePiece();

      const winData = checkWin(newBoard, move.r, move.c, 'O');
      if (winData) {
        setIsGameOver(true);
        setWinningCells(winData);
        sound.gameOver();
        setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
        setStatus('🤖 AI đã chiến thắng!');
        showToast('AI đã giành chiến thắng!', 'info');
      } else {
        setCurrentPlayer('X');
        setStatus('Lượt của bạn (Quân X)');
      }
    }
  };

  const getHeuristicMove = (b, hist) => {
    const center = Math.floor(size / 2);
    if (b[center][center] === '' && hist.length <= 1) return { r: center, c: center };

    let bestScore = -Infinity;
    let candidates = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (b[r][c] !== '') continue;
        const attack = evaluatePoint(b, r, c, 'O');
        const defense = evaluatePoint(b, r, c, 'X');
        if (attack >= 100000 || defense >= 100000) return { r, c };

        const score = attack + defense * (aiDiff === 'hard' ? 1.3 : 1.0);
        if (score > bestScore) {
          bestScore = score;
          candidates = [{ r, c }];
        } else if (score === bestScore) {
          candidates.push({ r, c });
        }
      }
    }
    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
  };

  const evaluatePoint = (b, r, c, player) => {
    let total = 0;
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (const [dr, dc] of dirs) {
      let count = 1;
      let open = 0;
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
        if (b[nr][nc] === player) { count++; step++; }
        else if (b[nr][nc] === '') { open++; break; }
        else break;
      }
      step = 1;
      while (true) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
        if (b[nr][nc] === player) { count++; step++; }
        else if (b[nr][nc] === '') { open++; break; }
        else break;
      }
      if (count >= 5) total += 100000;
      else if (count === 4) total += open === 2 ? 10000 : 1000;
      else if (count === 3) total += open === 2 ? 1500 : 100;
      else if (count === 2) total += open === 2 ? 100 : 10;
    }
    return total;
  };

  const checkWin = (b, r, c, player) => {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (const [dr, dc] of dirs) {
      const cells = [[r, c]];
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && b[nr][nc] === player) {
          cells.push([nr, nc]);
          step++;
        } else break;
      }
      step = 1;
      while (true) {
        const nr = r - dr * step;
        const nc = c - dc * step;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && b[nr][nc] === player) {
          cells.push([nr, nc]);
          step++;
        } else break;
      }
      if (cells.length >= 5) return cells;
    }
    return null;
  };

  const handleWin = async (winner) => {
    sound.win();
    setStatus(`🏆 ${winner === 'X' ? 'Quân X (Bạn)' : 'Quân O'} CHIẾN THẮNG!`);
    setStats(prev => ({ ...prev, wins: prev.wins + 1 }));

    if (mode === 'ai' && winner === 'X') {
      const res = await dispatch(submitGameScore({
        game: 'caro',
        score: aiDiff === 'hard' ? 2 : 1,
        details: `Thắng AI (${aiDiff})`
      })).unwrap();

      if (res.coinsEarned > 0) {
        dispatch(updateCoins(res.totalCoins));
        showToast(`🎉 Thắng AI! Nhận +${res.coinsEarned} Xu!`, 'success');
      }
    }
  };

  const handleUndo = () => {
    if (moveHistory.length === 0 || isGameOver) return;
    const count = mode === 'ai' ? 2 : 1;
    const newHistory = [...moveHistory];
    const newBoard = board.map(row => [...row]);

    for (let i = 0; i < count && newHistory.length > 0; i++) {
      const last = newHistory.pop();
      newBoard[last.r][last.c] = '';
    }

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setCurrentPlayer('X');
    setStatus('Lượt của bạn (Quân X)');
    sound.click();
    showToast('Đã hoàn tác!', 'info');
  };

  return (
    <div className="game-arena-layout">
      <div className="game-main-panel">
        <div className="caro-board-wrapper">
          <div
            className="caro-board"
            style={{
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              gridTemplateRows: `repeat(${size}, 1fr)`
            }}
          >
            {board.map((row, r) =>
              row.map((val, c) => {
                const isLast = moveHistory.length > 0 && moveHistory[moveHistory.length - 1].r === r && moveHistory[moveHistory.length - 1].c === c;
                const isWin = winningCells.some(([wr, wc]) => wr === r && wc === c);
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`caro-cell ${val ? `val-${val.toLowerCase()}` : ''} ${isLast ? 'last-move' : ''} ${isWin ? 'win-cell' : ''}`}
                    onClick={() => handleCellClick(r, c)}
                  >
                    {val}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="game-side-panel">
        <div className="panel-card">
          <h3 className="panel-title">🎮 Bảng Điều Khiển Caro</h3>

          <div className="form-group">
            <label>Chế độ chơi:</label>
            <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="ai">Chơi với AI Máy tính</option>
              <option value="pvp">2 Người chơi (PvP Local)</option>
            </select>
          </div>

          {mode === 'ai' && (
            <div className="form-group">
              <label>Độ khó AI:</label>
              <select className="form-select" value={aiDiff} onChange={(e) => setAiDiff(e.target.value)}>
                <option value="easy">Dễ (Tập sự)</option>
                <option value="normal">Vừa (Chiến thuật)</option>
                <option value="hard">Cực khó (Bất bại)</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Kích thước bàn cờ:</label>
            <select className="form-select" value={size} onChange={(e) => setSize(Number(e.target.value))}>
              <option value={15}>15 x 15 (Chuẩn Gomoku)</option>
              <option value={10}>10 x 10 (Nhanh gọn)</option>
            </select>
          </div>

          <div className="caro-status-box">
            <div className="status-label">Trạng thái:</div>
            <div className="status-value">{status}</div>
          </div>

          <div className="match-score-tracker">
            <div className="score-pill score-win">
              <span>Thắng:</span>
              <strong>{stats.wins}</strong>
            </div>
            <div className="score-pill score-loss">
              <span>Thua:</span>
              <strong>{stats.losses}</strong>
            </div>
          </div>

          <div className="button-group">
            <button className="btn btn-outline btn-block" onClick={handleUndo}>↩️ Hoàn tác</button>
            <button className="btn btn-primary btn-block" onClick={resetGame}>🔄 Trận Mới</button>
          </div>

          <div className="game-rule-note">
            💡 <strong>Luật chơi:</strong> Đặt 5 quân cờ liên tiếp theo hàng ngang, dọc hoặc chéo để chiến thắng.
          </div>
        </div>
      </div>
    </div>
  );
}
