import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CryptoProvider } from './contexts/CryptoContext';
import { ExtensionProvider } from './contexts/ExtensionContext';
import App from './pages/App';
import './index.css';
import './components/MnemonicsComponent/MnemonicsComponent.css'; // TODO: move css to more appropriate place and rename
import { LogoutProvider } from './contexts/LogoutContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <CryptoProvider>
          <ExtensionProvider>
            <LogoutProvider>
              <App />
            </LogoutProvider>
          </ExtensionProvider>
        </CryptoProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
