import { createContext, useContext, useEffect, useState } from "react";
import { refreshUserTk } from "../utilities/services/user-service";
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
    const [allChats, setAllChats] = useState([]);
    const [friendRequestError, setFriendRequestError] = useState('');

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


        /** SOCIALS */
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

    useEffect(() => {
        function onAllSessions(data){
            const sortedSessions = data.sort((a,b)=>{
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
            console.log(data);
            setAllChats(sortedSessions);
        }
        
        function onSendMessage() {

        }

        function onMessageSent({ data }) {
            const sessionsCopy = []
        }

        function onMessageDelivered({ data }) {

        }

        function onMessageRead({ data }) {

        }

        function onMessageReceived({ data }) {

        }


        /** CHATS */
        // socket.on('send-message', onSendMessage);
        socket.on('all-sessions',onAllSessions);
        socket.on('message-sent', onMessageSent);
        socket.on('message-delivered', onMessageDelivered);
        socket.on('message-read', onMessageRead);
        socket.on('message-received', onMessageReceived);

        return () => {
            // socket.off('send-message', onSendMessage);
            socket.off('all-sessions',onAllSessions);
            socket.off('message-sent', onMessageSent);
            socket.off('message-delivered', onMessageDelivered);
            socket.off('message-read', onMessageRead);
            socket.off('message-received', onMessageReceived);
        }


    }, [allChats]);

    const resetFriendRequestError = () => setFriendRequestError('');

    const value = {
        isConnected,
        allContacts,
        friendRequestError,
        resetFriendRequestError,
    }

    return (
        <SocketContext.Provider value={value} >
            {children}
        </SocketContext.Provider>
    );

}