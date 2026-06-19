import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { verifyEmail, getAuth, saveAuth, getPostAuthPath } from '../services/auth';
import AuthShell from '../components/AuthShell';
import './AuthPage.css';

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await verifyEmail(token);
        setStatus('success');
        setMessage(data.message);
        setVerifiedUser(data.user);

        const auth = getAuth();
        if (auth) {
          saveAuth(auth.token, data.user);
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message);
      }
    };

    if (token) run();
    else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const homePath = verifiedUser
    ? getPostAuthPath(verifiedUser, verifiedUser.pendingLinkCount)
    : '/login';
  const homeLabel = verifiedUser?.isAdmin
    ? 'Go to Admin'
    : verifiedUser?.role === 'customer'
      ? 'Go to Portal'
      : 'Go to Dashboard';

  return (
    <AuthShell backTo="/login" backLabel="Back to login">
      <div className="auth-page__card">
        {status === 'loading' && (
          <>
            <div className="auth-page__icon-wrap auth-page__icon-wrap--loading">
              <Loader2 size={28} className="auth-spinner" />
            </div>
            <div className="auth-page__header">
              <h1>Verifying your email...</h1>
              <p>Please wait while we confirm your email address.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="auth-page__icon-wrap auth-page__icon-wrap--success">
              <CheckCircle size={28} />
            </div>
            <div className="auth-page__header">
              <h1>Email Verified!</h1>
              <p>{message}</p>
            </div>
            <Link to={homePath} className="auth-page__submit">
              {homeLabel}
              <ArrowRight size={16} />
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="auth-page__icon-wrap auth-page__icon-wrap--error">
              <XCircle size={28} />
            </div>
            <div className="auth-page__header">
              <h1>Verification Failed</h1>
              <p>{message}</p>
            </div>
            <Link to="/verify-email" className="auth-page__submit">
              Request New Link
            </Link>
            <p className="auth-page__footer">
              <Link to="/login">Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default VerifyEmail;
