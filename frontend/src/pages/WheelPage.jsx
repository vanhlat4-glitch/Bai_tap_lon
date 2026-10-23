import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateCoins } from '../features/auth/authSlice';
import { useThemeLang } from '../context/ThemeLanguageContext';
import { sound } from '../utils/sound';

const WHEEL_SEGMENTS = [
  { id: 0, label: '+10 Xu', labelEn: '+10 Coins', type: 'coins', value: 10, color: '#f59e0b' },
  { id: 1, label: '+25 Xu', labelEn: '+25 Coins', type: 'coins', value: 25, color: '#10b981' },
  { id: 2, label: '+50 Xu', labelEn: '+50 Coins', type: 'coins', value: 50, color: '#3b82f6' },
  { id: 3, label: '🎁 Huy Hiệu Đỏ', labelEn: '🎁 Red Badge', type: 'badge', value: 'Vận May Đỏ', color: '#ec4899' },
  { id: 4, label: '+15 Xu', labelEn: '+15 Coins', type: 'coins', value: 15, color: '#8b5cf6' },
  { id: 5, label: '💎 +100 Xu', labelEn: '💎 +100 Coins', type: 'coins', value: 100, color: '#06b6d4' },
  { id: 6, label: '💥 JACKPOT 300', labelEn: '💥 JACKPOT 300', type: 'coins', value: 300, color: '#ef4444' },
  { id: 7, label: '🍀 +80 Xu', labelEn: '🍀 +80 Coins', type: 'coins', value: 80, color: '#14b8a6' }
];

