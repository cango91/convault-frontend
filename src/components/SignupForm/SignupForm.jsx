import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './SignupForm.css';
import { signup } from "../../utilities/api/users-api";
import { useAuth } from "../../contexts/AuthContext";
import { setAccessToken } from "../../utilities/services/user-service";

const initialFormState = {
    username: '',
    email: '',
    password: '',
    confirm: '',
}

export default function SignupForm({ inPage, setInPage }) {
    /** useState hooks */
    const [containerClass, setContainerClass] = useState('signup-container invisible');
    const [error, setError] = useState('');
    const [formState, setFormState] = useState(initialFormState);
    const {setJwt} = useAuth();

    const navigate = useNavigate();
    useEffect(() => {
        const t = setTimeout(() => setContainerClass('signup-container'), 10);
        return () => clearTimeout(t);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {...formState};
        delete data.confirm;
        try{
            const res = await signup(data);
            if(res.message){
                setError(res.message);
            }
            setJwt(res.accessToken);
            setAccessToken(res.accessToken);
        }catch(e){

        }
    }

    const handleChange = (e) => {
        setFormState(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }

    const transitionOut = (callback) => {
        setContainerClass('signup-container invisible');
        setTimeout(callback, 1000);
    }

    const transitionToLoginPage = () => {
        setInPage(true);
        transitionOut(() => navigate('/login'));
    }




    const disabled = !formState.username || !formState.email || !formState.password || formState.password !== formState.confirm;
    return (
        <div className={containerClass} style={{ transition: 'all 1s' }}>
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
                    value={formState.username}
                    onChange={handleChange}
                    required
                />
                <input
                    className='login-input'
                    autoComplete='email'
                    type="email"
                    name="email"
                    placeholder='email'
                    value={formState.email}
                    onChange={handleChange}
                    required
                />
                <input
                    className='login-input'
                    autoComplete='new-password'
                    type="password"
                    name="password"
                    placeholder='password'
                    value={formState.password}
                    onChange={handleChange}
                    required
                />
                <input
                    className='login-input'
                    autoComplete='off'
                    type="password"
                    name="confirm"
                    placeholder='confirm password'
                    value={formState.confirm}
                    onChange={handleChange}
                    required
                />
                <button disabled={disabled} type='submit' className='login-btn' style={{ marginLeft: 'auto' }}>
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