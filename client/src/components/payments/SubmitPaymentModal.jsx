import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadImage } from '../../services/upload';
import { submitCustomerPayment } from '../../services/paymentSubmissions';
import { formatRs } from '../../utils/format';
import { useAppDialog } from '../../contexts/AppDialogContext';
import './SubmitPaymentModal.css';

const METHODS = ['eSewa', 'Khalti', 'Bank Transfer'];

export default function SubmitPaymentModal({
  open,
  onClose,
  onSuccess,
  customerId,
  shopName,
  payType = 'custom',
  transactionId = null,
  itemIndex = null,
  defaultAmount = '',
  payLabel = '',
}) {
  const { alert } = useAppDialog();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('eSewa');
  const [note, setNote] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(defaultAmount ? String(defaultAmount) : '');
      setMethod('eSewa');
      setNote('');
      setScreenshotUrl('');
      setPreview('');
      setError('');
    }
  }, [open, defaultAmount]);

  if (!open) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file, 'payment');
      setScreenshotUrl(url);
      setPreview(URL.createObjectURL(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshotUrl) {
      setError('Payment screenshot is required');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitCustomerPayment({
        customerId,
        amount: Number(amount),
        method,
        payType,
        transactionId,
        itemIndex,
        screenshotUrl,
        note,
      });
      setSubmitting(false);
      onSuccess?.();
      onClose();
      await alert({
        title: 'Payment submitted',
        message: 'Your payment has been sent to the shopkeeper for review.',
        variant: 'success',
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const title =
    payType === 'item'
      ? `Pay for ${payLabel || 'item'}`
      : payType === 'transaction'
        ? `Pay for transaction${payLabel ? `: ${payLabel}` : ''}`
        : `Pay ${shopName || 'shop'}`;

  return (
    <div className="submit-pay-overlay" onClick={onClose}>
      <div className="submit-pay-modal app-card" onClick={(e) => e.stopPropagation()}>
        <div className="submit-pay-modal__head">
          <div>
            <h2>{title}</h2>
            {shopName && <p>{shopName}</p>}
          </div>
          <button type="button" className="submit-pay-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && <p className="text-danger" style={{ marginBottom: 12 }}>{error}</p>}

        <form className="app-form" onSubmit={handleSubmit}>
          <div className="app-grid-2">
            <div className="app-field">
              <label>Amount (Rs.)</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="app-field">
              <label>Payment method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="app-field">
            <label>Payment screenshot</label>
            <label className="submit-pay-upload">
              <Upload size={18} />
              <span>{uploading ? 'Uploading...' : preview ? 'Change screenshot' : 'Upload screenshot'}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            </label>
            {preview && (
              <img src={preview} alt="Payment screenshot preview" className="submit-pay-preview" />
            )}
          </div>

          <div className="app-field">
            <label>Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Transaction ID, reference number, etc."
            />
          </div>

          <div className="submit-pay-modal__actions">
            <button type="button" className="app-btn app-btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="app-btn app-btn--primary" disabled={submitting || uploading}>
              {submitting ? 'Submitting...' : `Submit ${amount ? formatRs(Number(amount)) : 'payment'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
