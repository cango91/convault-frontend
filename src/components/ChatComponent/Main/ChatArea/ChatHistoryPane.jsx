import { useEffect, useState } from "react";
import { useSocket } from "../../../../contexts/SocketContext";
import { socket } from "../../../../socket";

export default function ChatHistoryPane({ friendId }) {
    const { sessionsCache, createEmptySession } = useSocket();
    const [historyLocation, setHistoryLocation] = useState(0);

    const messages = sessionsCache[friendId].messages;
    const head = sessionsCache[friendId].session?.head;
    const session = sessionsCache[friendId].session?._id;

    useEffect(() => {
        if (!head) return;
        if (!messages.length) {
            if (head) {
                socket.emit('get-messages', { from: head, session })
            }
        }
        // if(messages[messages.length-1].previous){
        //     if(messages.length - historyLocation < 5){
        //         socket.emit('get-messages',{from: messages[messages.length-1].previous, session});
        //     }
        // }
    }, [messages, head, historyLocation, session]);
    return (
        <div className="chat-history">
            <div className="chat-message received">hello</div>
            <div className="chat-message received first-received">sup</div>
            <div className="chat-message sent last-sent">how u doing</div>
            <div className="chat-message sent">oo mein bruther</div>
            {
                messages && !!messages.length && messages.map(msg => {
                    return <div className="row" key={msg._id}>{msg.encryptedContent}</div>
                })
            }
        </div>
    );
}