import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, getPostAuthPath } from '../services/auth';

function AuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      navigate('/login', { replace: true });
      return;
    }

    const path = getPostAuthPath(auth.user, auth.user?.pendingLinkCount);
    navigate(path, { replace: true });
  }, [navigate]);

  return null;
}

export default AuthRedirect;
