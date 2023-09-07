import LogoutButton from '../LogoutButton/LogoutButton';
import './WelcomeHeader.css';

export default function WelcomeHeader({ username }) {
    return (<>
        <LogoutButton />
        <div className='welcome-header-container'>Welcome, {username}</div>
    </>);
}