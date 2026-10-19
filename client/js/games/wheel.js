// Lucky Wheel Engine
class LuckyWheel {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isSpinning = false;
    this.currentRotation = 0; // In radians
    this.segments = [
      { id: 0, label: '+10 Xu', type: 'coins', value: 10, color: '#f59e0b' },
      { id: 1, label: '+25 Xu', type: 'coins', value: 25, color: '#10b981' },
      { id: 2, label: '+50 Xu', type: 'coins', value: 50, color: '#3b82f6' },
      { id: 3, label: '🎁 Huy Hiệu Đỏ', type: 'badge', value: 'Vận May Đỏ', color: '#ec4899' },
      { id: 4, label: '+15 Xu', type: 'coins', value: 15, color: '#8b5cf6' },
      { id: 5, label: '💎 +100 Xu', type: 'coins', value: 100, color: '#06b6d4' },
      { id: 6, label: '💥 JACKPOT 300', type: 'coins', value: 300, color: '#ef4444' },
      { id: 7, label: '🍀 +80 Xu', type: 'coins', value: 80, color: '#14b8a6' }
    ];
    this.countdownTimer = null;
  }

  init() {
    this.canvas = document.getElementById('wheelCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.drawWheel();
    this.setupListeners();
    this.updateStatus();
  }

  setupListeners() {
    const spinBtn = document.getElementById('wheelSpinBtn');
    if (spinBtn) spinBtn.onclick = () => this.spin();
  }

  drawWheel() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 15;
    const numSegments = this.segments.length;
    const anglePerSegment = (Math.PI * 2) / numSegments;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.currentRotation);

    // Draw Slices
    for (let i = 0; i < numSegments; i++) {
      const seg = this.segments[i];
      const startAngle = i * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;

      // Slice sector
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Border line
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Outfit, Inter, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(seg.label, radius - 20, 5);
      ctx.restore();
    }

    // Outer ring with glow
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.restore();

    // Center Hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', centerX, centerY);
    ctx.restore();

    // Pointer indicator at TOP (pointing DOWN into wheel)
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(centerX - 12, 10);
    ctx.lineTo(centerX + 12, 10);
    ctx.lineTo(centerX, 34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  async spin() {
    if (this.isSpinning) return;

    if (!auth.isLoggedIn()) {
      showToast('Vui lòng đăng nhập để quay Vòng Quay May Mắn!', 'warning');
      openAuthModal('login');
      return;
    }

    const spinBtn = document.getElementById('wheelSpinBtn');
    if (spinBtn) spinBtn.disabled = true;

    try {
      // Request spin from backend
      const res = await api.spinWheel();
      this.isSpinning = true;

      const targetSegmentId = res.segmentId;
      const numSegments = this.segments.length;
      const anglePerSegment = (Math.PI * 2) / numSegments;

      // Calculate destination angle
      // Indicator is at TOP: angle is -PI/2 (or 3PI/2)
      // Segment `i` spans from `i * anglePerSegment` to `(i + 1) * anglePerSegment`
      // To have segment `targetSegmentId` under top needle:
      // (currentRotation + targetSegmentAngle) % 2PI = 3*PI/2
      const targetMidAngle = (targetSegmentId + 0.5) * anglePerSegment;
      const desiredAngle = (Math.PI * 1.5 - targetMidAngle) % (Math.PI * 2);

      // Normalize currentRotation
      const normalizedCurrent = this.currentRotation % (Math.PI * 2);
      let angleDiff = desiredAngle - normalizedCurrent;
      if (angleDiff < 0) angleDiff += Math.PI * 2;

      // Add 5-7 full spins for visual excitement
      const extraSpins = Math.PI * 2 * (5 + Math.floor(Math.random() * 2));
      const totalSpinAngle = extraSpins + angleDiff;

      // Animate rotation with cubic ease-out
      const startAngle = this.currentRotation;
      const startTime = performance.now();
      const duration = 5000; // 5 seconds
      let lastTickAngle = startAngle;

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Cubic ease-out: 1 - pow(1 - progress, 3)
        const ease = 1 - Math.pow(1 - progress, 3);
        this.currentRotation = startAngle + totalSpinAngle * ease;

        // Play tick sound when crossing a segment
        if (Math.abs(this.currentRotation - lastTickAngle) >= anglePerSegment) {
          if (window.sound) window.sound.tick();
          lastTickAngle = this.currentRotation;
        }

        this.drawWheel();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Finished spinning!
          this.isSpinning = false;
          if (spinBtn) spinBtn.disabled = false;

          // Update user state
          auth.currentUser.coins = res.user.coins;
          auth.currentUser.badge = res.user.badge;
          auth.updateUI();

          // Play victory sound & confetti
          if (window.sound) window.sound.win();
          this.showRewardModal(res.prize, res.message);
          this.updateStatus();
        }
      };

      requestAnimationFrame(animate);
    } catch (err) {
      if (spinBtn) spinBtn.disabled = false;
      this.isSpinning = false;
      showToast(err.message, 'error');
    }
  }

  showRewardModal(prize, message) {
    const modal = document.getElementById('rewardModal');
    const rewardTitle = document.getElementById('rewardTitle');
    const rewardDesc = document.getElementById('rewardDesc');
    const rewardIcon = document.getElementById('rewardIcon');

    if (rewardTitle) rewardTitle.textContent = '🎉 CHÚC MỪNG BẠN!';
    if (rewardDesc) rewardDesc.textContent = message;
    if (rewardIcon) {
      rewardIcon.textContent = prize.type === 'coins' ? '💰' : '🎁';
    }

    if (modal) modal.classList.remove('hidden');

    // Trigger confetti
    createConfetti();
  }

  updateStatus() {
    const costText = document.getElementById('wheelCostText');
    const countdownEl = document.getElementById('wheelCountdown');
    const spinBtn = document.getElementById('wheelSpinBtn');

    if (!auth.isLoggedIn()) {
      if (costText) costText.textContent = 'Đăng nhập để nhận 1 lượt quay miễn phí mỗi 6 tiếng!';
      if (countdownEl) countdownEl.textContent = '';
      return;
    }

    // Refresh auth data to get latest cooldown
    api.getMe().then(data => {
      const wheel = data.wheel;
      if (wheel && !wheel.canFreeSpin) {
        if (costText) costText.textContent = 'Lượt quay tiếp theo: 20 Xu';
        this.startCountdown(wheel.secondsUntilFreeSpin);
      } else {
        if (costText) costText.textContent = 'Lượt quay này: ✨ MIỄN PHÍ ✨';
        if (countdownEl) countdownEl.textContent = '';
      }
    }).catch(() => {});
  }

  startCountdown(seconds) {
    clearInterval(this.countdownTimer);
    let remaining = seconds;
    const countdownEl = document.getElementById('wheelCountdown');

    const update = () => {
      if (remaining <= 0) {
        clearInterval(this.countdownTimer);
        this.updateStatus();
        return;
      }
      const hrs = Math.floor(remaining / 3600);
      const mins = Math.floor((remaining % 3600) / 60);
      const secs = remaining % 60;
      if (countdownEl) {
        countdownEl.textContent = `Lượt miễn phí sau: ${hrs}h ${mins}m ${secs}s`;
      }
      remaining--;
    };

    update();
    this.countdownTimer = setInterval(update, 1000);
  }
}

window.luckyWheel = new LuckyWheel();
