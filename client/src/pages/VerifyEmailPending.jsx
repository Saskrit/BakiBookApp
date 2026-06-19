import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { getAuth, resendVerification, getPostAuthPath } from '../services/auth';
import AuthShell from '../components/AuthShell';
import './AuthPage.css';

function VerifyEmailPending() {
  const auth = getAuth();
  const user = auth?.user;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isEmailVerified || user?.authProvider === 'google') {
    return <Navigate to={getPostAuthPath(user, user?.pendingLinkCount)} replace />;
  }

  const homePath = getPostAuthPath(user, user?.pendingLinkCount);
  const profilePath = user?.isAdmin ? '/admin/settings' : user?.role === 'shopkeeper' ? '/shop/settings' : '/portal/profile';

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await resendVerification();
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell backTo={homePath} backLabel="Dashboard">
      <div className="auth-page__card">
        <div className="auth-page__icon-wrap auth-page__icon-wrap--primary">
          <Mail size={28} />
        </div>

        <div className="auth-page__header">
          <h1>Verify Your Email</h1>
          <p>
            We sent a verification link to <strong>{user.email}</strong>. Click the link in
            your email to activate your account.
          </p>
        </div>

        <div className="auth-page__message auth-page__message--info">
          Check your inbox and spam folder. The link expires in 24 hours.
        </div>

        {error && <p className="auth-page__message auth-page__message--error">{error}</p>}
        {message && <p className="auth-page__message auth-page__message--success">{message}</p>}

        <button
          type="button"
          className="auth-page__submit"
          onClick={handleResend}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="auth-spinner" />
              Sending...
            </>
          ) : (
            'Resend Verification Email'
          )}
        </button>

        <p className="auth-page__footer">
          Wrong email? <Link to={profilePath}>Update it in your profile</Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default VerifyEmailPending;
