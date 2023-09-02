import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './App.css';

export default function App() {
  const [brandTextClass, setBrandTextClass] = useState('brand-text invisible');
  const [brandMottoClass, setBrandMottoClass] = useState('brand-motto invisible');
  const { jwt, hasPublicKey } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timeouts = [];

    const changeBrandTextClass = (newClass, delay) => {
      const id = setTimeout(() => {
        setBrandTextClass(newClass);
      }, delay);
      timeouts.push(id);
    };

    const changeBrandMottoClass = (newClass, delay) => {
      const id = setTimeout(() => {
        setBrandMottoClass(newClass);
      }, delay);
      timeouts.push(id);
    };

    changeBrandTextClass('brand-text fade-in', 0);
    changeBrandTextClass('brand-text glitch', 800);
    changeBrandTextClass('brand-text', 1000);
    changeBrandTextClass('brand-text glitch', 1500);
    changeBrandTextClass('brand-text nudge', 1900);
    changeBrandMottoClass('brand-motto visible', 1900);

    changeBrandTextClass('brand-text nudge glitch-text blur-text', 2000);
    changeBrandMottoClass('brand-motto', 2000);

    return () => {
      timeouts.forEach((id) => clearTimeout(id));
    };
  }, []);

  const glitch = () => {
    setBrandTextClass(`${brandTextClass} glitch`);
    setTimeout(() => setBrandTextClass(brandTextClass), 150);
  };

  const handleClick = () => {
    setBrandTextClass('brand-text glitch slide-left invisible');
    setBrandMottoClass('brand-motto invisible');
    setTimeout(() => {
      if (!jwt) {
        navigate('/login');
      } else if (jwt && !hasPublicKey) {
        navigate('/signup');
      } else {
        navigate('/chat');
      }
    }, 1000);
  }

  return (
      <div className="App">
        <header className="App-header">
          <div className="flex-container-intro">
            <h1 className={brandTextClass} onMouseLeave={glitch} onClick={handleClick}>
              CONVAULT
            </h1>
            <sub className={brandMottoClass}>Your conversation vault</sub>
          </div>
        </header>
      </div>
  );
}

