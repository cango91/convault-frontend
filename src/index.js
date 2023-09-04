import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CryptoProvider } from './contexts/CryptoContext';
import './index.css';
import App from './pages/App';
import AuthPage from './pages/AuthPage/AuthPage';
import { ExtensionProvider } from './contexts/ExtensionContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <CryptoProvider>
          <ExtensionProvider>
            <Routes>
              <Route path='/' element={<App />} />
              <Route path='/login' element={<AuthPage />} />
              <Route path='/signup' element={<AuthPage />} />
              <Route path='/chat' />
              <Route path='/*' element={<App />} />
            </Routes>
          </ExtensionProvider>
        </CryptoProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
