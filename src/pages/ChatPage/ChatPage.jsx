import { useEffect } from 'react';
import { io } from 'socket.io-client';
import LogoutButton from '../../components/LogoutButton/LogoutButton';
import { useAuth } from '../../contexts/AuthContext';
import './ChatPage.css';
import { useNavigate } from 'react-router-dom';
import { useCrypto } from '../../contexts/CryptoContext';
import PrivKeySetter from '../../components/PrivKeySetter/PrivKeySetter';
import { SocketProvider } from '../../contexts/SocketContext';

export default function ChatPage() {
    const { jwt } = useAuth();
    const { privateKey, publicKey } = useCrypto();
    const navigate = useNavigate();
    // useEffect(()=>{
    //     if(!jwt) navigate('/login');
    // },[jwt]);

    return (
        <>
            <LogoutButton />
            {privateKey &&
                <SocketProvider>
                    <div>Chat Page</div>
                </SocketProvider>

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