import { useNavigate, useLocation } from 'react-router-dom';
import './AuthPage.css';
import LoginForm from '../../components/LoginForm/LoginForm';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SignupComponent from '../../components/SignupComponent/SignupComponent';
import { refreshUser } from '../../utilities/api/users-api';
import WelcomeHeader from '../../components/WelcomeHeader/WelcomeHeader';
import { getUser } from '../../utilities/services/user-service';
export default function AuthPage() {
    const [showLoginPage, setShowLoginPage] = useState(true);
    const [slidingTransition, setSlidingTransition] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { jwt, hasPublicKey, refreshUserToken } = useAuth();
    useEffect(()=>{
        async function ref(){
            await refreshUser();
        }
        ref();
    },[]);

    useEffect(()=>{
        refreshUserToken();
    },[refreshUserToken]);

    useEffect(() => {
        if (jwt && hasPublicKey) {
            navigate('/chat');
        } else if (jwt && !hasPublicKey) {
            setShowLoginPage(false);
        } else {
            if (/login/i.test(location.pathname)) {
                setShowLoginPage(true);
            } else {
                setShowLoginPage(false);
            }
        }
    }, [navigate, jwt, hasPublicKey, location]);

    const setInPage = (val) => {
        setSlidingTransition(!val);
    }

    return (
        <main>
            {jwt && <WelcomeHeader username={getUser().username} />}
            {
                showLoginPage ?
                    <LoginForm inPage={!slidingTransition} />
                    :
                    <SignupComponent setInPage={setInPage} />
            }
        </main>
    );
}