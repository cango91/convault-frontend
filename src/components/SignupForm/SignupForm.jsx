import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './SignupForm.css';

export default function SignupForm({inPage, setInPage}) {
    const [containerClass, setContainerClass] = useState('signup-container invisible');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        const t = setTimeout(() => setContainerClass('signup-container'), 10);
        return () => clearTimeout(t);
    }, []);
    const handleSubmit = (e) => {
        e.prventDefault();
    }

    const transitionOut = (callback) => {
        setContainerClass('signup-container invisible');
        setTimeout(callback,1000);
    }

    const transitionToLoginPage = () =>{
        setInPage(true);
        transitionOut(()=>navigate('/login'));
    }

    return (
        <div className={containerClass} style={{transition:'all 1s'}}>
            <form className="signup-container" onSubmit={handleSubmit}>
                <div className='login-text'>
                    Signup
                </div>
                <input
                    className='login-input'
                    autoComplete='username'
                    type="text"
                    name="username"
                    placeholder='username'
                />
                <input
                    className='login-input'
                    autoComplete='email'
                    type="email"
                    name="email"
                    placeholder='email'
                />
                <input
                    className='login-input'
                    autoComplete='new-password'
                    type="password"
                    name="password"
                    placeholder='password'
                />
                <input
                    className='login-input'
                    autoComplete='new-password'
                    type="password"
                    name="password"
                    placeholder='confirm password'
                />
                <button type='submit' className='login-btn' style={{ marginLeft: 'auto' }}>
                    Signup
                </button>
                <div className='signup-msg'>
                    <p className='login-message'>
                        Already registered?
                    </p>
                    <p className='login-message'>
                        <Link className='app-link' onClick={transitionToLoginPage}>
                            Sign-in&nbsp;
                        </Link>instead.
                    </p>
                </div>
                <div className={`error-msg-container ${error ? '' : 'invisible'}`}>
                    {error}
                </div>
            </form>

        </div>
    );
}