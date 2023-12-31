import { decode } from 'he';
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getUser, refreshUserTk } from "../utilities/services/user-service";
import { socket } from "../socket";
import { useCrypto } from "./CryptoContext";
import { checkPageStatus, sendNotification } from '../utilities/utils';

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
    // const [sessionsMeta, setSessionsMeta] = useState([]);
    const [sessionsCache, setSessionsCache] = useState({});
    const [friendRequestError, setFriendRequestError] = useState('');
    const [sendMessageError, setSendMessageError] = useState('');
    const { decryptAESGCM, decryptSymmetricKey,
        privateKey, manageContent } = useCrypto();

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
            const sessions = {};
            sortedSessions.forEach(session => {
                const id = session.user1 === getUser()._id ? session.user2 : session.user1;
                sessions[id] = {
                    messages: [],
                    unreadCount: session.unreadCount,
                    head: session.head,
                    lastMessageDate: session.lastMessageDate,
                    session: session
                };
            });
            setSessionsCache(sessions);
        }

        async function onMessageSent({ data }) {
            //const decryptedMessage = await decryptMessage(data.message);
            let decryptedMessage;
            if (data.message.encryptedContent) {
                decryptedMessage = await manageContent({
                    content: decode(data.message.encryptedContent),
                    key: decode(data.message.symmetricKey),
                    operation: 'decrypt',
                    direction: 'outgoing',
                    socket
                });
            } else {
                decryptedMessage = "";
            }
            data.message.decryptedContent = decryptedMessage;
            if (!(data.message.recipientId in sessionsCache)) {
                setSessionsCache(prev => ({
                    ...prev,
                    [data.message.recipientId]: {
                        messages: [data.message],
                        unreadCount: 1,
                        session: data.session,
                    },
                }));
            } else {
                setSessionsCache(prev => {
                    const key = data.message.recipientId;
                    const messages = [data.message].concat(prev[key].messages);
                    return {
                        ...prev,
                        [key]: {
                            ...prev[key],
                            messages,
                            unreadCount: prev[key].unreadCount + 1,
                            session: data.session,
                        }
                    }
                });
            }
        }


        function onMessageDelivered({ data }) {

        }

        function onMessageRead({ data }) {

        }
        async function onMessageReceived({ data }) {
            notify();
            if (data.message.encryptedContent) {
                data.message.decryptedContent = await manageContent({
                    content: decode(data.message.encryptedContent),
                    key: decode(data.message.symmetricKey),
                    operation: 'decrypt',
                    direction: 'incoming',
                    socket
                });
            } else {
                data.message.decryptedContent = "";
            }
            if (!(data.message.senderId in sessionsCache)) {
                setSessionsCache(prev => ({
                    ...prev,
                    [data.message.senderId]: {
                        messages: [data.message],
                        unreadCount: 1,
                        session: data.session,
                    },
                }));
            } else {
                setSessionsCache(prev => {
                    const key = data.message.senderId;
                    const messages = [data.message].concat(prev[key].messages);
                    return {
                        ...prev,
                        [key]: {
                            ...prev[key],
                            messages,
                            unreadCount: prev[key].unreadCount + 1,
                            session: data.session,
                        }
                    }
                });
            }
        }



        async function onMessagesRetrieved({ messages, session, from }) {
            if (messages.length) {
                // find the right session
                const sessionIdToFind = session;
                let owningKey = null;
                for (const [key, value] of Object.entries(sessionsCache)) {
                    if (value.session?._id === sessionIdToFind) {
                        owningKey = key;
                        break;
                    }
                }
                messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                for (let i = 0; i < messages.length; i++) {
                    if (messages[i].encryptedContent) {
                        messages[i].decryptedContent = await manageContent({
                            content: messages[i].encryptedContent,
                            key: messages[i].symmetricKey,
                            operation: 'decrypt',
                            direction: messages[i].senderId !== getUser()._id ? 'incoming' : 'outgoing',
                            socket
                        });
                    } else {
                        messages[i].decryptedContent = "";
                    }
                }
                setSessionsCache(prev => {
                    if (prev[owningKey]._fetched && prev[owningKey]._fetched.length) {
                        if (prev[owningKey]._fetched.includes(messages[0]._id)) return prev;
                    }
                    const insertIndex = prev[owningKey].messages.findIndex(msg => msg.previous === messages[0]._id);
                    if (insertIndex === -1) {
                        return {
                            ...prev,
                            [owningKey]: {
                                ...prev[owningKey],
                                messages,
                                _fetched: prev[owningKey]._fetched ? prev[owningKey]._fetched.concat([messages[0]._id]) : [messages[0]._id]
                            }
                        }
                    }
                    return {
                        ...prev,
                        [owningKey]: {
                            ...prev[owningKey],
                            messages: prev[owningKey].messages.slice(0, insertIndex).concat(messages),
                            _fetched: prev[owningKey]._fetched ? prev[owningKey]._fetched.concat([messages[0]._id]) : [messages[0]._id]
                        }
                    }
                });
            }
        }

        function onMessageDeleted({ id, other }) {
            setSessionsCache(prev => {
                const messages = [...(prev[other].messages)];
                const idx = messages.findIndex(msg => msg._id === id);
                if (idx < 0) {
                    return prev;
                }
                const msg = { ...prev[other].messages[idx] };
                msg.encryptedContent = "";
                msg.decryptedContent = "";
                if (msg.senderId === getUser()._id) {
                    msg.isDeletedSender = true;
                }
                msg.isDeletedRecipient = true;
                return {
                    ...prev,
                    [other]: {
                        ...prev[other],
                        messages: messages.slice(0, idx).concat([msg], messages.slice(idx + 1)),
                    }
                }
            });
        }

        function onThreadDeleted({ session }) {
            let owningKey = null;
            for (const [key, value] of Object.entries(sessionsCache)) {
                if (value.session?._id === session) {
                    owningKey = key;
                    break;
                }
            }
            if (owningKey) {
                const prev = { ...sessionsCache };
                delete prev[owningKey];
                setSessionsCache(prev);
            }
        }

        function sendNotification(){
            if (document.hidden) {
                if (document.hidden) {
                    const notification = new Notification("New message from Convault", {
                        icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22><tspan dx=%22-5%22>💬</tspan><tspan font-size=%2250%22 dy=%2210%22 dx=%22-55%22>🔐</tspan></text></svg>"
                    });
                    notification.onclick = () => function () {
                        window.open("https://convault-d603666b3d0b.herokuapp.com/chat");
                    }
                    new Audio('notification.mp3').play();
                }
            }
        }

        function notify() {
            if(!("Notification" in window)) {
                console.warn("This browser does not support system notifications!")
              } 
              else if(Notification.permission === "granted") {
                sendNotification();
              }
              else if(Notification.permission !== "denied") {
                 Notification.requestPermission((permission)=> {
                    if (permission === "granted") {
                      sendNotification();
                    }
                 })
              }
            
        }



        /** CHATS */
        // socket.on('send-message', onSendMessage);
        socket.on('all-sessions', onAllSessions);
        socket.on('message-sent', onMessageSent);
        socket.on('message-delivered', onMessageDelivered);
        socket.on('message-read', onMessageRead);
        socket.on('message-received', onMessageReceived);
        socket.on('message-deleted', onMessageDeleted);
        socket.on('messages-retrieved', onMessagesRetrieved);
        socket.on('thread-deleted', onThreadDeleted);

        return () => {
            // socket.off('send-message', onSendMessage);
            socket.off('all-sessions', onAllSessions);
            socket.off('message-sent', onMessageSent);
            socket.off('message-delivered', onMessageDelivered);
            socket.off('message-read', onMessageRead);
            socket.off('message-received', onMessageReceived);
            socket.off('message-deleted', onMessageDeleted);
            socket.off('messages-retrieved', onMessagesRetrieved);
            socket.off('thread-deleted', onThreadDeleted);
        }

    }, [sessionsCache, manageContent, privateKey, decryptAESGCM, decryptSymmetricKey]);

    const resetFriendRequestError = () => setFriendRequestError('');
    const resetSendMessageError = () => setSendMessageError('');
    const createEmptySession = (recipientId) => {
        if (!(recipientId in sessionsCache)) {
            const newSession = {
                messages: [],
                session: {
                    user1: getUser()._id,
                    user2: recipientId,
                    unreadCount: 0,
                }
            };
            setSessionsCache(prev => ({ ...prev, [recipientId]: newSession }));

        }
    }
    const markRead = (senderId) => {
        if (senderId in sessionsCache) {
            // const readMsgIds = sessionsCache[senderId].messages.filter(msg => msg.recipientId === getUser()._id && msg.status !== "read");
            // if (readMsgIds.length) {
            //     socket.emit('messages-read', { ...readMsgIds });
            // }
            setSessionsCache(prev => ({
                ...prev,
                [senderId]: {
                    ...prev[senderId],
                    unreadCount: 0
                }
            }));
        }
    };


    const clearEmptySessions = () => {
        setSessionsCache(prev => {
            const newState = { ...prev };
            for (let key in newState) {
                if (!newState[key].session?.head) {
                    delete newState[key];
                }
            }
            return newState;
        });
    }





    // async function decryptMessage({ encryptedContent, symmetricKey }) {
    //     try {
    //         const decryptedKey = await getDecryptedKey(symmetricKey);
    //         const decryptedMessage = await decryptAESGCM(encryptedContent, decryptedKey);
    //         return decryptedMessage;
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }


    // async function getDecryptedKey(key) {
    //     if (sessionKeyStore[key]) return sessionKeyStore[key];
    //     const decryptedKey = await decryptSymmetricKey(key, privateKey);
    //     setSessionKeyStore(prev => ({ ...prev, [key]: decryptedKey }));
    //     return decryptedKey;
    // }

    const value = {
        isConnected,
        allContacts,
        sessionsCache,
        createEmptySession,
        clearEmptySessions,
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