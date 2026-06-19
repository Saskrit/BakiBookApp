import { useRef, useState } from 'react';
import { Camera, ImagePlus, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../services/upload';
import './ProfilePicturePicker.css';

function ProfilePicturePicker({
  value,
  onChange,
  onError,
  disabled = false,
  label = 'Profile Picture',
  name = '',
}) {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const displayImage = value || previewUrl;

  const handleFile = async (file) => {
    if (!file) return;

    onError('');
    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const url = await uploadImage(file, 'profile');
      onChange(url);
      setPreviewUrl('');
      URL.revokeObjectURL(localPreview);
    } catch (err) {
      onError(err.message);
      setPreviewUrl('');
      URL.revokeObjectURL(localPreview);
    } finally {
      setUploading(false);
    }
  };

  const handleGallerySelect = async (e) => {
    await handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleCameraSelect = async (e) => {
    await handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const clearImage = () => {
    onChange('');
    setPreviewUrl('');
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const initials = name.trim()
    ? name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const isDisabled = disabled || uploading;
  const galleryId = `gallery-input-${label.replace(/\s/g, '-').toLowerCase()}`;
  const cameraId = `camera-input-${label.replace(/\s/g, '-').toLowerCase()}`;

  return (
    <div className="profile-picture-picker">
      <label className="profile-picture-picker__label">{label}</label>

      <div className="profile-picture-picker__row">
        <div className="profile-picture-picker__avatar">
          {displayImage ? (
            <>
              <img src={displayImage} alt="Profile preview" />
              <button
                type="button"
                className="profile-picture-picker__remove"
                onClick={clearImage}
                disabled={isDisabled}
                aria-label="Remove profile picture"
              >
                <X size={14} />
              </button>
            </>
          ) : uploading ? (
            <Loader2 size={22} className="auth-spinner" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="profile-picture-picker__actions">
          <input
            ref={galleryInputRef}
            id={galleryId}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            className="profile-picture-picker__file-input"
            onChange={handleGallerySelect}
            disabled={isDisabled}
          />
          <input
            ref={cameraInputRef}
            id={cameraId}
            type="file"
            accept="image/*"
            capture="environment"
            className="profile-picture-picker__file-input"
            onChange={handleCameraSelect}
            disabled={isDisabled}
          />

          <label
            htmlFor={galleryId}
            className={`profile-picture-picker__btn ${isDisabled ? 'profile-picture-picker__btn--disabled' : ''}`}
          >
            {uploading ? <Loader2 size={16} className="auth-spinner" /> : <ImagePlus size={16} />}
            {uploading ? 'Uploading...' : 'Add photo'}
          </label>

          <label
            htmlFor={cameraId}
            className={`profile-picture-picker__btn profile-picture-picker__btn--outline ${isDisabled ? 'profile-picture-picker__btn--disabled' : ''}`}
          >
            <Camera size={16} />
            Camera
          </label>
        </div>
      </div>
    </div>
  );
}

export default ProfilePicturePicker;