export default function WheelPage({ showToast, onPrizeWon, openAuth }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { lang, t } = useThemeLang();
  const canvasRef = useRef(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const rotationRef = useRef(0);
  const [costText, setCostText] = useState('');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    drawWheel();
    checkCooldown();
  }, [user, lang]);

  const checkCooldown = async () => {
    if (!user) {
      setCostText(lang === 'vi' ? 'Đăng nhập để nhận 1 lượt quay miễn phí mỗi 6 tiếng!' : 'Sign in to get 1 free spin every 6 hours!');
      setCountdown('');
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('minigame_token')}` }
      });
      const data = await res.json();
      if (data.wheel && !data.wheel.canFreeSpin) {
        setCostText(lang === 'vi' ? 'Lượt tiếp theo: 20 Xu' : 'Next spin: 20 Coins');
        startTimer(data.wheel.secondsUntilFreeSpin);
      } else {
        setCostText(lang === 'vi' ? 'Lượt quay này: ✨ MIỄN PHÍ ✨' : 'This spin is: ✨ FREE ✨');
        setCountdown('');
      }
    } catch (e) {}
  };

  const startTimer = (seconds) => {
    let rem = seconds;
    const interval = setInterval(() => {
      if (rem <= 0) {
        clearInterval(interval);
        checkCooldown();
        return;
      }
      const h = Math.floor(rem / 3600);
      const m = Math.floor((rem % 3600) / 60);
      const s = rem % 60;
      setCountdown(
        lang === 'vi'
          ? `Lượt miễn phí sau: ${h}h ${m}m ${s}s`
          : `Next free spin in: ${h}h ${m}m ${s}s`
      );
      rem--;
    }, 1000);
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width / 2 - 15;
    const num = WHEEL_SEGMENTS.length;
    const sliceAngle = (Math.PI * 2) / num;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotationRef.current);

    // Slices
    WHEEL_SEGMENTS.forEach((seg, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Outfit, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      const labelText = lang === 'en' ? seg.labelEn : seg.label;
      ctx.fillText(labelText, radius - 20, 5);
      ctx.restore();
    });

    ctx.restore();

    // Outer glow ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();

    // Center cap
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', cx, cy);
    ctx.restore();

    // Pointer needle
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx - 12, 10);
    ctx.lineTo(cx + 12, 10);
    ctx.lineTo(cx, 34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  const spin = async () => {
    if (isSpinning) return;
    if (!user) {
      showToast(lang === 'vi' ? 'Vui lòng đăng nhập để quay Vòng Quay!' : 'Please sign in to spin the wheel!', 'warning');
      openAuth('login');
      return;
    }

    setIsSpinning(true);

    try {
      const res = await fetch('/api/wheel/spin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('minigame_token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const targetId = data.segmentId;
      const sliceAngle = (Math.PI * 2) / WHEEL_SEGMENTS.length;
      const targetMidAngle = (targetId + 0.5) * sliceAngle;
      const desiredAngle = (Math.PI * 1.5 - targetMidAngle) % (Math.PI * 2);

      const normalized = rotationRef.current % (Math.PI * 2);
      let diff = desiredAngle - normalized;
      if (diff < 0) diff += Math.PI * 2;

      const totalAngle = Math.PI * 2 * 6 + diff;
      const startAngle = rotationRef.current;
      const startTime = performance.now();
      const duration = 5000;
      let lastTick = startAngle;

      const animate = (now) => {
        const elapsed = now - startTime;
        const p = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        rotationRef.current = startAngle + totalAngle * ease;

        if (Math.abs(rotationRef.current - lastTick) >= sliceAngle) {
          sound.tick();
          lastTick = rotationRef.current;
        }

        drawWheel();

        if (p < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);
          dispatch(updateCoins(data.user.coins));
          sound.win();
          onPrizeWon(data.prize, data.message);
          checkCooldown();
        }
      };

      requestAnimationFrame(animate);
    } catch (err) {
      setIsSpinning(false);
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="section-header text-center">
        <h2 className="section-title">🎡 {t('wheel.title')}</h2>
        <p className="section-subtitle">{t('wheel.subtitle')}</p>
      </div>

      <div className="wheel-center-container">
        <div className="wheel-box">
          <canvas ref={canvasRef} width="380" height="380" />
          <button className="btn btn-primary btn-spin" onClick={spin} disabled={isSpinning}>
            {isSpinning ? (lang === 'vi' ? 'ĐANG QUAY...' : 'SPINNING...') : (lang === 'vi' ? 'QUAY NGAY' : 'SPIN NOW')}
          </button>
        </div>

        <div className="wheel-info-card">
          <div className="wheel-status-pill">{costText}</div>
          <div className="wheel-countdown-text">{countdown}</div>

          <div className="wheel-prizes-list">
            <h4>{lang === 'vi' ? 'Danh sách quà tặng:' : 'Prize breakdown:'}</h4>
            <div className="prize-chips-grid">
              <span className="prize-chip">{lang === 'vi' ? '💥 Jackpot 300 Xu' : '💥 Jackpot 300 Coins'}</span>
              <span className="prize-chip">{lang === 'vi' ? '💎 +100 Xu' : '💎 +100 Coins'}</span>
              <span className="prize-chip">{lang === 'vi' ? '🍀 +80 Xu' : '🍀 +80 Coins'}</span>
              <span className="prize-chip">{lang === 'vi' ? '⚡ +50 Xu' : '⚡ +50 Coins'}</span>
              <span className="prize-chip">{lang === 'vi' ? '🪙 +25 Xu' : '🪙 +25 Coins'}</span>
              <span className="prize-chip">{lang === 'vi' ? '🎁 Huy hiệu "Vận May Đỏ"' : '🎁 "Red Fortune" Badge'}</span>
            </div>
          </div>

          <div className="wheel-help-note">
            {lang === 'vi' ? (
              <>💡 Mỗi lượt quay thêm chỉ tốn <strong>20 Xu</strong>. Sau mỗi 6 tiếng bạn sẽ được tặng 1 lượt quay hoàn toàn miễn phí.</>
            ) : (
              <>💡 Extra spins cost only <strong>20 Coins</strong>. You receive 1 free spin every 6 hours automatically.</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
