import { useNavigate } from 'react-router-dom';
import { logout } from '../../utilities/api/users-api';
import './LogoutButton.css';
import { useAuth } from '../../contexts/AuthContext';
export default function LogoutButton(){
    const navigate = useNavigate();
    const {setJwt} = useAuth();
    const handleClick = async () =>{
        await logout();
        setJwt(null);
        navigate('/');
    }
    return (
        <div className="logout-top">
            <button onClick={handleClick} className="login-btn">Logout</button>
        </div>
    );
}