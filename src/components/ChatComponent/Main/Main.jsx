import ChatArea from './ChatArea/ChatArea';
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
                        <div className='friend-details flex-col'><span className='emoji-logo'><span>💬</span><span>🔐</span></span>
                        </div>
                    }
                    {
                        data?.friendRequest &&
                        <FriendDetails data={data} onFriendAction={(action)=>onContactAction(action,data)} />
                    }
                    {
                        data && !data.friendRequest && 
                        <ChatArea activeChat={data} />
                    }
                </div>
            </main>
        </>
    );
}