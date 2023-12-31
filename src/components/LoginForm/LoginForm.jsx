import { Link, useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../utilities/api/users-api';
import { setAccessToken } from '../../utilities/services/user-service';
import { setClassWithDelay } from '../../utilities/utils';

const initState = { username: '', password: '' };

export default function LoginForm({ inPage = false }) {
    const [formData, setFormData] = useState(initState);
    const [loginTextClass, setLoginTextClass] = useState(`login-text ${!inPage ? 'slide-from-above' : 'invisible'}`);
    const [usernameClass, setUsernameClass] = useState(`login-input ${!inPage ? 'slide-from-right' : 'invisible'}`);
    const [passwordClass, setPasswordClass] = useState(`login-input ${!inPage ? 'slide-from-left' : 'invisible'}`);
    const [buttonClass, setButtonClass] = useState(`login-btn ${!inPage ? 'slide-from-below' : 'invisible'}`);
    const [signupClass, setSignupClass] = useState('signup-msg invisible');
    const [containerClass, setContainerClass] = useState('flex-container-intro');
    const [error, setError] = useState('');
    const [errorClass, setErrorClass] = useState('error-text');
    const navigate = useNavigate();
    const { setJwt } = useAuth();


    useEffect(() => {
        /** Transition in animations */
        const timeouts = [];
        timeouts.push(setClassWithDelay(setLoginTextClass,'login-text'));
        timeouts.push(setClassWithDelay(setUsernameClass,'login-input'));
        timeouts.push(setClassWithDelay(setPasswordClass,'login-input'));
        timeouts.push(setClassWithDelay(setButtonClass,'login-btn'));
        timeouts.push(setClassWithDelay(setSignupClass,'signup-msg',inPage ? 10 : 1500));

        return (() => timeouts.forEach(timeout => clearTimeout(timeout)));
    }, [inPage]);

    const transitionOut = (callback) => {
        setContainerClass('flex-container-intro invisible');
        setTimeout(callback, 1000);
    }
    const glitchError = () => {
        setErrorClass('error-text glitch');
        setTimeout(() => setErrorClass('error-text'), 200);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await login(formData);
            if (res.message) {
                setError(res.message);
                setContainerClass('flex-container-intro visible');
                glitchError();
            } else {
                transitionOut(() => {
                    setJwt(res.accessToken);
                    setAccessToken(res.accessToken);
                });


            }
        } catch (error) {
            setContainerClass('flex-container-intro');
            setError(error.message);
        }


        // transitionOut(async () => {
        //     // try to login
        //     try {
        //         const res = await login(formData);
        //         if(res.message){
        //             setError(res.message);
        //             setContainerClass('flex-container-intro visible');
        //         }else{
        //             setJwt(res.accessToken);
        //             setAccessToken(res.accessToken);
        //         }
        //     } catch (error) {
        //         setContainerClass('flex-container-intro');
        //         setError(error.message);
        //     }
        // });
    }

    const onFormChange = e => {
        setFormData(prevData => ({ ...prevData, [e.target.name]: e.target.value }));
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
                    value={formData.username}
                    onChange={onFormChange}
                    required
                />
                <input
                    className={passwordClass}
                    autoComplete='current-password'
                    type="password"
                    name="password"
                    placeholder='password'
                    value={formData.password}
                    onChange={onFormChange}
                    required
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
                    <span className={errorClass}>{error}</span>
                </div>
            </form>

        </div>
    );
}