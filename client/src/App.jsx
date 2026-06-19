import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketProvider';
import { AppDialogProvider } from './contexts/AppDialogContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppDialogProvider>
        <SocketProvider>
          <div className="app">
            <AppRoutes />
          </div>
        </SocketProvider>
      </AppDialogProvider>
    </BrowserRouter>
  );
}

export default App;
