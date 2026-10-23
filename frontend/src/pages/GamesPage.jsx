import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveGame } from '../features/games/gamesSlice';
import CaroGame from '../games/CaroGame';
import SnakeGame from '../games/SnakeGame';
import Game2048 from '../games/Game2048';
import { useThemeLang } from '../context/ThemeLanguageContext';
import { sound } from '../utils/sound';

export default function GamesPage({ showToast }) {
  const dispatch = useDispatch();
  const { activeGame } = useSelector(state => state.games);
  const { lang, t } = useThemeLang();

  const handleTabChange = (gameKey) => {
    sound.click();
    dispatch(setActiveGame(gameKey));
  };

  return (
    <div>
      <div className="game-tabs-nav">
        <button
          className={`game-tab-btn ${activeGame === 'caro' ? 'active' : ''}`}
          onClick={() => handleTabChange('caro')}
        >
          ⭕❌ {t('games.caroTitle')}
        </button>
        <button
          className={`game-tab-btn ${activeGame === 'snake' ? 'active' : ''}`}
          onClick={() => handleTabChange('snake')}
        >
          🐍 {t('games.snakeTitle')}
        </button>
        <button
          className={`game-tab-btn ${activeGame === '2048' ? 'active' : ''}`}
          onClick={() => handleTabChange('2048')}
        >
          🔢 {t('games.game2048Title')}
        </button>
      </div>

      <div>
        {activeGame === 'caro' && <CaroGame showToast={showToast} />}
        {activeGame === 'snake' && <SnakeGame showToast={showToast} />}
        {activeGame === '2048' && <Game2048 showToast={showToast} />}
      </div>
    </div>
  );
}
