import { useEffect, useState } from "react";
import { useSocket } from "../../../../contexts/SocketContext";
import { socket } from "../../../../socket";
import { getUser } from "../../../../utilities/services/user-service";
import {decode} from 'he';

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
            return;
        }
        if (messages[messages.length - 1].previous) {
            if (messages.length - historyLocation < 5) {
                socket.emit('get-messages', { from: messages[messages.length - 1].previous, session });
            }
        }
    }, [messages, head, historyLocation, session]);

    return (
        <div className="chat-history">
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
                    }else{
                        if (idx === 0
                            || (idx > 0 && messages[idx - 1].recipientId !== userId)
                        ) {
                            decoration = 'last-received';
                        }
                    }

                    return (
                        <div className={`chat-message ${direction} ${decoration}`}>
                            {decode(msg.encryptedContent)}
                        </div>
                    );
                })
            }
        </div>
    );
}