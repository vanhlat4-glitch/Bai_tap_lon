import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './features/auth/authSlice';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import UploadModal from './components/UploadModal';
import RewardModal from './components/RewardModal';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import WheelPage from './pages/WheelPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ShopPage from './pages/ShopPage';
import AdminPage from './pages/AdminPage';
import './App.css';

export default function App() {
  const dispatch = useDispatch();
  const { user, initializing } = useSelector(state => state.auth);

  const [currentView, setView] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [prizeMsg, setPrizeMsg] = useState('');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handlePrizeWon = (prize, message) => {
    setWonPrize(prize);
    setPrizeMsg(message);
    triggerConfetti();
  };

  const triggerConfetti = () => {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];
    for (let i = 0; i < 50; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
      p.style.opacity = Math.random() + 0.5;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3500);
    }
  };

  const toastContainer = (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="toast-text">{t.message}</span>
        </div>
      ))}
    </div>
  );

  // 1. Initializing state (verifying existing session token)
  if (initializing) {
    return (
      <div className="app-root">
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>
        <div className="cyber-loader-container">
          <div className="cyber-spinner"></div>
          <p className="cyber-loader-text">Đang kết nối Cyber Hub...</p>
        </div>
        {toastContainer}
      </div>
    );
  }

  // 2. Not logged in -> Show AuthPage (Login / Register Gate)
  if (!user) {
    return (
      <div className="app-root">
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>
        <div className="auth-page-wrapper">
          <AuthPage showToast={showToast} />
        </div>
        {toastContainer}
      </div>
    );
  }

  // 3. Authenticated -> Show Full Game Hub
  return (
    <div className="app-root">
      {/* Ambient background glow orbs */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setView={setView}
        openAuth={openAuth}
        openUpload={() => setUploadModalOpen(true)}
        showToast={showToast}
      />

      {/* Page Routing */}
      <main className="app-main container">
        {currentView === 'home' && <HomePage setView={setView} />}
        {currentView === 'games' && <GamesPage showToast={showToast} />}
        {currentView === 'wheel' && (
          <WheelPage showToast={showToast} onPrizeWon={handlePrizeWon} openAuth={openAuth} />
        )}
        {currentView === 'leaderboard' && <LeaderboardPage />}
        {currentView === 'shop' && <ShopPage showToast={showToast} openAuth={openAuth} />}
        {currentView === 'admin' && <AdminPage showToast={showToast} />}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        showToast={showToast}
      />

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        showToast={showToast}
      />

      <RewardModal
        prize={wonPrize}
        message={prizeMsg}
        onClose={() => setWonPrize(null)}
      />

      {/* Floating Toast Notification Container */}
      {toastContainer}
    </div>
  );
}
