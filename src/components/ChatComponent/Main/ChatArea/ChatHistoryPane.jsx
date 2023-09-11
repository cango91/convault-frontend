import { useEffect, useState } from "react";
import { useSocket } from "../../../../contexts/SocketContext";
import { socket } from "../../../../socket";

export default function ChatHistoryPane({ friendId }) {
    const { sessionsCache, createEmptySession } = useSocket();
    const [historyLocation, setHistoryLocation] = useState(0);

    // useEffect(() => {
    //     let messages;
    //     try {
    //         messages = sessionsCache[friendId].messages;
    //     } catch (error) {
    //         // createEmptySession(friendId);
    //         return;
    //     }
    //     // const messages = sessionsCache[friendId].messages;
    //     if (!messages.length) {
    //         if (sessionsCache[friendId].head) {
    //             // fetch messages from head
    //             console.log('requesting messages');
    //             socket.emit('get-messages', {
    //                 from: sessionsCache[friendId].session.head,
    //                 session: sessionsCache[friendId].session
    //             });
    //         } else {
    //             return;
    //         }
    //     } else if (historyLocation > messages.length - 5 && messages[messages.length - 1].previous) {
    //         // fetch messages from last
    //         console.log('requesting messages from ', messages.length, ' and on');
    //         socket.emit('get-messages', {
    //             from: messages[messages.length - 1].previous,
    //             session: sessionsCache[friendId].session
    //         });
    //     }

    // }, [sessionsCache, friendId, historyLocation]);

    useEffect(() => {
        if(!friendId) return;
        // check if we have no messages stored
        const messages = sessionsCache[friendId].messages;
        if(!messages.length){
            // check if we have head
            if(sessionsCache[friendId].session?.head){
                console.log('gonna ask for head');
            }
        }

    }, [sessionsCache, friendId]);

return (
    <div className="chat-history">
        <div className="chat-message received">hello</div>
        <div className="chat-message received first-received">sup</div>
        <div className="chat-message sent last-sent">how u doing</div>
        <div className="chat-message sent">oo mein bruther</div>
        {
            sessionsCache[friendId] && !!sessionsCache[friendId].messages.length && sessionsCache[friendId].messages.map(msg => {
                return <div className="row" key={msg._id}>{msg.encryptedContent}</div>
            })
        }
    </div>
);
}