import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getAccessToken, refreshUserTk } from "../utilities/services/user-service";
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
    const [socialEvents, setSocialEvents] = useState([]);
    const [messageEvents, setMessageEvents] = useState([]);

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





    const value = {
        isConnected,
        socialEvents,
        messageEvents,
    }


    return (
        <SocketContext.Provider value={value} >
            {children}
        </SocketContext.Provider>
    );

}