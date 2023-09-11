import { useEffect, useRef } from "react";
import { useSocket } from "../../../contexts/SocketContext";
import { getAccessToken, refreshUserTk } from "../../../utilities/services/user-service";
import { socket } from "../../../socket";

export default function ConnectionIndicator() {
    const t = useRef(0);
    const backoff = useRef(1000);
    const { isConnected } = useSocket();

    const retryConnect = async () => {
        if (!isConnected) {
            console.warn("attempting to reconnect...");
            await refreshUserTk();
            socket.io.opts.query = {token: getAccessToken()};
            socket.connect();
            backoff.current *= 2;
            t.current = setTimeout(retryConnect, backoff.current);
        }
    }

    useEffect(()=>{
        if(isConnected){
            clearTimeout(t.current);
            backoff.current = 1000;
        }
    },[isConnected]);

    return (
        <div onClick={retryConnect} className={`connection-indicator ${isConnected ? 'connected' : t.current !== 0 || backoff.current > 1000 ? 'retrying' : 'disconnected'}`}></div>
    );
}