import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CryptoProvider } from './contexts/CryptoContext';
import './index.css';
import { ExtensionProvider } from './contexts/ExtensionContext';
import App from './pages/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <CryptoProvider>
          <ExtensionProvider>
            <App />
          </ExtensionProvider>
        </CryptoProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
