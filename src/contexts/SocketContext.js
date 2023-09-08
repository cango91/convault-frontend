import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getAccessToken, refreshUserTk } from "../utilities/services/user-service";

const SOCKET_URL = 'http://localhost:3000';


const SocketContext = createContext();

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

export function SocketProvider({ children }) {
    const [awaitAuth, setAwaitAuth] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const socket = useRef(null);

    // initial socket connection
    useEffect(() => {
        async function handleReauth() {
            setAwaitAuth(true);
            await refreshUserTk();
            socket.current.emit('reauth', { token: getAccessToken() });
            setAwaitAuth(false);
        }
        if (!isConnected) {
            setAwaitAuth(true);
            const token = getAccessToken();
            socket.current = io(SOCKET_URL, {
                query: { token }
            });
            setAwaitAuth(false);
            setIsConnected(true);
        }
        socket.current.on('reauth', handleReauth);
        return () => {
            if (isConnected && socket.current) {
                socket.current.off('reauth', handleReauth);
                socket.current.disconnect();
                setIsConnected(false);
            }
        }
    }, []);



    // retry connection if disconnected (mainly for reconnect during dev component updates)
    // useEffect(() => {
    //     if (awaitAuth || isConnected || !socket.current) return;
    //     setAwaitAuth(true);
    //     const token = getAccessToken();
    //     socket.current = io(SOCKET_URL, {
    //         query: { token }
    //     });
    //     setAwaitAuth(false);
    //     setIsConnected(true);
    //     const handleReauth = async () => {
    //         if (awaitAuth) return;
    //         setAwaitAuth(true);
    //         await refreshUserTk();
    //         const token = getAccessToken();
    //         socket.current.emit('reauth', { token });
    //         setAwaitAuth(false);
    //     }
    //     socket.current.on('reauth', handleReauth);
    //     return () => {
    //         if (isConnected && socket.current) {
    //             socket.current.off('reauth', handleReauth);
    //             socket.current.disconnect();
    //             setIsConnected(false);
    //         }
    //     }
    // }, [awaitAuth, isConnected]);

    return (
        <SocketContext.Provider value={{ socket: socket.current, awaitAuth }} >
            {isConnected && children}
        </SocketContext.Provider>
    );

}