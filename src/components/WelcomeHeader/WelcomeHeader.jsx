import LogoutButton from '../LogoutButton/LogoutButton';
import './WelcomeHeader.css';

export default function WelcomeHeader({ username }) {
    return (<>
        <div className='welcome-header-container'><span className="glitch-text">Welcome, {username}</span></div>
    </>);
}