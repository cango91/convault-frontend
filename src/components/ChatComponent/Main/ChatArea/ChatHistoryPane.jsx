import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../../../../contexts/SocketContext";
import { socket } from "../../../../socket";
import { getUser } from "../../../../utilities/services/user-service";
import { decode } from 'he';
import { trimWhiteSpace } from "../../../../utilities/utils";
import ChatSessions from "../../Aside/ChatSessions";

export default function ChatHistoryPane({ friendId }) {
    const { sessionsCache, markRead } = useSocket();
    const [remainingScroll, setRemainingScroll] = useState(301);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState('');

    const chatContainerRef = useRef(null);
    const lastMessageRef = useRef(null);
    const popupRef = useRef(null);

    const messages = sessionsCache[friendId]?.messages;
    const head = sessionsCache[friendId]?.session?.head;
    const session = sessionsCache[friendId]?.session?._id;
    const nextMsg = (messages?.length && messages[messages.length - 1]?.previous) || null;

    useEffect(() => {
        if (!head || !messages) return;
        if (!messages.length) {
            if (head) {
                socket.emit('get-messages', { from: head, session, count: 30 });
            }
            return;
            // Edge case: if you haven't visited a chat, and you get a few messages in that chat,
            // but not enough for scroll bar to appear, you will only see the new incoming messages
            // This check is aimed to ensure that's not the case
        } else if (messages.length < 30 && messages[messages.length - 1].previous) {
            socket.emit('get-messages', { from: head, session, count: 30 });
            return;
        }
    }, [messages, head, session]);

    useEffect(() => {
        if (!nextMsg) return;
        if (remainingScroll < 300) {
            socket.emit('get-messages', { from: nextMsg, session, count: 30 })
        }
    }, [remainingScroll, session, nextMsg]);

    useEffect(() => {
        if (!messages) return;
        const handleScroll = () => {
            if (!lastMessageRef.current) return;
            const lastMessageRect = lastMessageRef.current.getBoundingClientRect();
            const containerRect = chatContainerRef.current.getBoundingClientRect();
            setRemainingScroll(containerRect.top - lastMessageRect.bottom);
        }
        const chatContainer = chatContainerRef.current;
        chatContainer.addEventListener('scroll', handleScroll);

        return () => {
            chatContainer.removeEventListener('scroll', handleScroll);
        }
    }, [messages]);

    // background click to close 
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setShowPopup(false);
            }
        }
        document.addEventListener('mouseup', handleClickOutside);
        return () => document.removeEventListener('mouseup', handleClickOutside);

    }, []);

    useEffect(() => {
        if (!showPopup) setSelectedMessage('');
    }, [showPopup]);


    // const getUnreadMessages = useCallback(() => {
    //     if (!sessionsCache || !friendId || !sessionsCache[friendId] || !sessionsCache[friendId].messages || !sessionsCache[friendId].messages.length) return [];
    //     return sessionsCache[friendId].messages.filter((msg) => !msg.isDeletedRecipient && msg.senderId === friendId && !["deleted","read"].includes(msg.status)  );
    // }, [sessionsCache, friendId]);

    // useEffect(() => {
    //     const unread = getUnreadMessages();
    //     if(unread.length){
    //         socket.emit("read")
    //     }
    // }, [getUnreadMessages]);

    // useEffect(() => {
    //     if (!friendId || !sessionsCache || !sessionsCache[friendId] || !sessionsCache[[friendId].unreadCount]) return;
    //     // if (sessionsCache[friendId].messages.some(msg => msg.senderId === friendId && !["deleted", "read"].includes(msg.status) && !msg.isDeletedRecipient)) {
    //     socket.emit('read-messages', { senderId: friendId });
    //     markRead(friendId);
    //     console.log('i call you')

    // }, [friendId, sessionsCache, markRead]);

    useEffect(() => {
        if (!friendId || !sessionsCache || !sessionsCache[friendId]?.unreadCount) return;
        socket.emit('read-messages', { senderId: friendId });
        markRead(friendId);
    }, [sessionsCache, friendId]);




    const handleCaretClick = (id, e) => {
        if (selectedMessage && id === selectedMessage) {
            setShowPopup(false);
            return;
        } else {
            setShowPopup(true);
        }
        setSelectedMessage(id);
    }

    const handleDelete = (id) => {
        socket.emit('delete-message', { id });
    }

    const handleDeleteForBoth = (id) => {
        socket.emit('delete-message', { id, both: true });
    }



    return (
        <div className="chat-history" ref={chatContainerRef}>
            {
                messages && !!messages.length && messages.map((msg, idx) => {
                    const userId = getUser()._id;
                    const direction = msg.recipientId === userId ? 'received' : 'sent';
                    let decoration = '';
                    let content = msg.decryptedContent;
                    if (direction === 'sent') {
                        if (idx === 0
                            || (idx > 0 && messages[idx - 1].recipientId === userId)
                        ) {
                            decoration = 'last-sent';
                        }
                        if (msg.isDeletedSender) content = <span className="deleted-message">deleted message</span>;
                    } else {
                        if (idx === 0
                            || (idx > 0 && messages[idx - 1].recipientId !== userId)
                        ) {
                            decoration = 'last-received';
                        }
                        if (msg.isDeletedRecipient) content = <span className="deleted-message">deleted message</span>;
                    }

                    if (idx === messages.length - 1) {
                        return (
                            <div key={msg._id} ref={lastMessageRef} className={`chat-message ${direction} ${decoration} ${showPopup && msg._id === selectedMessage ? 'show-caret' : ''}`}>
                                <div className="message-content">
                                    {content}
                                    <div className="popup"
                                        ref={popupRef}
                                        style={{ display: showPopup && msg._id === selectedMessage ? 'block' : 'none' }}>
                                        <button className="popup-btn" onClick={() => handleDelete(msg._id)}>Delete</button>
                                        {direction === 'sent' && <button className="popup-btn" onClick={() => handleDeleteForBoth(msg._id)}>Delete for Both</button>}
                                    </div>
                                </div>
                                <div className="timestamp">
                                    {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    <div onClick={(e) => handleCaretClick(msg.encryptedContent ? msg._id : '', e)} className="caret">‸</div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={msg._id}
                            className={`chat-message 
                        ${direction} ${decoration} ${showPopup && msg._id === selectedMessage ? 'show-caret' : ''}`}>
                            <div className="message-content">
                                {content}
                                <div className="popup"
                                    ref={popupRef}
                                    style={{ display: showPopup && msg._id === selectedMessage ? 'block' : 'none' }}>
                                    <button className="popup-btn" onClick={() => handleDelete(msg._id)}>Delete</button>
                                    {direction === 'sent' && <button className="popup-btn" onClick={() => handleDeleteForBoth(msg._id)}>Delete for Both</button>}
                                </div>
                            </div>
                            <div className="timestamp">
                                {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                <div onClick={(e) => handleCaretClick(msg.encryptedContent ? msg._id : '', e)} className="caret">‸</div>
                            </div>
                        </div>
                    );
                })
            }
        </div>
    );
}