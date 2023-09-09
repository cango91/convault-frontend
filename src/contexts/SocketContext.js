import { createContext, useContext, useEffect, useRef, useState } from "react";
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


    /** SOCIALS */
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


        socket.on('all-contacts', onAllContacts);
        socket.on('friend-request-sent', onFriendRequestSent);
        socket.on('send-friend-request-error', onFriendRequestError);
        socket.on('friend-request-received', onFriendRequestReceived);

        return () => {
            socket.off('all-contacts', onAllContacts);
            socket.off('friend-request-sent', onFriendRequestSent);
            socket.off('send-friend-request-error', onFriendRequestError);
            socket.off('friend-request-received', onFriendRequestReceived);
        }
    }, [allContacts]);

    const resetFriendRequestError = () => setFriendRequestError('');

    const value = {
        isConnected,
        setIsConnected,
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