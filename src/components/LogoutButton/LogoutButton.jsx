import { useNavigate } from 'react-router-dom';
import { logout } from '../../utilities/api/users-api';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import './LogoutButton.css';
export default function LogoutButton(){
    const navigate = useNavigate();
    const {setJwt} = useAuth();
    const {resetMnemonic} = useCrypto();
    const handleClick = async () =>{
        await logout();
        setJwt(null);
        resetMnemonic();
        navigate('/');
    }
    return (
        <div className="logout-top">
            <button onClick={handleClick} className="login-btn" tabIndex="-1">Logout</button>
        </div>
    );
}