import './WelcomeHeader.css';

export default function WelcomeHeader({username}){
    return <div className='welcome-header-container'>Welcome, {username}</div>
}