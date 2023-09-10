import { useEffect, useState } from 'react';
import ChatArea from './ChatArea/ChatArea';
import ConnectionIndicator from './ConnectionIndicator';
import FriendDetails from './FriendDetails/FriendDetails';
import './Main.css';
import { useSocket } from '../../../contexts/SocketContext';
export default function Main({ fullscreen, active, onBack, data, onContactAction }) {
    const [username, setUsername] = useState('');
    const {allContacts} = useSocket();
    useEffect(()=>{
        if(!data || data.friendRequest) return;
        setUsername(allContacts.find(c=>c.contact._id===data).contact.username);
    },[data, allContacts]);
    return (
        <>
            <main className={`main ${fullscreen && !active ? 'd-none' : ''}`}>
                <div className="top-bar info">
                <button onClick={onBack} className={`back-btn  ${fullscreen && active ? '' : 'd-none'}`}>←Back</button>
                    <div className={`chat-info ${!data || data.friendRequest ? 'invisible' : ''}`}>
                        <img src='user-filled-white.svg' alt="" className='profile-pic' />
                        <span className='friend-username'>{username}</span>
                    </div>
                    
                </div>
                <div className="theater">
                    {
                        !data &&
                        <div className='friend-details flex-col'><span className='emoji-logo'><span>💬</span><span>🔐</span></span>
                        </div>
                    }
                    {
                        data?.friendRequest &&
                        <FriendDetails data={data} onFriendAction={(action) => onContactAction(action, data)} />
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