import { useEffect, useState } from "react";
import { useSocket } from "../../../contexts/SocketContext";
import { getUser } from "../../../utilities/services/user-service";
import { getRelativeDateString } from "../../../utilities/utils";

export default function ChatSessions({ onSelectChat, selectChat, clearSelection, onClearedSelection }) {
    const [selectedChat, setSelectedChat] = useState('');
    const [sessionsMeta, setSessionsMeta] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const { allContacts, sessionsCache, clearEmptySessions } = useSocket();

    useEffect(() => {
        if (selectChat) {
            setSelectedChat(selectChat);
            //onSelectChat(selectedChat);
        }
    }, [selectChat]);

    useEffect(() => {
        if (!clearSelection) return;
        setSelectedChat("");
        onClearedSelection();
    }, [clearSelection, onClearedSelection]);

    useEffect(() => {
        setSessionsMeta(prev => {
            const friendIds = Object.keys(sessionsCache);
            return friendIds.map(id => {
                const ret = sessionsCache[id].session;
                if(!sessionsCache[id].messages || !sessionsCache[id].messages.length){
                    ret.lastMessageDate = sessionsCache[id].lastMessageDate;
                }else{
                    ret.lastMessageDate = sessionsCache[id].messages[0].createdAt
                }
                console.log(ret);
                return ret;
            }).sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
        });
    }, [sessionsCache]);



    const handleSelectChat = (id) => {
        if (selectedChat && selectedChat === id) return;
        setSelectedChat(id);
        onSelectChat(id);
        clearEmptySessions();
    }


    return (
        <div className="chat-sessions-container">
            <div className={`${!allContacts.length && !sessionsMeta.length ? 'invisible' : ''}`}>
                <input
                    type="text"
                    className="login-input search-input"
                    name="filter-sessions"
                    placeholder="filter chats"
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
                                key={`meta_${username}`}
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
                                                    {(session?.updatedAt ? getRelativeDateString(new Date(session.lastMessageDate)) : '') || 'N/A'}
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