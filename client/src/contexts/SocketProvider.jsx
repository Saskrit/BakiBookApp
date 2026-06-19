import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getAuth } from '../services/auth';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  const connect = useCallback(() => {
    const auth = getAuth();
    if (!auth?.token) {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      return;
    }

    const s = io(window.location.origin, {
      auth: { token: auth.token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export function useSocketEvent(event, handler, deps = []) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !handler) return undefined;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket, event, ...deps]);
}
