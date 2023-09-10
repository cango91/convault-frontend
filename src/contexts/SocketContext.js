import { createContext, useContext, useEffect, useState } from "react";
import { getUser, refreshUserTk } from "../utilities/services/user-service";
import { socket } from "../socket";

const SocketContext = createContext();

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

export function SocketProvider({ children }) {
    const [isConnected, setIsConnected] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [sessionsMeta, setSessionsMeta] = useState([]);
    const [sessionsCache, setSessionsCache] = useState({});
    const [friendRequestError, setFriendRequestError] = useState('');
    const [sendMessageError, setSendMessageError] = useState('');

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        async function onReauth() {
            const token = await refreshUserTk();
            socket.emit('reauth', { token });
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('reauth', onReauth);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('reauth', onReauth);
        }

    }, []);


    /** SOCIALS AND CHATS */
    useEffect(() => {
        const getStatusValue = (item) => {
            const { status, direction } = item.friendRequest;
            if (status === 'pending' && direction === 'received') return 1;
            if (status === 'accepted') return 2;
            if (status === 'pending' && direction === 'sent') return 3;
            if (item.blockedByContact || item.blockedContact) return 4;
            if (status === 'rejected') return 5;
            return 6;  // default, in case some unexpected value is in data
        };

        function onAllContacts(data) {
            const sortedData = data.sort((a, b) => {
                // Sort by friendRequest status & direction
                const valA = getStatusValue(a);
                const valB = getStatusValue(b);

                if (valA !== valB) return valA - valB;

                // Alphabetical sort if same category
                return a.contact.username.localeCompare(b.contact.username);
            });

            setAllContacts(sortedData);
        }



        function onFriendRequestSent({ data }) {
            let allContactsCopy = [...allContacts];
            const insertIndex = allContactsCopy.findIndex(item => {
                const { status, direction } = item.friendRequest;
                if (status === 'pending' && direction === 'received') return false;  // Skip top priority items
                if (status === 'accepted' && item.contact.username > data.contact.username) return true;  // Check for accepted status and username
                if (status === 'pending' && direction === 'sent' && item.contact?.username > data.contact.username) return true;  // Check for pending-sent status and username
                if (item.blockedByContact || item.blockedContact) return true;  // Check for blocked status
                if (status === 'rejected') return true;  // Check for rejected status

                return false;
            });

            if (insertIndex !== -1) {
                allContactsCopy.splice(insertIndex, 0, data);
            } else {
                allContactsCopy.push(data);
            }
            setAllContacts([...allContactsCopy]);
        }

        function onFriendRequestReceived({ data }) {
            let allContactsCopy = [...allContacts];
            const insertIndex = allContactsCopy.findIndex(item => {
                const { status, direction } = item.friendRequest;
                if (status === 'pending' && direction === 'received' && item.contact.username < data.contact.username) return false;
                return true;
            });
            if (insertIndex !== -1) {
                allContactsCopy.splice(insertIndex, 0, data);
            } else {
                allContactsCopy.push(data);
            }
            setAllContacts([...allContactsCopy]);
        }

        function onFriendRequestError(data) {
            setFriendRequestError(data.message);
        }

        function onFriendRequestAccepted({ data }) {
            const allContactsCopy = [...allContacts];
            const itemIdx = allContactsCopy.findIndex(item => item.friendRequest._id === data.friendRequest._id);
            allContactsCopy[itemIdx].friendRequest = {
                ...allContactsCopy[itemIdx].friendRequest,
                ...data.friendRequest
            };
            allContactsCopy[itemIdx].contact = {
                ...allContactsCopy[itemIdx].contact,
                ...data.contact
            };
            onAllContacts(allContactsCopy);
        }

        socket.on('all-contacts', onAllContacts);
        socket.on('friend-request-sent', onFriendRequestSent);
        socket.on('send-friend-request-error', onFriendRequestError);
        socket.on('friend-request-received', onFriendRequestReceived);
        socket.on('friend-request-accepted', onFriendRequestAccepted);



        return () => {
            socket.off('all-contacts', onAllContacts);
            socket.off('friend-request-sent', onFriendRequestSent);
            socket.off('send-friend-request-error', onFriendRequestError);
            socket.off('friend-request-received', onFriendRequestReceived);
            socket.off('friend-request-accepted', onFriendRequestAccepted);

        }
    }, [allContacts]);

    /** CHATS */

    useEffect(() => {
        function onAllSessions(data) {
            const sortedSessions = data.sort((a, b) => {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
            console.log(data);
            setSessionsMeta(sortedSessions);
            const sessions = {};
            data.forEach(session => {
                const id = session.user1 === getUser()._id ? session.user2 : session.user1;
                sessions[id] = {
                    messages: [],
                    unreadCount: session.unreadCount,
                    head: session.head,
                    lastMessageDate: session.lastMessageDate,
                };
            });
            setSessionsCache(sessions);
        }

        function onMessageSent({ data }) {
            if (!(data.message.recipientId in sessionsCache)) {
                setSessionsCache(prev => ({
                    ...prev, [data.message.recipientId]: {
                        messages: [],
                        unreadCount: 1,
                    }
                }));
                setSessionsMeta(prev => {
                    const newMeta = [...prev];
                    newMeta.unshift({
                        ...data.session,
                        unreadCount: 1,
                        lastMessageDate: data.message.createdAt
                    });
                    return newMeta;
                });
            }

            setSessionsCache(prev => {
                const newMessages = [...prev[data.message.recipientId].messages];
                newMessages.unshift(data.message);
                return {
                    ...prev,
                    [data.message.recipientId]: {
                        messages: newMessages,
                        unreadCount: prev[data.message.recipientId].unreadCount,
                        head: data.message._id,
                        lastMessageDate: data.message.createdAt,
                    }
                }
            });
            setSessionsMeta(prev => {
                const newMeta = [...prev];
                const idx = newMeta.findIndex(item => item.user1 === data.message.recipientId || item.user2 === data.message.recipientId);
                const session = newMeta.splice(idx, 1)[0];
                newMeta.unshift(session);
                return newMeta;
            });

        }

        function onMessageDelivered({ data }) {

        }

        function onMessageRead({ data }) {

        }
        function onMessageReceived({ data }) {
            if (!(data.message.senderId in sessionsCache)) {
                setSessionsCache(prev => ({
                    ...prev, 
                    [data.message.senderId]: {
                        messages: [],
                        unreadCount: 0,
                    }
                }));
                setSessionsMeta(prev => {
                    const newMeta = [...prev];
                    newMeta.unshift({
                        ...data.session,
                        unreadCount: 1,
                        lastMessageDate: data.message.createdAt
                    });
                    return newMeta;
                });
            }
            setSessionsCache(prev => {
                const newMessages = [...prev[data.message.senderId].messages];
                newMessages.unshift(data.message)
                return {
                    ...prev,
                    [data.message.senderId]: {
                        messages: newMessages,
                        unreadCount: prev[data.message.senderId].unreadCount + 1,
                        head: data.message._id,
                        lastMessageDate: data.message.createdAt,
                    }
                }
            });

        }


        /** CHATS */
        // socket.on('send-message', onSendMessage);
        socket.on('all-sessions', onAllSessions);
        socket.on('message-sent', onMessageSent);
        socket.on('message-delivered', onMessageDelivered);
        socket.on('message-read', onMessageRead);
        socket.on('message-received', onMessageReceived);

        return () => {
            // socket.off('send-message', onSendMessage);
            socket.off('all-sessions', onAllSessions);
            socket.off('message-sent', onMessageSent);
            socket.off('message-delivered', onMessageDelivered);
            socket.off('message-read', onMessageRead);
            socket.off('message-received', onMessageReceived);
        }


    }, []);

    const resetFriendRequestError = () => setFriendRequestError('');
    const resetSendMessageError = () => setSendMessageError('');
    const createEmptySession = (recipientId) => {
        if (!(recipientId in sessionsCache)) {
            const newSession = {
                unread: 0,
                messages: [],
            };
            setSessionsCache(prev => ({ ...prev, [recipientId]: newSession }));
            setSessionsMeta(prev => {
                const newMeta = [...prev];
                newMeta.unshift({
                    user1: getUser()._id,
                    user2: recipientId,
                });
                return newMeta;
            });
        }
    }
    const markRead = (senderId) => {
        if (senderId in sessionsCache) {
            const readMsgIds = sessionsCache[senderId].messages.filter(msg => msg.recipientId === getUser()._id && msg.status !== "read");
            if (readMsgIds.length) {
                socket.emit('messages-read', { ...readMsgIds });
            }
            setSessionsCache(prev => ({
                ...prev,
                [senderId]: {
                    ...prev[senderId],
                    unreadCount: 0
                }
            }));
            const newMeta = sessionsMeta.map(item => {
                if (item.user1 === senderId || item.user2 === senderId) {
                    return { ...item, unreadCount: 0 }
                }
                return { ...item };
            });
            setSessionsMeta(newMeta);
        }
    };

    const value = {
        isConnected,
        allContacts,
        sessionsCache,
        sessionsMeta,
        createEmptySession,
        markRead,
        sendMessageError,
        friendRequestError,
        resetFriendRequestError,
        resetSendMessageError,
    }

    return (
        <SocketContext.Provider value={value} >
            {children}
        </SocketContext.Provider>
    );

}