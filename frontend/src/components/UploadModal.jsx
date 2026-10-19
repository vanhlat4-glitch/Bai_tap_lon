import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { uploadAvatar } from '../features/auth/authSlice';
import { sound } from '../utils/sound';

export default function UploadModal({ isOpen, onClose, showToast }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(selected);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Vui lòng chọn file ảnh!', 'warning');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    const result = await dispatch(uploadAvatar(formData));
    setLoading(false);

    if (!result.error) {
      sound.win();
      showToast('Tải ảnh đại diện lên thành công (Lesson 10)!', 'success');
      onClose();
      setFile(null);
      setPreview(null);
    } else {
      sound.gameOver();
      showToast(result.payload || 'Lỗi tải ảnh', 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <div className="modal-logo">📷</div>
          <h3 className="modal-title">Tải Lên Ảnh Đại Diện</h3>
          <p className="modal-desc">Sử dụng Multer (Lesson 10) để tải ảnh từ máy tính</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Chọn file ảnh (PNG, JPG, WEBP, tối đa 5MB):</label>
            <input type="file" className="form-input" accept="image/*" onChange={handleFileChange} required />
          </div>

          {preview && (
            <div className="avatar-preview-box">
              <img src={preview} alt="Xem trước" className="preview-img" />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Đang tải lên...' : '🚀 Tải Lên & Cập Nhật Avatar'}
          </button>
        </form>
      </div>
    </div>
  );
}
