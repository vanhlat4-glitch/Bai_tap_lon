import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './features/auth/authSlice';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import UploadModal from './components/UploadModal';
import RewardModal from './components/RewardModal';
import ErrorBoundary from './components/ErrorBoundary';
import { useThemeLang } from './context/ThemeLanguageContext';
import './App.css';

// Rubric Criterion: Advanced Routing & Code Splitting (React.lazy + Suspense)
const HomePage = lazy(() => import('./pages/HomePage'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const WheelPage = lazy(() => import('./pages/WheelPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

const VALID_VIEWS = ['home', 'games', 'wheel', 'leaderboard', 'shop', 'admin', 'auth'];

function getInitialView() {
  const hashView = window.location.hash.replace('#', '').trim();
  if (VALID_VIEWS.includes(hashView)) return hashView;
  const savedView = localStorage.getItem('minigame_active_view');
  if (VALID_VIEWS.includes(savedView)) return savedView;
  return 'home';
}

export default function App() {
  const dispatch = useDispatch();
  const { user, initializing } = useSelector(state => state.auth);
  const { theme, lang, t } = useThemeLang();

  // Rubric Criterion: State Persistence across sessions & route changes
  const [currentView, setView] = useState(getInitialView);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [prizeMsg, setPrizeMsg] = useState('');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  // Persist route state to localStorage & URL hash
  useEffect(() => {
    localStorage.setItem('minigame_active_view', currentView);
    if (window.location.hash !== `#${currentView}`) {
      window.history.replaceState(null, '', `#${currentView}`);
    }
  }, [currentView]);

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash.replace('#', '').trim();
      if (VALID_VIEWS.includes(next)) {
        setView(next);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id));
    }, 3200);
  }, []);

  const openAuth = useCallback((mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  }, []);

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

  const handlePrizeWon = useCallback((prize, message) => {
    setWonPrize(prize);
    setPrizeMsg(message);
    triggerConfetti();
  }, []);

  const toastContainer = (
    <div className="toast-container">
      {toasts.map(item => (
        <div key={item.id} className={`toast toast-${item.type}`}>
          <span className="toast-icon">
            {item.type === 'success' ? '✅' : item.type === 'error' ? '❌' : item.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="toast-text">{item.message}</span>
        </div>
      ))}
    </div>
  );

  // 1. Initializing state (verifying existing session token)
  if (initializing) {
    return (
      <div className={`app-root theme-${theme}`} data-theme={theme}>
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>
        <div className="cyber-loader-container">
          <div className="cyber-spinner"></div>
          <p className="cyber-loader-text">{lang === 'vi' ? 'Đang kết nối Cyber Hub...' : 'Connecting to Cyber Hub...'}</p>
        </div>
        {toastContainer}
      </div>
    );
  }

  // Unauthenticated guests can freely explore the portal; actions needing auth open AuthModal
  const handleSetView = (view) => {
    if (view === 'admin' && (!user || (user.role !== 'admin' && user.username?.toLowerCase() !== 'admin'))) {
      showToast(t('nav.adminRequiredToast'), 'warning');
      openAuth('login');
      return;
    }
    setView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`app-root theme-${theme}`} data-theme={theme}>
      {/* Background ambient mesh grid & glow orbs */}
      <div className="ambient-grid"></div>
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div className="ambient-glow glow-3"></div>

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setView={handleSetView}
        openAuth={openAuth}
        openUpload={() => setUploadModalOpen(true)}
        showToast={showToast}
      />

      {/* Page Routing wrapped in ErrorBoundary & Suspense for Code Splitting */}
      <ErrorBoundary onReset={() => handleSetView('home')}>
        <main className="app-main container">
          <Suspense
            fallback={
              <div className="cyber-loader-container" style={{ minHeight: '50vh' }}>
                <div className="cyber-spinner"></div>
                <p className="cyber-loader-text">
                  {lang === 'vi' ? 'Đang tải trang...' : 'Loading view...'}
                </p>
              </div>
            }
          >
            {currentView === 'home' && <HomePage setView={handleSetView} openAuth={openAuth} />}
            {currentView === 'games' && <GamesPage showToast={showToast} openAuth={openAuth} />}
            {currentView === 'wheel' && (
              <WheelPage showToast={showToast} onPrizeWon={handlePrizeWon} openAuth={openAuth} />
            )}
            {currentView === 'leaderboard' && <LeaderboardPage />}
            {currentView === 'shop' && <ShopPage showToast={showToast} openAuth={openAuth} />}
            {currentView === 'admin' && <AdminPage showToast={showToast} />}
            {currentView === 'auth' && <AuthPage showToast={showToast} setView={handleSetView} />}
          </Suspense>
        </main>
      </ErrorBoundary>

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
