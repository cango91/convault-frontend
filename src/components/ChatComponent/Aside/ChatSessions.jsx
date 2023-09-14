import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../contexts/SocketContext";
import { getUser } from "../../../utilities/services/user-service";
import { getRelativeDateString } from "../../../utilities/utils";
import { socket } from "../../../socket";

export default function ChatSessions({ onSelectChat, selectChat, clearSelection, onClearedSelection }) {
    const [selectedChat, setSelectedChat] = useState('');
    const [sessionsMeta, setSessionsMeta] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const { allContacts, sessionsCache, clearEmptySessions } = useSocket();

    const popupRef = useRef(null);
    const caretRefObj = useRef({});

    const updateFavicon = (unreadCount) => {
        const linkEl = document.querySelector("link[rel~='icon']");
        if (!linkEl) return;
        if(unreadCount > 9) unreadCount="9+"
        const newFaviconData = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22><tspan dx=%22-5%22>💬</tspan><tspan font-size=%2250%22 dy=%2210%22 dx=%22-55%22>🔐</tspan></text>${unreadCount ? `<circle cx=%2260%22 cy=%2235%22 r=%2235%22 fill=%22%2300a884%22></circle><text x=%2260%22 y=%2250%22 font-size=%2250%22 fill=%22%23FFFFFF%22 text-anchor=%22middle%22>${unreadCount}</text>` : ''}</svg>`;

        linkEl.href = newFaviconData;
    }
    /*
    <circle cx=%2210%22 cy=%2210%22 r=%2210%22 fill=%22#00a884%22></circle>
        <text x=%2210%22 y=%2215%22 font-size=%2215%22 fill=%22#FFFFFF%22 text-anchor=%22middle%22>${unreadCount}</text>
    */

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
                if (!sessionsCache[id].messages || !sessionsCache[id].messages.length) {
                    ret.lastMessageDate = sessionsCache[id].lastMessageDate;
                } else {
                    ret.lastMessageDate = sessionsCache[id].messages[0].createdAt
                }
                ret.unreadCount = sessionsCache[id].unreadCount;
                return ret;
            }).sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
        });
        const totalUnread = Object.values(sessionsCache).reduce((acc, el) => acc + el.unreadCount, 0);
        updateFavicon(totalUnread);
    }, [sessionsCache]);

    // background click to close 
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                if (caretRefObj.current && !Object.values(caretRefObj.current).some(val => val.contains(e.target)))
                    setShowPopup(false);
            }

        }
        document.addEventListener('mouseup', handleClickOutside);
        return () => document.removeEventListener('mouseup', handleClickOutside);

    }, []);



    const handleSelectChat = (id) => {
        if (selectedChat && selectedChat === id) {
            onSelectChat(id);
            return;
        }
        setSelectedChat(id);
        onSelectChat(id);
        clearEmptySessions();
    }

    const revealPopup = (id) => {
        if (id === selectedChat) {
            setShowPopup(!showPopup);
        } else {
            setShowPopup(true);
        }
    }


    const handleDeleteThread = () => {
        socket.emit('delete-thread', { session: sessionsCache[selectedChat].session._id });
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
                    !!sessionsMeta.length && sessionsMeta.map((session, idx) => {
                        const userId = session.user1 === getUser()._id ? session.user2 : session.user1;
                        const contact = allContacts.find(item => item.contact._id === userId).contact
                        const username = contact.username;
                        const unreadCount = session.unreadCount;
                        return (
                            <div className={`message-item`}
                                key={`meta_${username}`}
                            ><div className={`chat-meta ${selectedChat === userId ? 'active' : ''}`} onClick={() => handleSelectChat(userId)}>
                                    <div className="chat-meta__profile-pic">
                                        <img src="user-filled-white.svg" className="profile-pic" alt="profile pic" />
                                    </div>
                                    <div className="chat-meta__meta">
                                        <div className="popup"
                                            ref={popupRef}
                                            style={{ display: showPopup && userId === selectedChat ? 'block' : 'none' }}>
                                            <button onClick={handleDeleteThread} className="popup-btn">Delete Conversation</button>
                                        </div>
                                        <div className="caret" ref={el => caretRefObj.current[userId] = el} onClick={() => revealPopup(userId)}>‸</div>
                                        <div className="chat-meta__meta__sup">
                                            <div className="chat-meta__meta__sup__username_div">
                                                <span className="chat-meta__meta__sup__username_span">
                                                    {username}
                                                </span>
                                            </div>
                                            <div className="chat-meta__sup__date_div">
                                                <span className={`chat-meta__sup__date_span ${unreadCount ? 'unread' : ''}`}>
                                                    {(session?.updatedAt ? getRelativeDateString(new Date(session.lastMessageDate)) : '') || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="chat-meta__meta__sub">
                                            {!!unreadCount &&
                                                <div className="chat-meta__meta__sub__unread">
                                                    <span className="chat-meta__meta__sub__unread-badge">
                                                        {unreadCount}
                                                    </span>
                                                </div>
                                            }
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