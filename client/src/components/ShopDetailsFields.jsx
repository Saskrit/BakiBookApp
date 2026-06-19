import { useRef, useState } from 'react';
import { Store, MapPin, LocateFixed, ImagePlus, Loader2, X } from 'lucide-react';
import { getCurrentLocationAddress } from '../utils/location';
import { uploadImage } from '../services/upload';
import './ShopDetailsFields.css';

function ShopDetailsFields({
  form,
  onChange,
  onImageChange,
  locating,
  onLocatingChange,
  onError,
  disabled = false,
  idPrefix = 'shop',
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleLocate = async () => {
    onError('');
    onLocatingChange(true);

    try {
      const { address } = await getCurrentLocationAddress();
      onChange('shopLocation', address);
    } catch (err) {
      onError(err.message);
    } finally {
      onLocatingChange(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onError('');
    setUploading(true);

    try {
      const url = await uploadImage(file, 'shop');
      onImageChange(url);
    } catch (err) {
      onError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const clearImage = () => {
    onImageChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isDisabled = disabled || uploading;

  return (
    <div className="shop-details-fields">
      <div className="register-form__group">
        <label htmlFor={`${idPrefix}-shopName`}>Shop Name</label>
        <div className="register-form__input-wrap">
          <Store size={18} className="register-form__icon" />
          <input
            id={`${idPrefix}-shopName`}
            type="text"
            name="shopName"
            placeholder="Enter your shop name"
            value={form.shopName}
            onChange={(e) => onChange('shopName', e.target.value)}
            disabled={isDisabled || locating}
          />
        </div>
      </div>

      <div className="register-form__group">
        <label htmlFor={`${idPrefix}-shopLocation`}>Shop Location</label>
        <div className="shop-details-fields__location">
          <div className="register-form__input-wrap shop-details-fields__location-input">
            <MapPin size={18} className="register-form__icon" />
            <input
              id={`${idPrefix}-shopLocation`}
              type="text"
              name="shopLocation"
              placeholder="Enter shop address or use current location"
              value={form.shopLocation}
              onChange={(e) => onChange('shopLocation', e.target.value)}
              disabled={isDisabled || locating}
            />
          </div>
          <button
            type="button"
            className="shop-details-fields__locate-btn"
            onClick={handleLocate}
            disabled={isDisabled || locating}
            title="Use current location"
            aria-label="Use current location"
          >
            {locating ? <Loader2 size={18} className="auth-spinner" /> : <LocateFixed size={18} />}
          </button>
        </div>
        <p className="shop-details-fields__hint">
          Tap the location icon to fill your shop address automatically.
        </p>
      </div>

      <div className="register-form__group">
        <label htmlFor={`${idPrefix}-shopImage`}>Shop Image</label>
        <input
          ref={fileInputRef}
          id={`${idPrefix}-shopImage`}
          type="file"
          accept="image/*"
          className="shop-details-fields__file-input"
          onChange={handleImageSelect}
          disabled={isDisabled}
        />

        {form.shopImage ? (
          <div className="shop-details-fields__preview">
            <img src={form.shopImage} alt="Shop preview" />
            <button
              type="button"
              className="shop-details-fields__remove-image"
              onClick={clearImage}
              disabled={isDisabled}
              aria-label="Remove shop image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="shop-details-fields__upload"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
          >
            {uploading ? <Loader2 size={22} className="auth-spinner" /> : <ImagePlus size={22} />}
            <span>{uploading ? 'Uploading...' : 'Upload shop photo'}</span>
            <small>JPG, PNG up to 5MB</small>
          </button>
        )}
      </div>
    </div>
  );
}

export default ShopDetailsFields;
