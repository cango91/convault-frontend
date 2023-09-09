import ConnectionIndicator from './ConnectionIndicator';
import './Main.css';
export default function Main({ fullscreen, active, onBack }) {
    return (
        <>
            <main className={`${fullscreen && !active ? 'd-none' : ''}`}>
                <div className="top-bar">
                    <button onClick={onBack} className={`back-btn  ${fullscreen && active ? '' : 'd-none'}`}>←Back</button>
                    <img src='user-filled-white.svg' alt="" className='profile-pic invisible' />
                    <ConnectionIndicator />
                </div>
            </main>
        </>
    );
}