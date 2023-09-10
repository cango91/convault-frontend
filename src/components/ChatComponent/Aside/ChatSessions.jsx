import { useEffect, useState } from "react";
import { useSocket } from "../../../contexts/SocketContext";
import { getUser } from "../../../utilities/services/user-service";

export default function ChatSessions({ onSelectChat, selectChat }) {
    const [selectedChat, setSelectedChat] = useState('');
    const { allContacts, sessionsMeta } = useSocket();

    useEffect(()=>{
        if(selectChat){
            setSelectedChat(selectChat);
            //onSelectChat(selectedChat);
        }
    },[selectChat]);


    const handleSelectChat = (id) => {
        setSelectedChat(id);
        onSelectChat(id);
    }


    return (
        <div className="chat-sessions-container">
            <div className={`${!allContacts.length && !sessionsMeta.length ? 'invisible' : ''}`}>
                <input
                    type="text"
                    className="login-input search-input"
                    name="filter-sessions"
                />
                <i className="search-input-icon"></i>
            </div>
            <div className="message-list-container" >
                {
                    !sessionsMeta.length &&
                    <div className="message-item text-center">
                        <p>No chats yet</p>
                        {!allContacts.length && <p><small>Add friends to start chatting</small></p>}
                    </div>
                }
                {
                    !!sessionsMeta.length && sessionsMeta.map(session => {
                        const userId = session.user1 === getUser()._id ? session.user2 : session.user1;
                        const username = allContacts.find(item => item.contact._id === userId).contact.username;
                        return (
                            <div className={`message-item`}
                                key={userId}
                            ><div className={`chat-meta ${selectedChat === userId ? 'active' : ''}`} onClick={() => handleSelectChat(userId)}>
                                    <div className="chat-meta__profile-pic">
                                        <img src="user-filled-white.svg" className="profile-pic" alt="profile pic" />
                                    </div>
                                    <div className="chat-meta__meta">
                                        <div className="chat-meta__meta__sup">
                                            <div className="chat-meta__meta__sup__username_div">
                                                <span className="chat-meta__meta__sup__username_span">
                                                    {username}
                                                </span>
                                            </div>
                                            <div className="chat-meta__sup__date_div">
                                                <span className="chat-meta__sup__date_span">
                                                    {session?.lastMessageDate || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="chat-meta__meta__sub">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}