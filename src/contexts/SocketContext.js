import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getAccessToken, setAccessToken } from "../utilities/services/user-service";
import { refreshUser } from "../utilities/api/users-api";

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
    const socket = useRef(null);
    
    // Initial handshake with current user token.
    useEffect(() => {
        const getFreshToken = () => new Promise(async (resolve, reject) => {
            try {
                const response = await refreshUser();
                setAccessToken(response.accessToken)
                resolve(getAccessToken());
            } catch (error) {
                reject(error);
            }
        });
        const t = setTimeout(()=> {getFreshToken()
            .catch(console.error)
            .then(token => {
                socket.current = io(SOCKET_URL, {
                    query: { token }
                });
                socket.current.on('reauth', () => {
                    setAwaitAuth(true);
                    getFreshToken()
                    .catch(console.error)
                    .then(token => {
                        socket.current.emit('reauth', { token });
                        setAwaitAuth(false);
                    });     
                });
            });},0);
        return () => {
            if (socket.current)
                socket.current.disconnect();
            clearTimeout(t);
        }
    }, []);

    return (
        <SocketContext.Provider value={socket} >
            {children}
        </SocketContext.Provider>
    );
}