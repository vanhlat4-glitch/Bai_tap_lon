import React from 'react';

export default function RewardModal({ prize, message, onClose }) {
  if (!prize) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card text-center">
        <div className="reward-modal-icon">{prize.type === 'coins' ? '💰' : '🎁'}</div>
        <h3 className="modal-title">🎉 CHÚC MỪNG BẠN!</h3>
        <p className="modal-desc">{message || `Bạn đã nhận được: ${prize.label}`}</p>
        <button className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }} onClick={onClose}>
          Tuyệt Vời!
        </button>
      </div>
    </div>
  );
}
