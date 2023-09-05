import { useEffect } from 'react';
import LogoutButton from '../../components/LogoutButton/LogoutButton';
import { useAuth } from '../../contexts/AuthContext';
import './ChatPage.css';
import { useNavigate } from 'react-router-dom';
import { useCrypto } from '../../contexts/CryptoContext';
import PrivKeySetter from '../../components/PrivKeySetter/PrivKeySetter';

export default function ChatPage() {
    const { jwt } = useAuth();
    const {privateKey, publicKey} = useCrypto();
    const navigate = useNavigate();
    
    useEffect(()=>{
        if(!jwt) navigate('/login');
    },[navigate,jwt]);

    return (
        <>
        <LogoutButton />
            {privateKey &&
                <>
                    <div>Chat Page</div>
                </>
            }
            {
                !privateKey && 
                <>
                    <PrivKeySetter />
                </>
            }
        </>
    );
}