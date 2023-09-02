import { useNavigate, useLocation } from 'react-router-dom';
import './AuthPage.css';
import LoginForm from '../../components/LoginForm/LoginForm';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SignupComponent from '../../components/SignupComponent/SignupComponent';
export default function AuthPage(){
    const [showLoginPage, setShowLoginPage] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const {jwt, hasPublicKey} = useAuth();
    useEffect(()=>{
        if(jwt && hasPublicKey){
            navigate('/chat');
        }else if(jwt && !hasPublicKey){
            setShowLoginPage(false);
        }else{
            if(/login/i.test(location.pathname)){
                setShowLoginPage(true);
            }else{
                setShowLoginPage(false);
            }
        }
    },[navigate,jwt,hasPublicKey,location]);
    
    return (
        <main>
            {
                showLoginPage ? 
                <LoginForm />
                :
                <SignupComponent />
            }
        </main>
    );
}