import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getAccessToken, refreshUserTk, setAccessToken } from "../utilities/services/user-service";
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
                await refreshUserTk();
                resolve(getAccessToken());
            } catch (error) {
                reject(error);
            }
        });
        setAwaitAuth(true);
        getFreshToken()
            .catch(console.error)
            .then(token => {
                socket.current = io(SOCKET_URL, {
                    query: { token }
                });
                setAwaitAuth(false);
                socket.current.on('reauth', () => {
                    setAwaitAuth(true);
                    getFreshToken()
                        .catch(console.error)
                        .then(token => {
                            socket.current.emit('reauth', { token });
                            setAwaitAuth(false);
                        });
                });
            });
        return () => {
            if (socket.current) {
                socket.current.off('reauth');
                socket.current.disconnect();
            }
        }
    }, []);

    return (
        <SocketContext.Provider value={{socket: socket.current, awaitAuth}} >
            {children}
        </SocketContext.Provider>
    );
}