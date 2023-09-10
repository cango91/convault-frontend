import ConnectionIndicator from './ConnectionIndicator';
import FriendDetails from './FriendDetails/FriendDetails';
import './Main.css';
export default function Main({ fullscreen, active, onBack, data, onContactAction }) {
    return (
        <>
            <main className={`main ${fullscreen && !active ? 'd-none' : ''}`}>
                <div className="top-bar">
                    <button onClick={onBack} className={`back-btn  ${fullscreen && active ? '' : 'd-none'}`}>←Back</button>
                    <img src='user-filled-white.svg' alt="" className='profile-pic invisible' />
                    <ConnectionIndicator />
                </div>
                <div className="theater">
                    {
                        !data &&
                        <div>Cool stuff bro</div>
                    }
                    {
                        data?.friendRequest &&
                        <FriendDetails data={data} onFriendAction={(action)=>onContactAction(action,data)} />
                    }
                    {/* {
                        data?.contact?.publicKey &&
                        <div>Chat Area </div>
                    } */}
                </div>
            </main>
        </>
    );
}