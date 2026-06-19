import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { resetPassword } from '../services/auth';
import AuthShell from '../components/AuthShell';
import './AuthPage.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(token, password);
      setSuccess(true);
      setMessage(data.message);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell backTo="/login" backLabel="Back to login">
        <div className="auth-page__card">
          <div className="auth-page__header">
            <h1>Invalid Reset Link</h1>
            <p>This password reset link is invalid.</p>
          </div>
          <Link to="/forgot-password" className="auth-page__submit">
            Request New Link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell backTo="/login" backLabel="Back to login">
      <div className="auth-page__card">
        <div className={`auth-page__icon-wrap ${success ? 'auth-page__icon-wrap--success' : 'auth-page__icon-wrap--primary'}`}>
          {success ? <CheckCircle size={28} /> : <Lock size={28} />}
        </div>

        <div className="auth-page__header">
          <h1>{success ? 'Password Reset!' : 'Reset Password'}</h1>
          <p>
            {success ? message : 'Choose a strong new password for your BakiBook account.'}
          </p>
        </div>

        {error && <p className="auth-page__message auth-page__message--error">{error}</p>}

        {!success ? (
          <form className="auth-page__form" onSubmit={handleSubmit}>
            <div className="auth-page__field">
              <label htmlFor="password">New Password</label>
              <div className="auth-page__input-wrap">
                <Lock size={18} className="auth-page__input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-page__toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-page__field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-page__input-wrap">
                <Lock size={18} className="auth-page__input-icon" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-page__toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-page__submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="auth-spinner" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <Link to="/login" className="auth-page__submit">
            Continue to Login
            <ArrowRight size={16} />
          </Link>
        )}

        {!success && (
          <p className="auth-page__footer">
            Link expired? <Link to="/forgot-password">Request a new one</Link>
          </p>
        )}
      </div>
    </AuthShell>
  );
}

export default ResetPassword;
