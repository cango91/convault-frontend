import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import App from './pages/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
        <Route path='/' element={<App />} />
        <Route path='/login' />
        <Route path='/signup' />
        <Route path='/chat' />
        <Route path='/*' element={<App />} />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
