import { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './GoogleAuthButton.css';

function GoogleAuthButton({ onSuccess, onError, disabled, text = 'continue_with' }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(320);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`google-auth-btn ${disabled ? 'google-auth-btn--disabled' : ''}`}
    >
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        text={text}
        shape="rectangular"
        theme="outline"
        size="large"
        width={width}
        useOneTap={false}
      />
    </div>
  );
}

export default GoogleAuthButton;
