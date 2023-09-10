import LogoutButton from '../LogoutButton/LogoutButton';
import './WelcomeHeader.css';

export default function WelcomeHeader({ username, position, noWelcome }) {
    return (<>
        <div className={`welcome-header-container ${position ? `p-${position}` : ''}`} ><span className="glitch-text">{!noWelcome && <>Welcome,</>} {username}</span></div>
    </>);
}