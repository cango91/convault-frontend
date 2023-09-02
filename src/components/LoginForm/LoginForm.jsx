import { Link, useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { useState, useEffect } from 'react';
export default function LoginForm() {
    const [loginTextClass, setLoginTextClass] = useState('login-text slide-from-above');
    const [usernameClass, setUsernameClass] = useState('login-input slide-from-right');
    const [passwordClass, setPasswordClass] = useState('login-input slide-from-left');
    const [buttonClass, setButtonClass] = useState('login-btn slide-from-below');
    const [signupClass, setSignupClass] = useState('signup-msg invisible');
    const [containerClass, setContainerClass] = useState('flex-container-intro');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        /** Transition in animations */
        const timeouts = [];

        const changeLoginTextClass = (newClass, delay) => {
            const id = setTimeout(() => {
                setLoginTextClass(newClass);
            }, delay);
            timeouts.push(id);
        };

        const changeUsernameClass = (newClass, delay) => {
            const id = setTimeout(() => {
                setUsernameClass(newClass);
            }, delay);
            timeouts.push(id);
        }
        const changePasswordClass = (newClass, delay) => {
            const id = setTimeout(() => {
                setPasswordClass(newClass);
            }, delay);
            timeouts.push(id);
        }
        const changeButtonClass = (newClass, delay) => {
            const id = setTimeout(() => {
                setButtonClass(newClass);
            }, delay);
            timeouts.push(id);
        }
        const changeSignupClass = (newClass, delay) => {
            const id = setTimeout(() => {
                setSignupClass(newClass);
            }, delay);
            timeouts.push(id);
        }
        changeLoginTextClass('login-text', 0);
        changeUsernameClass('login-input', 0);
        changePasswordClass('login-input', 0);
        changeButtonClass('login-btn', 0);
        changeSignupClass('signup-msg', 1500);

        /** Check for error message on the URL */


        return (() => timeouts.forEach(timeout => clearTimeout(timeout)));
    }, []);

    const transitionOut = (callback) => {
        setContainerClass('container-class-intro invisible');
        setTimeout(callback, 1000);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        transitionOut(() => {
            // try to login
        })
    }
    return (
        <div className={containerClass}>
            <form className="flex-container-intro" onSubmit={handleSubmit}>
                <div className={loginTextClass}>
                    Login
                </div>
                <input
                    className={usernameClass}
                    autoComplete='username'
                    type="text"
                    name="username"
                    placeholder='username'
                />
                <input
                    className={passwordClass}
                    autoComplete='current-password'
                    type="password"
                    name="password"
                    placeholder='password'
                />
                <button type='submit' className={buttonClass} style={{ marginLeft: 'auto' }}>
                    Login
                </button>
                <div className={signupClass}>
                    <p className='login-message'>
                        Don't have an account?
                    </p>
                    <p className='login-message'>
                        <Link className='app-link' onClick={() => transitionOut(() => navigate('/signup'))}>
                            Click to signup
                        </Link>
                    </p>
                </div>
                <div className={`error-msg-container ${error ? '' : 'invisible'}`}>
                    {error}
                </div>
            </form>

        </div>
    );
}