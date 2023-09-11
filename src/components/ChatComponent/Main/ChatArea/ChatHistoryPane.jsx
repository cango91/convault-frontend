import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../../contexts/SocketContext";
import { socket } from "../../../../socket";
import { getUser } from "../../../../utilities/services/user-service";
import { decode } from 'he';

export default function ChatHistoryPane({ friendId }) {
    const { sessionsCache, createEmptySession } = useSocket();
    const [remainingScroll, setRemainingScroll] = useState(301);

    const chatContainerRef = useRef(null);
    const lastMessageRef = useRef(null);

    const messages = sessionsCache[friendId].messages;
    const head = sessionsCache[friendId].session?.head;
    const session = sessionsCache[friendId].session?._id;
    const nextMsg = (messages.length && messages[messages.length-1].previous )|| null;

    useEffect(() => {
        if (!head) return;
        if (!messages.length) {
            if (head) {
                socket.emit('get-messages', { from: head, session, count:30 });
            }
            return;
        }
    }, [messages, head, session]);

    useEffect(()=>{
        if(!nextMsg) return;
        if(remainingScroll < 300){
            socket.emit('get-messages', { from: nextMsg, session, count: 30 })
        }
    },[remainingScroll,session, nextMsg]);

    useEffect(() => {
        const handleScroll = () => {
            if(!lastMessageRef.current) return;
            const lastMessageRect = lastMessageRef.current.getBoundingClientRect();
            const containerRect = chatContainerRef.current.getBoundingClientRect();
            setRemainingScroll(containerRect.top-lastMessageRect.bottom);
        }
        const chatContainer = chatContainerRef.current;
        chatContainer.addEventListener('scroll', handleScroll);

        return () => {
            chatContainer.removeEventListener('scroll', handleScroll);
        }
    }, [messages]);

    return (
        <div className="chat-history" ref={chatContainerRef}>
            {
                messages && !!messages.length && messages.map((msg, idx) => {
                    const userId = getUser()._id;
                    const direction = msg.recipientId === userId ? 'received' : 'sent';
                    let decoration = '';
                    if (direction === 'sent') {
                        if (idx === 0
                            || (idx > 0 && messages[idx - 1].recipientId === userId)
                        ) {
                            decoration = 'last-sent';
                        }
                    } else {
                        if (idx === 0
                            || (idx > 0 && messages[idx - 1].recipientId !== userId)
                        ) {
                            decoration = 'last-received';
                        }
                    }

                    if (idx === messages.length - 1) {
                        return (
                            <div key={msg._id} ref={lastMessageRef} className={`chat-message ${direction} ${decoration}`}>
                                {decode(msg.encryptedContent)}
                            </div>
                        );
                    }

                    return (
                        <div key={msg._id} className={`chat-message ${direction} ${decoration}`}>
                            {decode(msg.encryptedContent)}
                        </div>
                    );
                })
            }
        </div>
    );
}