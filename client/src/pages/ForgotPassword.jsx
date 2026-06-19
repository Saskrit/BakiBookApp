import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../services/auth';
import AuthShell from '../components/AuthShell';
import './AuthPage.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await forgotPassword(email.trim());
      setSent(true);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell backTo="/login" backLabel="Back to login">
      <div className="auth-page__card">
        <div className={`auth-page__icon-wrap ${sent ? 'auth-page__icon-wrap--success' : 'auth-page__icon-wrap--primary'}`}>
          {sent ? <CheckCircle size={28} /> : <Mail size={28} />}
        </div>

        <div className="auth-page__header">
          <h1>{sent ? 'Check Your Email' : 'Forgot Password?'}</h1>
          <p>
            {sent
              ? message
              : 'Enter the email linked to your account and we will send you a password reset link.'}
          </p>
        </div>

        {error && <p className="auth-page__message auth-page__message--error">{error}</p>}

        {!sent ? (
          <form className="auth-page__form" onSubmit={handleSubmit}>
            <div className="auth-page__field">
              <label htmlFor="email">Email Address</label>
              <div className="auth-page__input-wrap">
                <Mail size={18} className="auth-page__input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button type="submit" className="auth-page__submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="auth-spinner" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <>
            <p className="auth-page__message auth-page__message--info">
              If you don&apos;t see the email, check your spam folder. The link expires in 1 hour.
            </p>
            <button
              type="button"
              className="auth-page__submit auth-page__submit--outline"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </>
        )}

        {!sent && (
          <p className="auth-page__footer">
            Remember your password? <Link to="/login">Login here</Link>
          </p>
        )}
      </div>
    </AuthShell>
  );
}

export default ForgotPassword;
